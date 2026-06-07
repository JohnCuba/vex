import type { VexConfigEnv } from './types';
import type { ResolvedAppConfig } from './config';
import * as Logger from './logger';

type Container = {
  env: VexConfigEnv;
  appConfig: ResolvedAppConfig;
  logger: ReturnType<typeof Logger.init>;
};

class ContainerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContainerError';
    Object.setPrototypeOf(this, ContainerError.prototype);
  }
}

let store: Container | null = null;

export const init = (deps: Container): void => {
  store = deps;
};

export const provide = (deps: Record<string, unknown>): void => {
  if (!store) throw new ContainerError('need to init container');
  Object.assign(store, deps);
};

export const inject = ((key?: keyof Container) => {
  if (!store) throw new ContainerError('need to init container');
  if (!key) return store;
  return store[key];
}) as {
  (): Container;
  <Key extends keyof Container>(key: Key): Container[Key];
};
