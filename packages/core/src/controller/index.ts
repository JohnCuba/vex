import path from 'node:path'
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ViteDevServer } from 'vite'
import type { ConfigModule, RouteController, AppConfig } from '../types'
import { resolveRoutesDir } from '../configResolvers'
import { RouteRegistry } from './routeRegistry'
import { FrameworkHandler } from './frameworkHandler';

type ControllerConfig = {
  viteDevServer: ViteDevServer | null
  appConfig: AppConfig
}

export class Controller {
  private resolveEnv(devPath: string, prodPath: string) {
    return this.config.viteDevServer ? devPath : prodPath
  }
  private routeRegistry: RouteRegistry;
  private frameworkHandler: FrameworkHandler;

  constructor(
    private config: ControllerConfig
  ) {
    const routesDir = resolveRoutesDir(this.config.appConfig)
    this.routeRegistry = new RouteRegistry(
      Boolean(config.viteDevServer),
      this.resolveEnv(
        path.join(process.cwd(), 'src', routesDir),
        path.join(process.cwd(), 'dist', 'server', routesDir),
      ),
    )

    this.frameworkHandler = new FrameworkHandler(
      config.viteDevServer,
      this.routeRegistry.routesPath,
      this.resolveEnv(
        path.join(process.cwd(), 'index.html'),
        path.join(process.cwd(), 'dist', 'client', 'index.html'),
      ),
      this.resolveEnv(
        path.join(process.cwd(), 'src', 'entryPoints', 'server.ts'),
        path.join(process.cwd(), 'dist', 'server', 'entryPoints', 'server.js'),
      )
    )
  }

  handleNotFound = async (_req: FastifyRequest, rep: FastifyReply) => {
    return rep.status(404).send('Not found')
  }

  private handleApiRoute = async (handlerModule: ConfigModule<RouteController>, req: FastifyRequest, rep: FastifyReply) => {
    const handler = handlerModule.default.handlers[req.method.toLowerCase()]

    if (!handler) {
      return this.handleNotFound(req, rep)
    }

    return handler(req, rep)
  }

  handleRequest = async (req: FastifyRequest, rep: FastifyReply) => {
    const url = URL.parse(req.url, 'http://localhost.com')
    if (!url) return this.handleNotFound(req, rep);

    const routes = await this.routeRegistry.getRoutes()

    for (const dirent of routes) {
      if (dirent.isDirectory()) continue;
      const handlerPath = path.join(dirent.parentPath, dirent.name)

      if (handlerPath.startsWith(path.join(this.routeRegistry.routesPath, url.pathname))) {
        const handlerModule = this.config.viteDevServer
          ? await this.config.viteDevServer.ssrLoadModule(handlerPath)
          : await import(handlerPath);

        if (handlerModule.default.isApiRoute) {
          return this.handleApiRoute(handlerModule, req, rep)
        } else {
          return this.frameworkHandler.handleRequest(handlerModule, handlerPath, req, rep)
        }
      }
    }

    return this.handleNotFound(req, rep);
  }
}
