import path from 'node:path';
import fs from 'node:fs';
import { mergeDeepRight } from 'ramda';
import type { UserConfigExport, UserConfig } from 'vite';
import type { DeepRequired } from 'utility-types';
import type { ConfigModule } from './types';
import type * as Logger from './logger';

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

export const resolveAppConfig = async (): Promise<ResolvedAppConfig> => {
  const configPath = path.join(process.cwd(), 'vex.config.ts');

  if (!fs.existsSync(configPath)) {
    return DEFAULT_APP_CONFIG;
  }

  const fileConfig = ((await import(configPath)) as ConfigModule<AppConfig>).default;
  return mergeDeepRight(DEFAULT_APP_CONFIG, fileConfig) as ResolvedAppConfig;
};
