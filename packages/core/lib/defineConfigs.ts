import type { RouteController, AppConfig } from "../src/types";

export const defineRoute = (handlers: RouteController) => handlers;

export const defineApp = (appConfig: AppConfig) => appConfig;
