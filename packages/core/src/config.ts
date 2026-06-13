import path from 'node:path';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
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
    entryServer?: string;
    template?: string;
  };
};

export type ResolvedAppConfig = {
  vite: UserConfig;
  logLevel: Logger.Level;
  manifests: {
    ssr?: Record<string, string[]>;
  };
} & DeepRequired<Omit<AppConfig, 'vite' | 'logLevel'>>;

const DEFAULT_APP_CONFIG: ResolvedAppConfig = {
  port: Number(process.env.PORT || 3000),
  logLevel: (process.env.LOG_LEVEL as Logger.Level) || 'debug',
  vite: {},
  paths: {
    routes: 'routes',
    entryServer: 'entryPoints/server',
    template: 'index.html',
  },
  manifests: {},
};

const resolveVexConfig = async () => {
  const configPath = path.join(process.cwd(), 'vex.config.ts');

  if (!existsSync(configPath)) {
    return DEFAULT_APP_CONFIG;
  }

  const fileConfig = ((await import(configPath)) as ConfigModule<AppConfig>).default;
  return mergeDeepRight(DEFAULT_APP_CONFIG, fileConfig) as ResolvedAppConfig;
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

const resolvePaths = (
  env: VexConfigEnv,
  paths: NonNullable<ResolvedAppConfig['paths']>,
): ResolvedAppConfig['paths'] => {
  const isDev = env.mode === 'development' || env.command === 'build';
  const base = isDev ? path.join(process.cwd(), 'src') : path.join(process.cwd(), 'dist', 'server');
  const templatePath = isDev
    ? path.join(process.cwd(), paths.template)
    : path.join(process.cwd(), 'dist', 'client', paths.template);

  return {
    routes: path.join(base, paths.routes),
    entryServer: path.join(base, paths.entryServer + (isDev ? '.ts' : '.js')),
    template: templatePath,
  };
};

const resolveManifests = async (): Promise<ResolvedAppConfig['manifests']> => {
  const ssrManifestPath = path.join(process.cwd(), 'dist', 'client', '.vite', 'ssr-manifest.json');
  let ssrManifest;
  if (existsSync(ssrManifestPath)) {
    const ssrManifestModule = await fs.readFile(ssrManifestPath, 'utf-8');
    ssrManifest = JSON.parse(ssrManifestModule) as Record<string, string[]>;
  }

  return {
    ssr: ssrManifest,
  };
};

export const resolveAppConfig = async (env: VexConfigEnv): Promise<ResolvedAppConfig> => {
  const config = await resolveVexConfig();

  config.paths = resolvePaths(env, config.paths);
  config.manifests = await resolveManifests();
  config.vite = await resolveViteConfig(env, config);

  return config;
};
