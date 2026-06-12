import path from 'node:path';
import Fastify, {
  type FastifyInstance,
  type RawServerDefault,
  type RawRequestDefaultExpression,
  type RawReplyDefaultExpression,
  type FastifyTypeProviderDefault,
} from 'fastify';
import fastifyMiddie from '@fastify/middie';
import type { ViteDevServer } from 'vite';
import { Controller } from './controller';
import { Router } from './router';
import * as Env from './env';
import * as Container from './container';
import * as Logger from './logger';

export class Server {
  private constructor(
    private fastify: FastifyInstance<
      RawServerDefault,
      RawRequestDefaultExpression,
      RawReplyDefaultExpression,
      Logger.Logger,
      FastifyTypeProviderDefault
    >,
    private controller: Controller,
    private viteDevServer: ViteDevServer | null,
  ) {}

  private static createFastify = async () => {
    const fastify = Fastify({
      loggerInstance: Container.inject('logger'),
    });
    await fastify.register(fastifyMiddie);
    return fastify;
  };

  private static createViteDevServer = async (): Promise<ViteDevServer | null> => {
    if (Env.isProd()) return null;
    const appConfig = Container.inject('appConfig');
    const { createServer } = await import('vite');
    return createServer({
      server: { middlewareMode: true },
      appType: 'custom',
      ...appConfig.vite,
    });
  };

  private static createStaticServer = async () => {
    if (Env.isDev()) return null;
    return (await import('@fastify/static')).default;
  };

  static create = async () => {
    const fastify = await this.createFastify();

    const viteDevServer = await this.createViteDevServer();
    if (viteDevServer) fastify.use(viteDevServer.middlewares);

    const staticServer = await this.createStaticServer();
    if (staticServer) {
      fastify.register(staticServer, {
        root: path.join(process.cwd(), 'dist', 'client', 'assets'),
        prefix: '/assets/',
      });
    }

    const router = await Router.create(viteDevServer);

    const controller = new Controller({ viteDevServer, router });

    return new Server(fastify, controller, viteDevServer);
  };

  start = async () => {
    try {
      const appConfig = Container.inject('appConfig');
      this.fastify.all('/*', this.controller.handleRequest);
      await this.fastify.listen({ port: appConfig.port });
    } catch (err) {
      this.fastify.log.error(err);
      process.exit(1);
    }
  };

  stop = async () => {
    await this.fastify.close();
    if (this.viteDevServer) await this.viteDevServer.close();
  };
}
