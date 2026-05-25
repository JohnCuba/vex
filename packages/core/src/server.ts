import Fastify, { type FastifyInstance} from 'fastify'
import type { Controller } from './controller.ts'

export class Server {
  private fastify: FastifyInstance
  private controller: Controller

  constructor(
    controller: Controller
  ) {
    this.controller = controller
    this.fastify = Fastify()
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
