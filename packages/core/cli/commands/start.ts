import type { CommandModule } from 'yargs';
import type { VexConfigEnv } from '@src/types';
import * as App from '@src/app';
import { resolveAppConfig } from '@src/config';

export const startCommandModule: CommandModule = {
  command: 'start',
  describe: 'start builded project in production',
  handler: async () => {
    const env: VexConfigEnv = { command: 'serve', mode: 'production' };
    const appConfig = await resolveAppConfig(env);

    await App.init(env, appConfig);
  },
};
