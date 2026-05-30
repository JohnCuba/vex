import { Server } from './server'
import type { AppConfig } from './types'
import type { ConfigEnv } from 'vite'

export class App {
  private constructor(
    private appConfig: AppConfig,
    private server: Server
  ) {}

  static create = async (env: ConfigEnv, appConfig: AppConfig) => {
    const server = await Server.create({ appConfig, env })

    return new App(appConfig, server)
  }

  start = async () => {
    await this.server?.start()
  }
}
