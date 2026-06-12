import path from 'node:path';
import fs from 'node:fs';
import { mergeDeepRight } from 'ramda';
import { mergeConfig, type ConfigEnv, type UserConfigExport, type UserConfig } from 'vite';
import type { DeepRequired } from 'utility-types';
import type { ConfigModule, VexConfigEnv } from './types';
import type * as Logger from './logger';
import { buildDefaultViteConfig } from './bundler';

export type AppConfig = {
  port?: number;
  logLevel?: Logger.Level;
  vite?: UserConfigExport;
  paths?: {
    routes?: string;
  };
};

export type ResolvedAppConfig = {
  vite: UserConfig;
  logLevel: Logger.Level;
} & DeepRequired<Omit<AppConfig, 'vite' | 'logLevel'>>;

const DEFAULT_APP_CONFIG: ResolvedAppConfig = {
  port: Number(process.env.PORT || 3000),
  logLevel: (process.env.LOG_LEVEL as Logger.Level) || 'debug',
  vite: {},
  paths: {
    routes: 'routes',
  },
};

const objectizeViteConfig = async (
  configEnv: ConfigEnv,
  viteConfig: UserConfigExport,
): Promise<UserConfig> => {
  if (typeof viteConfig === 'function') return viteConfig(configEnv);
  return viteConfig;
};

const resolveViteConfig = async (
  configEnv: ConfigEnv,
  appConfig: ResolvedAppConfig,
): Promise<UserConfig> => {
  const defaultViteConfig = await buildDefaultViteConfig(configEnv, appConfig);
  const userViteConfig = await objectizeViteConfig(configEnv, appConfig.vite);
  return mergeConfig(defaultViteConfig, userViteConfig);
};

export const resolveAppConfig = async (env: VexConfigEnv): Promise<ResolvedAppConfig> => {
  const configPath = path.join(process.cwd(), 'vex.config.ts');

  if (!fs.existsSync(configPath)) {
    return DEFAULT_APP_CONFIG;
  }
  const fileConfig = ((await import(configPath)) as ConfigModule<AppConfig>).default;

  const config = mergeDeepRight(DEFAULT_APP_CONFIG, fileConfig) as ResolvedAppConfig;
  const routesBase =
    env.mode === 'development' || env.command === 'build'
      ? path.join(process.cwd(), 'src')
      : path.join(process.cwd(), 'dist', 'server');
  config.paths = { routes: path.join(routesBase, config.paths.routes) };

  config.vite = await resolveViteConfig(env, config);

  return config;
};
