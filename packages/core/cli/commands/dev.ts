import type { CommandModule } from 'yargs';
import * as App from '../../src/app';
import { resolveAppConfig } from '../../src/config';
import type { VexConfigEnv } from '../../src/types'

export const devCommandModule: CommandModule = {
  command: 'dev',
  describe: 'run project in development mode',
  handler: async () => {
    const appConfig = await resolveAppConfig()
    const env: VexConfigEnv = { command: 'serve', mode: 'development' }

    await App.init(env, appConfig)
  },
}
