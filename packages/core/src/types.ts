import type { FastifyReply, FastifyRequest, HTTPMethods } from 'fastify';

export type RouteHandler = (req: FastifyRequest, rep: FastifyReply) => Promise<void> | void

type HTTPMethodsLowercase= Exclude<HTTPMethods, Uppercase<HTTPMethods>>

export type RouteController = Partial<Record<HTTPMethodsLowercase, RouteHandler>>

export type RouteModule = {
  default: RouteController
}
