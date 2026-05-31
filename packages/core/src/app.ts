import { Server } from './server'
import type { ResolvedAppConfig } from './types'
import type { ConfigEnv } from 'vite'

export class App {
  private constructor(
    private appConfig: ResolvedAppConfig,
    private server: Server
  ) {}

  static create = async (env: ConfigEnv, appConfig: ResolvedAppConfig) => {
    const server = await Server.create({ appConfig, env })

    return new App(appConfig, server)
  }

  start = async () => {
    await this.server?.start()
  }
}
