import Fastify, {
  type FastifyInstance,
  type RawServerDefault,
  type RawRequestDefaultExpression,
  type RawReplyDefaultExpression,
  type FastifyTypeProviderDefault,
} from 'fastify'
import fastifyMiddie from '@fastify/middie'
import type { ViteDevServer, ConfigEnv } from 'vite'
import path from 'node:path'
import { logger } from './logger'
import { Controller } from './controller'
import type { ResolvedAppConfig } from './types'
import { resolveViteConfig } from './configResolvers'

type ServerConfig = {
  appConfig: ResolvedAppConfig
  env: ConfigEnv
}

export class Server {
  private constructor(
    private config: ServerConfig,
    private fastify: FastifyInstance<RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, typeof logger, FastifyTypeProviderDefault>,
    private controller: Controller
  ) {}

  private static createFastify = async () => {
    const fastify = Fastify({
      loggerInstance: logger,
    })

    await fastify.register(fastifyMiddie)

    return fastify
  }

  private static createViteDevServer = async (config: ServerConfig): Promise<ViteDevServer | null> => {
    if (config.env.mode !== 'development') return null;

    const { createServer } = await import('vite')
    return await createServer({
      server: {
        middlewareMode: true,
      },
      appType: 'custom',
      ...await resolveViteConfig(config.env, config.appConfig),
    });
  }

  private static createStaticServer = async (config: ServerConfig) => {
    if (config.env.mode === 'development') return null;

    const staticServer = await import('@fastify/static')
    return staticServer.default
  }

  static create = async (config: ServerConfig) => {
    const fastify = await this.createFastify()

    const viteDevServer = await this.createViteDevServer(config)
    viteDevServer && fastify.use(viteDevServer.middlewares)

    const staticServer = await this.createStaticServer(config)
    staticServer && fastify.register(staticServer, {
      root: path.join(process.cwd(), 'dist', 'client', 'assets'),
      prefix: '/assets/'
    })

    const controller = new Controller({
      viteDevServer,
      appConfig: config.appConfig,
    })

    return new Server(
      config,
      fastify,
      controller,
    )
  }

  start = async () => {
    try {
      this.fastify.all('/*', this.controller.handleRequest)

      await this.fastify.listen({
        port: this.config.appConfig.port
      })
    } catch (err) {
      this.fastify.log.error(err)
      process.exit(1)
    }
  }
}
