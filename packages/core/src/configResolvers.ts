import path from 'node:path'
import { mergeConfig, type ConfigEnv, type UserConfig, type UserConfigExport } from "vite";
import type { ConfigModule, AppConfig } from './types'
import { buildDefaultViteConfig } from './bundler'

export const resolveAppConfig = async (): Promise<AppConfig> => {
  const appConfigModule = await import(path.join(process.cwd(), 'vex.config.ts')) as ConfigModule<AppConfig>
  return appConfigModule.default
}

export const resolveRoutesDir = (appConfig: AppConfig) => appConfig.paths?.routes ?? 'routes'

const objectizeViteConfig = async (configEnv: ConfigEnv, viteConfig?: UserConfigExport): Promise<UserConfig> => {
  if (!viteConfig) return {}
  if (typeof viteConfig === 'function') return await viteConfig(configEnv)
  return await viteConfig
}

export const resolveViteConfig = async (configEnv: ConfigEnv, appConfig: AppConfig): Promise<UserConfig> => {
  const defaultViteConfig = await buildDefaultViteConfig(configEnv, appConfig)
  const userViteConfig = await objectizeViteConfig(configEnv, appConfig.vite)
  return mergeConfig(defaultViteConfig, userViteConfig)
}
