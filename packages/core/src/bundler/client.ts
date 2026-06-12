import path from 'node:path';
import type { UserConfig } from 'vite';
import type { ResolvedAppConfig } from '@src/config';
import { routesPlugin } from './plugins/routesPlugin';

export const buildClientViteConfig = async (appConfig: ResolvedAppConfig): Promise<UserConfig> => {
  return {
    plugins: [routesPlugin({ routesDir: appConfig.paths.routes })],
    build: {
      outDir: 'dist/client',
      ssrManifest: true,
      rolldownOptions: {
        input: path.join(process.cwd(), 'index.html'),
      },
    },
  };
};
