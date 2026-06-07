import type { CommandModule } from 'yargs';
import type { VexConfigEnv } from '@src/types';
import * as App from '@src/app';
import { resolveAppConfig } from '@src/config';

export const startCommandModule: CommandModule = {
  command: 'start',
  describe: 'start builded project in production',
  handler: async () => {
    const appConfig = await resolveAppConfig();
    const env: VexConfigEnv = { command: 'build', mode: 'production' };

    await App.init(env, appConfig);
  },
};
