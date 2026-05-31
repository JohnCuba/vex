import fs from 'node:fs/promises'
import path from 'node:path'
import type { ViteDevServer } from 'vite'
import type { FastifyReply, FastifyRequest } from 'fastify';
import { parse } from 'node-html-parser'

export class FrameworkHandler {
  private template: string | null = null

  constructor(
    private viteDevServer: ViteDevServer | null,
    public routesPath: string,
    public templatePath: string,
    public entryServerPath: string,
  ) {}

  getTemplate = async () => {
    if (!this.template || !Boolean(this.viteDevServer)) {
      this.template = await fs.readFile(this.templatePath, { encoding: 'utf-8' })
    }

    return this.template
  }

  handleRequest = async (handlerModule: any, handlerPath: string, req: FastifyRequest, rep: FastifyReply) => {
    let template = await this.getTemplate()
    const entryServer = this.viteDevServer
      ? await this.viteDevServer.ssrLoadModule(this.entryServerPath)
      : await import(this.entryServerPath)

    if (this.viteDevServer) {
      template = await this.viteDevServer.transformIndexHtml(req.url, template)
    }
    const routeKey = path.relative(path.join(this.routesPath, '..'), handlerPath)
      .split(path.sep).join('/')
      .replace(/\.[^/.]+$/, '')
    const routeScriptTag = `<script>window.__VEX_ROUTE__ = '${routeKey}'</script>`
    const { appHtml } = await entryServer.default(handlerModule.default, req, rep)
    const parsedTemplate = parse(template)

    const entryTag = parsedTemplate.querySelector('#app')
    if (entryTag) {
      entryTag.innerHTML = appHtml
    }

    parsedTemplate.append(routeScriptTag)

    return rep.header('Content-Type', 'text/html').send(parsedTemplate.toString())
  }
}
