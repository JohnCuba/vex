import type { CommandModule } from 'yargs';
import { build } from 'vite';
import type { VexConfigEnv } from '@src/types';
import { resolveAppConfig } from '@src/config';

export const buildCommandModule: CommandModule = {
  command: 'build',
  describe: 'build project for production',
  handler: async () => {
    const env: VexConfigEnv = { command: 'build', mode: 'production' };
    const appConfigClient = await resolveAppConfig({
      ...env,
      isSsrBuild: false,
    });
    const appConfigServer = await resolveAppConfig({
      ...env,
      isSsrBuild: true,
    });

    await build(appConfigClient.vite);
    await build(appConfigServer.vite);
  },
};
