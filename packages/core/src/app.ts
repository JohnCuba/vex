import { Server } from './server';
import type { VexConfigEnv } from './types';
import type { ResolvedAppConfig } from './config';
import * as Container from './container';
import * as Logger from './logger';

export const init = async (env: VexConfigEnv, appConfig: ResolvedAppConfig) => {
  Container.init({
    env,
    appConfig,
    logger: Logger.init(env.mode, appConfig.logLevel),
  });

  const server = await Server.create();

  server.start();
};
