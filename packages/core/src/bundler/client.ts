import path from 'node:path'
import type { ConfigEnv, UserConfig } from 'vite'
import type { AppConfig } from '../types'
import { resolveRoutesDir } from '../configResolvers'
import { routesPlugin } from './plugins/routesPlugin'

export const buildClientViteConfig = async (env: ConfigEnv, appConfig: AppConfig): Promise<UserConfig> => {
  const routesDir = resolveRoutesDir(appConfig)

  return {
    plugins: [routesPlugin({ routesDir })],
    build: {
      outDir: 'dist/client',
      rolldownOptions: {
        input: path.join(process.cwd(), 'index.html'),
      },
    },
  }
}
