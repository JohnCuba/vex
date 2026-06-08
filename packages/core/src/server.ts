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
import { resolveViteConfig } from './bundler/resolve';
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
    const envConfig = Container.inject('env');
    const { createServer } = await import('vite');
    return createServer({
      server: { middlewareMode: true },
      appType: 'custom',
      ...(await resolveViteConfig(envConfig, appConfig)),
    });
  };

  private static createStaticServer = async () => {
    if (Env.isDev()) return null;
    return (await import('@fastify/static')).default;
  };

  static create = async () => {
    const appConfig = Container.inject('appConfig');
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

    const routesDir = Env.resolver({
      development: path.join(process.cwd(), 'src', appConfig.paths.routes),
      production: path.join(process.cwd(), 'dist', 'server', appConfig.paths.routes),
    });

    const router = await Router.create(routesDir, viteDevServer);

    const controller = new Controller({ viteDevServer, router, routesDir });

    return new Server(fastify, controller);
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
}
