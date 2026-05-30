import type { FastifyReply, FastifyRequest } from "fastify";
import type { RouteController, AppConfig } from "../src/types";

export const defineRoute = (handlers: RouteController) => ({
  isApiRoute: true,
  handlers,
});

type ServerAppRenderer<THandlerModule> = (
  module: THandlerModule,
  req: FastifyRequest,
  rep: FastifyReply,
) => Promise<{
  appHtml: string
}>
export const defineServerEntryPoint = <THandlerModule>(renderer: ServerAppRenderer<THandlerModule>) => renderer;

declare const __WEBRA_ROUTE__: string

type ClientAppRenderer<THandlerModule> = (module: THandlerModule) => Promise<void>
export const defineClientEntryPoint = async <THandlerModule>(renderer: ClientAppRenderer<THandlerModule>) => {
  const { routes } = await import('virtual:webra-routes')
  const loader = routes[__WEBRA_ROUTE__]
  if (!loader) throw new Error(`[webra] route not found: ${__WEBRA_ROUTE__}`)

  const module = await loader() as { default: THandlerModule }
  renderer(module.default)
};

export const defineApp = (appConfig: AppConfig) => appConfig;
