import type { FastifyReply, FastifyRequest, HTTPMethods } from 'fastify';

export type RouteHandler = (req: FastifyRequest, rep: FastifyReply) => Promise<void> | void

export type RouteModule = Partial<Record<HTTPMethods, RouteHandler>>
