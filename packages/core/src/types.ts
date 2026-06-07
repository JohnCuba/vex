import type { FastifyReply, FastifyRequest, HTTPMethods } from 'fastify';
import type { ConfigEnv } from 'vite';

export type VexConfigEnv = ConfigEnv & {
  mode: 'development' | 'production'
}

export type RouteHandler = (req: FastifyRequest, rep: FastifyReply) => Promise<void> | void

type HTTPMethodsLowercase= Exclude<HTTPMethods, Uppercase<HTTPMethods>>

export type RouteController = Partial<Record<HTTPMethodsLowercase, RouteHandler>>
export type ModuleRouteController = {
  isApiRoute?: true,
  handlers: RouteController,
}

export type ConfigModule<T> = { default: T }

export type ServerAppRenderer<THandlerModule> = (
  module: THandlerModule,
  req: FastifyRequest,
  rep: FastifyReply,
) => Promise<{
  appHtml: string
  ctx?: { modules?: Set<string> }
}>
