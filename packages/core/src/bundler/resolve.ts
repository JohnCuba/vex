import { mergeConfig, type ConfigEnv, type UserConfig, type UserConfigExport } from 'vite';
import type { ResolvedAppConfig } from '@src/config';
import { buildDefaultViteConfig } from './index';

const objectizeViteConfig = async (
  configEnv: ConfigEnv,
  viteConfig: UserConfigExport,
): Promise<UserConfig> => {
  if (typeof viteConfig === 'function') return viteConfig(configEnv);
  return viteConfig;
};

export const resolveViteConfig = async (
  configEnv: ConfigEnv,
  appConfig: ResolvedAppConfig,
): Promise<UserConfig> => {
  const defaultViteConfig = await buildDefaultViteConfig(configEnv, appConfig);
  const userViteConfig = await objectizeViteConfig(configEnv, appConfig.vite);
  return mergeConfig(defaultViteConfig, userViteConfig);
};
