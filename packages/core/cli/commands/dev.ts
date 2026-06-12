import type { CommandModule } from 'yargs';
import * as App from '@src/app';
import { resolveAppConfig } from '@src/config';
import type { VexConfigEnv } from '@src/types';

export const devCommandModule: CommandModule = {
  command: 'dev',
  describe: 'run project in development mode',
  handler: async () => {
    const env: VexConfigEnv = { command: 'serve', mode: 'development' };
    const appConfig = await resolveAppConfig(env);

    await App.init(env, appConfig);
  },
};
