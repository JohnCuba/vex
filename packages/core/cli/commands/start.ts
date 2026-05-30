import type { CommandModule } from "yargs";
import type { ConfigEnv } from 'vite';
import { App } from '../../src/app';
import { resolveAppConfig } from '../../src/configResolvers';

export const startCommandModule: CommandModule = {
  command: 'start',
  describe: 'start builded project in production',
  handler: async () => {
    const appConfig = await resolveAppConfig()
    const env: ConfigEnv = { command: 'build', mode: 'production' }
    const app = await App.create(env, appConfig)

    await app.start()
  }
}
