import Fastify, {
  type FastifyInstance,
  type RawServerDefault,
  type RawRequestDefaultExpression,
  type RawReplyDefaultExpression,
  type FastifyTypeProviderDefault,
} from 'fastify'
import type { Controller } from './controller.ts'
import { logger } from './logger.ts'

export class Server {
  private fastify: FastifyInstance<RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, typeof logger, FastifyTypeProviderDefault>
  private controller: Controller

  constructor(
    controller: Controller
  ) {
    this.controller = controller
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
