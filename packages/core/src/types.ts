import type { FastifyReply, FastifyRequest, HTTPMethods } from 'fastify';
import type { DeepRequired } from 'utility-types';
import type { UserConfigExport, UserConfig } from 'vite';

export type RouteHandler = (req: FastifyRequest, rep: FastifyReply) => Promise<void> | void

type HTTPMethodsLowercase= Exclude<HTTPMethods, Uppercase<HTTPMethods>>

export type RouteController = Partial<Record<HTTPMethodsLowercase, RouteHandler>>
export type ModuleRouteController = {
  isApiRoute?: true,
  handlers: RouteController,
}

export type AppConfig = {
  port?: number
  vite?: UserConfigExport
  paths?: {
    routes?: string,
  }
}

export type ResolvedAppConfig = {
  vite: UserConfig,
} & DeepRequired<Omit<AppConfig, 'vite'>>

export type ConfigModule<T> = { default: T }
