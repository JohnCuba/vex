import type { CommandModule } from "yargs";
import { build } from 'vite'
import type { VexConfigEnv } from '../../src/types'
import { resolveAppConfig } from '../../src/config'
import { resolveViteConfig } from '../../src/bundler/resolve'

export const buildCommandModule: CommandModule = {
  command: 'build',
  describe: 'build project for production',
  handler: async () => {
    const appConfig = await resolveAppConfig()
    const env: VexConfigEnv = { command: 'build', mode: 'production' }

    await build(await resolveViteConfig({ ...env, isSsrBuild: false }, appConfig))
    await build(await resolveViteConfig({ ...env, isSsrBuild: true }, appConfig))
  }
}
