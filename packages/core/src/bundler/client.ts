import path from 'node:path'
import type { ConfigEnv, UserConfig } from 'vite'
import type { ResolvedAppConfig } from '../types'
import { routesPlugin } from './plugins/routesPlugin'

export const buildClientViteConfig = async (
  env: ConfigEnv,
  appConfig: ResolvedAppConfig
): Promise<UserConfig> => {
  return {
    plugins: [routesPlugin({ routesDir: appConfig.paths.routes })],
    build: {
      outDir: 'dist/client',
      rolldownOptions: {
        input: path.join(process.cwd(), 'index.html'),
      },
    },
  }
}
