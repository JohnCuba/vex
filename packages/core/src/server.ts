import Fastify, {
  type FastifyInstance,
  type RawServerDefault,
  type RawRequestDefaultExpression,
  type RawReplyDefaultExpression,
  type FastifyTypeProviderDefault,
} from 'fastify'
import type { Controller } from './controller'
import { logger } from './logger'

type ServerConfig = {
  controller: Controller
}

export class Server {
  private fastify: FastifyInstance<RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, typeof logger, FastifyTypeProviderDefault>
  private controller: Controller

  constructor(
    config: ServerConfig
  ) {
    this.controller = config.controller
    this.fastify = Fastify({
      loggerInstance: logger,
    })
  }

  start = async () => {
    try {
      this.fastify.all('/*', this.controller.handleRequest)

      await this.fastify.listen({ port: 3000 })
    } catch (err) {
      this.fastify.log.error(err)
      process.exit(1)
    }
  }
}
