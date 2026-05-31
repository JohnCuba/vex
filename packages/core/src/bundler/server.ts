import path from 'node:path'
import fs from 'node:fs/promises'
import type { ConfigEnv, UserConfig } from 'vite'
import type { ResolvedAppConfig } from '../types'
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
        input: [
          path.join(process.cwd(), 'src', 'entryPoints', 'server.ts'),
          ...routeFiles,
        ],
        output: {
          preserveModules: true,
          preserveModulesRoot: path.join(process.cwd(), 'src'),
        },
      },
    },
  }
}
