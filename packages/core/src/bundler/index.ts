import type { ConfigEnv, UserConfig } from 'vite'
import type { ResolvedAppConfig } from '@src/config'
import { buildClientViteConfig } from './client'
import { buildServerViteConfig } from './server'

export const buildDefaultViteConfig = async (env: ConfigEnv, appConfig: ResolvedAppConfig): Promise<UserConfig> =>
  env.isSsrBuild ? buildServerViteConfig(env, appConfig) : buildClientViteConfig(env, appConfig)
