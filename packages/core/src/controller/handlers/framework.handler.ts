import fs from 'node:fs/promises';
import path from 'node:path';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ViteDevServer } from 'vite';
import { transformHtmlTemplate, type SSRHeadPayload, type Unhead } from 'unhead/server';
import type { ServerAppRenderer, ConfigModule } from '@src/types';
import type { RouteHandler } from './interface';
import * as Env from '@src/env';
import * as Container from '@src/container';
import { loadModule } from '@src/loader';

type SsrManifest = Record<string, string[]>;

export class FrameworkHandler implements RouteHandler {
  private template?: string;
  private entryServer?: ServerAppRenderer<unknown>;
  private manifest?: SsrManifest;

  constructor(private viteDevServer: ViteDevServer | null) {}

  private getManifest = async (): Promise<SsrManifest> => {
    if (!this.manifest) {
      const manifestPath = path.join(process.cwd(), 'dist', 'client', '.vite', 'ssr-manifest.json');
      this.manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8')) as SsrManifest;
    }
    return this.manifest;
  };

  private getStyles = async (modules: Set<string> | undefined): Promise<string> => {
    if (!modules?.size) return '';
    const manifest = await this.getManifest();
    const hrefs = new Set<string>();
    for (const id of modules) {
      const files = manifest[id];
      if (!files) continue;
      for (const file of files) {
        if (file.endsWith('.css')) hrefs.add(file);
      }
    }
    return [...hrefs].map((href) => `<link rel="stylesheet" href="${href}">`).join('');
  };

  private getTemplate = async () => {
    if (!this.template || Env.isDev()) {
      const templatePath = Env.resolver({
        development: path.join(process.cwd(), 'index.html'),
        production: path.join(process.cwd(), 'dist', 'client', 'index.html'),
      });
      this.template = await fs.readFile(templatePath, { encoding: 'utf-8' });
    }
    return this.template;
  };

  private getEntryServer = async () => {
    if (!this.entryServer || Env.isDev()) {
      const entryServerPath = Env.resolver({
        development: path.join(process.cwd(), 'src', 'entryPoints', 'server.ts'),
        production: path.join(process.cwd(), 'dist', 'server', 'entryPoints', 'server.js'),
      });

      const module = await loadModule<ConfigModule<ServerAppRenderer<unknown>>>(
        entryServerPath,
        this.viteDevServer,
      );

      this.entryServer = module.default;
    }
    return this.entryServer;
  };

  handleRequest = async (
    handlerModule: unknown,
    handlerPath: string,
    req: FastifyRequest,
    rep: FastifyReply,
  ): Promise<void> => {
    const appConfig = Container.inject('appConfig');
    let template = await this.getTemplate();
    const entryServer = await this.getEntryServer();

    if (this.viteDevServer) {
      template = await this.viteDevServer.transformIndexHtml(req.url, template);
    }

    // routeKey matches the key in virtual:vex-routes on the client
    // e.g. routesDir=/app/src/routes, handlerPath=/app/src/routes/blog/post.ts → 'routes/blog/post'
    const routeKey = path
      .relative(path.join(appConfig.paths.routes, '..'), handlerPath)
      .split(path.sep)
      .join('/')
      .replace(/\.[^/.]+$/, '');

    const { appHtml, stateHtml, ctx, head } = await entryServer!(
      handlerModule as Parameters<ServerAppRenderer<unknown>>[0],
      req,
      rep,
    );

    if (head) {
      template = await transformHtmlTemplate(head as Unhead<any, SSRHeadPayload>, template);
    }

    template = template.replace('<!--SSR-APP-->', appHtml);

    if (!this.viteDevServer) {
      const styles = await this.getStyles(ctx?.modules);
      template = template.replace('<!--SSR-STYLES-->', styles);
    }

    if (stateHtml) {
      template = template.replace(
        '<!--SSR-STATE-->',
        `<script type="application/json" id="__VEX_STATE__">${stateHtml.replace(/</g, '\\u003c')}</script>`,
      );
    }

    template = template.replace(
      '<!--SSR-ROUTES-->',
      `<script>window.__VEX_ROUTE__ = '${routeKey}'</script>`,
    );

    rep.header('Content-Type', 'text/html').send(template);
  };
}
