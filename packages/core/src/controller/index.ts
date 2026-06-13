import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ViteDevServer } from 'vite';
import type { Router } from '@src/router';
import { FrameworkHandler } from './handlers/framework.handler';
import { ApiHandler } from './handlers/api.handler';
import { loadModule } from '@src/loader';

type ControllerConfig = {
  viteDevServer: ViteDevServer | null;
  router: Router;
};

export class Controller {
  private frameworkHandler: FrameworkHandler;
  private apiHandler: ApiHandler;

  constructor(private config: ControllerConfig) {
    this.apiHandler = new ApiHandler();
    this.frameworkHandler = new FrameworkHandler(config.viteDevServer);
  }

  handleNotFound = async (_req: FastifyRequest, rep: FastifyReply) => {
    return rep.status(404).send('Not found');
  };

  handleRequest = async (req: FastifyRequest, rep: FastifyReply) => {
    const url = req.url.split('?')[0];
    if (!url) return this.handleNotFound(req, rep);

    const match = this.config.router.match(url);
    if (!match) return this.handleNotFound(req, rep);

    req.params = match.params;

    const handlerModule = await loadModule(match.filePath, this.config.viteDevServer);

    if (match.kind === 'api') {
      return this.apiHandler.handleRequest(handlerModule, match.filePath, req, rep);
    } else {
      return this.frameworkHandler.handleRequest(handlerModule, match.filePath, req, rep);
    }
  };
}
