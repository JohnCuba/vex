import type { VexConfigEnv } from './types';
import type { ResolvedAppConfig } from './config';
import * as Logger from './logger';

type Container = {
  env: VexConfigEnv;
  appConfig: ResolvedAppConfig;
  logger: Logger.Logger;
};

class ContainerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContainerError';
  }
}

const store: Partial<Container> = {};

export const provide = <K extends keyof Container>(key: K, value: Container[K]): void => {
  if (key in store) {
    throw new ContainerError(key + ' already provided');
  }

  store[key] = value;
};

export const inject = <K extends keyof Container>(key: K): Container[K] => {
  if (!store[key]) {
    throw new ContainerError('not provided');
  }

  return store[key];
};
