import type { FastifyReply, FastifyRequest, HTTPMethods } from 'fastify';
import type { ConfigEnv } from 'vite';
import type { Unhead } from 'unhead/server';

export type VexConfigEnv = ConfigEnv & {
  mode: 'development' | 'production';
};

export type RouteParams = Record<string, string>;

export type RouteHandler<Params extends RouteParams = RouteParams> = (
  req: FastifyRequest<{ Params: Params }>,
  rep: FastifyReply,
) => Promise<void> | void;

type HTTPMethodsLowercase = Exclude<HTTPMethods, Uppercase<HTTPMethods>>;

export type RouteController<Params extends RouteParams = RouteParams> = Partial<
  Record<HTTPMethodsLowercase, RouteHandler<Params>>
>;
export type ModuleRouteController = {
  handlers: RouteController;
};

export type ConfigModule<T> = { default: T };

export type ServerAppRenderer<THandlerModule> = (
  module: THandlerModule,
  req: FastifyRequest,
  rep: FastifyReply,
) => Promise<{
  head?: Unhead<any, unknown>;
  appHtml: string;
  stateHtml?: string;
  ctx?: { modules?: Set<string> };
}>;
