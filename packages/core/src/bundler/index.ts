import type { ConfigEnv, UserConfig } from 'vite'
import type { AppConfig } from '../types'
import { buildClientViteConfig } from './client'
import { buildServerViteConfig } from './server'

export const buildDefaultViteConfig = async (env: ConfigEnv, appConfig: AppConfig): Promise<UserConfig> =>
  env.isSsrBuild ? buildServerViteConfig(env, appConfig) : buildClientViteConfig(env, appConfig)
