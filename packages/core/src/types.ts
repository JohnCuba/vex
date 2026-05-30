import type { FastifyReply, FastifyRequest, HTTPMethods } from 'fastify';
import type { UserConfigExport } from 'vite';

export type RouteHandler = (req: FastifyRequest, rep: FastifyReply) => Promise<void> | void

type HTTPMethodsLowercase= Exclude<HTTPMethods, Uppercase<HTTPMethods>>

export type RouteController = {
  isApiRoute: true,
  handlers: Partial<Record<HTTPMethodsLowercase, RouteHandler>>
}

export type AppConfig = {
  port?: number
  vite?: UserConfigExport
  paths?: {
    routes?: string
  }
}

export type ConfigModule<T> = { default: T }
