import path from 'node:path'
import fs from 'node:fs'
import { mergeConfig, type ConfigEnv, type UserConfig, type UserConfigExport } from "vite";
import { mergeDeepRight } from 'ramda'
import type { ConfigModule, AppConfig, ResolvedAppConfig } from './types'
import { buildDefaultViteConfig } from './bundler'

const DEFAULT_APP_CONFIG: ResolvedAppConfig = {
  port: Number(process.env.PORT || 3000),
  vite: {},
  paths: {
    routes: 'routes'
  }
}

export const resolveAppConfig = async (): Promise<ResolvedAppConfig> => {
  const configPath = path.join(process.cwd(), 'vex.config.ts')

  if (!fs.existsSync(configPath)) {
    return DEFAULT_APP_CONFIG
  }

  const fileConfig = ((await import(configPath)) as ConfigModule<AppConfig>).default
  return mergeDeepRight(DEFAULT_APP_CONFIG, fileConfig) as ResolvedAppConfig
}

const objectizeViteConfig = async (configEnv: ConfigEnv, viteConfig: UserConfigExport): Promise<UserConfig> => {
  if (typeof viteConfig === 'function') return await viteConfig(configEnv)
  return await viteConfig
}

export const resolveViteConfig = async (configEnv: ConfigEnv, appConfig: ResolvedAppConfig): Promise<UserConfig> => {
  const defaultViteConfig = await buildDefaultViteConfig(configEnv, appConfig)
  const userViteConfig = await objectizeViteConfig(configEnv, appConfig.vite)
  return mergeConfig(defaultViteConfig, userViteConfig)
}
