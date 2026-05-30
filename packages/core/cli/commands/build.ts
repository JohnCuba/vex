import type { CommandModule } from "yargs";
import { build, type ConfigEnv } from 'vite'
import { resolveAppConfig, resolveViteConfig } from "../../src/configResolvers";

export const buildCommandModule: CommandModule = {
  command: 'build',
  describe: 'build project for production',
  handler: async () => {
    const appConfig = await resolveAppConfig()
    const env: ConfigEnv = { command: 'build', mode: 'production' }

    await build(await resolveViteConfig({ ...env, isSsrBuild: false }, appConfig))
    await build(await resolveViteConfig({ ...env, isSsrBuild: true }, appConfig))
  }
}
