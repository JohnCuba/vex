import path from 'node:path';
import fs from 'node:fs/promises';
import type { UserConfig } from 'vite';
import type { ResolvedAppConfig } from '@src/config';
import { routesPlugin } from './plugins/routesPlugin';

export const buildServerViteConfig = async (appConfig: ResolvedAppConfig): Promise<UserConfig> => {
  const routeFiles = (
    await fs.readdir(appConfig.paths.routes, { recursive: true, withFileTypes: true })
  )
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));

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
  };
};
