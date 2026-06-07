import path from 'node:path'
import fs from 'node:fs/promises'
import type { ConfigEnv, UserConfig } from 'vite'
import type { ResolvedAppConfig } from '../config'
import { routesPlugin } from './plugins/routesPlugin'

export const buildServerViteConfig = async (env: ConfigEnv, appConfig: ResolvedAppConfig): Promise<UserConfig> => {
  const routesRoot = path.join(process.cwd(), 'src', appConfig.paths.routes)

  const routeFiles = (await fs.readdir(routesRoot, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))

  return {
    plugins: [routesPlugin({ routesDir: appConfig.paths.routes })],
    build: {
      ssr: true,
      outDir: 'dist/server',
      rolldownOptions: {
        input: [appConfig.paths.entryServer, ...routeFiles],
        output: {
          preserveModules: true,
          preserveModulesRoot: path.join(process.cwd(), 'src'),
        },
      },
    },
  }
}
