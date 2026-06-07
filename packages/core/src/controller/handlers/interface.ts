import type { FastifyReply, FastifyRequest } from 'fastify';

export interface RouteHandler {
  handleRequest(
    handlerModule: unknown,
    handlerPath: string,
    req: FastifyRequest,
    rep: FastifyReply,
  ): Promise<void>;
}
