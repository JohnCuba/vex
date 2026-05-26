import type { FastifyReply, FastifyRequest } from 'fastify';
import fs from 'node:fs/promises'
import type { RouteModule } from './types.ts'
import { indexFileRouteBuilder, nameFileRouteBuilder } from './entryPointBuilders.ts'

const ENTRY_POINT_BUILDERS = [
  indexFileRouteBuilder,
  nameFileRouteBuilder,
]

export class Controller {
  private rootPath: string

  constructor(rootPath: string) {
    this.rootPath = rootPath
  }

  private getRouteModule = async (url: string): Promise<RouteModule | null> => {
    for (const entryPointPattern of ENTRY_POINT_BUILDERS) {
      const localPath = entryPointPattern(this.rootPath, url)

      try {
        await fs.access(localPath)

        const routeHandler = await import(localPath) as RouteModule

        return routeHandler
      } catch {
        continue
      }
    }

    return null
  }

  handleNotFound = async (req: FastifyRequest, rep: FastifyReply) => {
    rep.status(404)
    rep.send('Not found')
  }

  handleRequest = async (req: FastifyRequest, rep: FastifyReply) => {
    const routeModule = await this.getRouteModule(req.url)
    const handler = routeModule?.default?.[req.method.toLowerCase()]

    if (!handler) {
      return this.handleNotFound(req, rep)
    }

    handler(req, rep)
  }
}
