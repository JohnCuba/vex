import path from 'node:path';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ViteDevServer } from 'vite';
import { transformHtmlTemplate, type SSRHeadPayload, type Unhead } from 'unhead/server';
import type { ServerAppRenderer, ConfigModule } from '@src/types';
import type { RouteHandler } from './interface';
import * as Container from '@src/container';
import { loadModule } from '@src/loader';
import { AppTemplate } from '../templates/app.template';

export class FrameworkHandler implements RouteHandler {
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
    const template = await AppTemplate.load();
    const entryServer = await this.getEntryServer();

    if (this.viteDevServer) {
      template.value = await this.viteDevServer.transformIndexHtml(req.url, template.value);
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
      template.value = await transformHtmlTemplate(head as Unhead<any, SSRHeadPayload>, template.value);
    }

    template.app = appHtml;

    if (!this.viteDevServer) {
      template.styles = await this.getStyles(ctx?.modules);
    }

    if (stateHtml) {
      template.state =
        `<script type="application/json" id="__VEX_STATE__">${stateHtml.replace(/</g, '\\u003c')}</script>`;
    }

    template.routes = `<script>window.__VEX_ROUTE__ = '${routeKey}'</script>`;

    rep.header('Content-Type', 'text/html').send(template.render());
  };
}
