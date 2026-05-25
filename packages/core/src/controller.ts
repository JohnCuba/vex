import type { FastifyReply, FastifyRequest } from 'fastify';
import fs from 'node:fs/promises'
import path from 'node:path'
import type { RouteModule } from './types.ts'

export class Controller {
  private rootPath: string

  constructor(rootPath: string) {
    this.rootPath = rootPath
  }

  private getRouteModule = async (url: string): Promise<RouteModule> => {
    const localPath = path.join(this.rootPath, url, 'index.ts')

    await fs.access(localPath)

    const routeHandler = await import(localPath) as RouteModule

    return routeHandler
  }

  handleNotFound = async (req: FastifyRequest, rep: FastifyReply) => {
    rep.status(404)
    rep.send('Not found')
  }

  handleRequest = async (req: FastifyRequest, rep: FastifyReply) => {
    const routeHandler = await this.getRouteModule(req.url)
    const handler = routeHandler[req.method]

    if (!handler) {
      return this.handleNotFound(req, rep)
    }

    handler(req, rep)
  }
}
