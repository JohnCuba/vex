import type { FastifyReply, FastifyRequest } from 'fastify';
import fs from 'node:fs/promises'
import type { ViteDevServer } from 'vite'
import { parse } from 'node-html-parser'
import type { ConfigModule, RouteController, AppConfig } from './types'
import { resolveRoutesDir } from './configResolvers'
import path from 'node:path';

type ControllerConfig = {
  viteDevServer: ViteDevServer | null
  appConfig: AppConfig
}

export class Controller {
  private resolveEnv(devPath: string, prodPath: string) {
    return this.config.viteDevServer ? devPath : prodPath
  }
  private get routesPath() {
    const routesDir = resolveRoutesDir(this.config.appConfig)

    return this.resolveEnv(
      path.join(process.cwd(), 'src', routesDir),
      path.join(process.cwd(), 'dist', 'server', routesDir),
    )
  }
  private get frameworkTemplatePath() {
    return this.resolveEnv(
      path.join(process.cwd(), 'index.html'),
      path.join(process.cwd(), 'dist', 'client', 'index.html'),
    )
  }
  private get entryServerPath() {
    return this.resolveEnv(
      path.join(process.cwd(), 'src', 'entryPoints', 'server.ts'),
      path.join(process.cwd(), 'dist', 'server', 'entryPoints', 'server.js'),
    )
  }

  constructor(
    private config: ControllerConfig
  ) {}

  handleNotFound = async (_req: FastifyRequest, rep: FastifyReply) => {
    return rep.status(404).send('Not found')
  }

  private handleFrameworkRoute = async (handlerModule: any, handlerPath: string, req: FastifyRequest, rep: FastifyReply) => {
    let template = await fs.readFile(this.frameworkTemplatePath, { encoding: 'utf-8' })
    const entryServer = this.config.viteDevServer
      ? await this.config.viteDevServer.ssrLoadModule(this.entryServerPath)
      : await import(this.entryServerPath)

    if (this.config.viteDevServer) {
      template = await this.config.viteDevServer.transformIndexHtml(req.url, template)
    }

    const routeKey = path.relative(path.join(this.routesPath, '..'), handlerPath)
      .split(path.sep).join('/')
      .replace(/\.[^/.]+$/, '')
    const routeScriptTag = `<script>window.__WEBRA_ROUTE__ = '${routeKey}'</script>`
    const { appHtml } = await entryServer.default(handlerModule.default, req, rep)
    const parsedTemplate = parse(template)

    const entryTag = parsedTemplate.querySelector('#app')
    if (entryTag) {
      entryTag.innerHTML = appHtml
    }

    parsedTemplate.append(routeScriptTag)

    return rep.header('Content-Type', 'text/html').send(parsedTemplate.toString())
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

    const routes = await fs.readdir(this.routesPath, { recursive: true, withFileTypes: true });

    for (const dirent of routes) {
      if (dirent.isDirectory()) continue;

      if (path.join(dirent.parentPath, dirent.name).startsWith(path.join(this.routesPath, url.pathname))) {
        const handlerModulePath = path.join(dirent.parentPath, dirent.name)
        const handlerModule = this.config.viteDevServer
          ? await this.config.viteDevServer.ssrLoadModule(handlerModulePath)
          : await import(handlerModulePath);

        if (handlerModule.default.isApiRoute) {
          return this.handleApiRoute(handlerModule, req, rep)
        } else {
          return this.handleFrameworkRoute(handlerModule, handlerModulePath, req, rep)
        }
      }
    }

    return this.handleNotFound(req, rep);
  }
}
