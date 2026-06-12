import fs from 'node:fs/promises';
import path from 'node:path';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ViteDevServer } from 'vite';
import { transformHtmlTemplate, type SSRHeadPayload, type Unhead } from 'unhead/server';
import type { ServerAppRenderer, ConfigModule } from '@src/types';
import type { RouteHandler } from './interface';
import * as Container from '@src/container';
import { loadModule } from '@src/loader';

export class FrameworkHandler implements RouteHandler {
  private template?: string;
  private entryServer?: ServerAppRenderer<unknown>;

  constructor(private viteDevServer: ViteDevServer | null) {}

  private getStyles = async (modules: Set<string> | undefined): Promise<string> => {
    if (!modules?.size) return '';

    const appConfig = Container.inject('appConfig');
    if (!appConfig.manifests.ssr) return '';

    const hrefs = new Set<string>();
    for (const id of modules) {
      const files = appConfig.manifests.ssr[id];
      if (!files) continue;
      for (const file of files) {
        if (file.endsWith('.css')) hrefs.add(file);
      }
    }
    return [...hrefs].map((href) => `<link rel="stylesheet" href="${href}">`).join('');
  };

  private getTemplate = async () => {
    const env = Container.inject('env');
    if (!this.template || env.mode === 'development') {
      const appConfig = Container.inject('appConfig');
      this.template = await fs.readFile(appConfig.paths.template, { encoding: 'utf-8' });
    }
    return this.template;
  };

  private getEntryServer = async () => {
    const env = Container.inject('env');
    if (!this.entryServer || env.mode === 'development') {
      const appConfig = Container.inject('appConfig');

      const module = await loadModule<ConfigModule<ServerAppRenderer<unknown>>>(
        appConfig.paths.entryServer,
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
