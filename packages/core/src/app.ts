import path from 'node:path'
import type { AppConfig } from './types'
import { Controller } from './controller'
import { Server } from './server'

export class App {
  private appConfig?: AppConfig
  private rootPath = path.join(process.cwd(), 'src')
  private get appPath() {
    return path.join(this.rootPath, 'app.ts')
  }
  private get routesPath() {
    return path.join(this.rootPath, this.appConfig?.paths?.routes || 'routes')
  }

  private server?: Server

  constructor() {}

  create = async () => {
    this.appConfig = await import(this.appPath) as AppConfig

    const controller = new Controller({
      rootPath: this.routesPath
    })

    this.server = new Server({
      controller,
    })

    return this
  }

  start = async () => {
    await this.server?.start()
  }
}
