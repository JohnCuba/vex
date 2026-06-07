import type { FastifyReply, FastifyRequest } from 'fastify'
import type { RouteHandler } from './interface'
import type { ModuleRouteController } from '@src/types'

export class ApiHandler implements RouteHandler {
  handleRequest = async (handlerModule: unknown, _handlerPath: string, req: FastifyRequest, rep: FastifyReply): Promise<void> => {
    const module = handlerModule as { default: ModuleRouteController }
    const handler = module.default.handlers[req.method.toLowerCase() as keyof typeof module.default.handlers]

    if (!handler) {
      rep.status(405).send(`Method ${req.method} not allowed`)
      return
    }

    await handler(req, rep)
  }
}
