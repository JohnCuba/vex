import { Server } from './server';
import type { VexConfigEnv } from './types';
import type { ResolvedAppConfig } from './config';
import * as Container from './container';
import * as Logger from './logger';

const SHUTDOWN_SIGNALS = ['SIGINT', 'SIGTERM'] as const satisfies readonly NodeJS.Signals[];
const SHUTDOWN_TIMEOUT_MS = 10_000;

type ShutdownReason = NodeJS.Signals | 'uncaughtException' | 'unhandledRejection';
type Shutdown = (reason: ShutdownReason, code: number) => Promise<void>;

const provideDependencies = (env: VexConfigEnv, appConfig: ResolvedAppConfig) => {
  Container.provide('env', env);
  Container.provide('appConfig', appConfig);
  Container.provide('logger', Logger.init(env.mode, appConfig.logLevel));
};

const createGracefulShutdown = (server: Server): Shutdown => {
  let inProgress = false;

  return async (reason, code) => {
    if (inProgress) return;
    inProgress = true;

    const logger = Container.inject('logger');
    logger.info({ reason }, 'Shutting down gracefully');

    const forceExit = setTimeout(() => {
      logger.fatal({ timeoutMs: SHUTDOWN_TIMEOUT_MS }, 'Shutdown timed out, forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();

    try {
      await server.stop();
      clearTimeout(forceExit);
      process.exit(code);
    } catch (err) {
      clearTimeout(forceExit);
      logger.error(err, 'Error during shutdown');
      process.exit(1);
    }
  };
};

const bindLifecycle = (shutdown: Shutdown) => {
  for (const signal of SHUTDOWN_SIGNALS) {
    process.on(signal, () => shutdown(signal, 0));
  }

  process.on('uncaughtException', (err) => {
    Container.inject('logger').fatal(err, 'Uncaught exception');
    shutdown('uncaughtException', 1);
  });

  process.on('unhandledRejection', (reason) => {
    Container.inject('logger').fatal({ reason }, 'Unhandled rejection');
    shutdown('unhandledRejection', 1);
  });
};

export const init = async (env: VexConfigEnv, appConfig: ResolvedAppConfig) => {
  provideDependencies(env, appConfig);

  const server = await Server.create();
  bindLifecycle(createGracefulShutdown(server));

  await server.start();
};
