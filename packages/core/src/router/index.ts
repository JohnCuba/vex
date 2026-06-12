import type { ViteDevServer } from 'vite';
import { buildRegistry, type RouteRegistry } from './registry';
import { matchRoute, type RouteMatch } from './matcher';
import * as Container from '@src/container';

export type { RouteMatch };

export class Router {
  private registry: RouteRegistry;

  private constructor(registry: RouteRegistry) {
    this.registry = registry;
  }

  static async create(viteDevServer: ViteDevServer | null): Promise<Router> {
    const appConfig = Container.inject('appConfig');
    const registry = await buildRegistry(appConfig.paths.routes);
    const router = new Router(registry);

    if (viteDevServer) {
      const rebuild = async () => {
        router.registry = await buildRegistry(appConfig.paths.routes);
      };
      viteDevServer.watcher.on('add', rebuild);
      viteDevServer.watcher.on('addDir', rebuild);
      viteDevServer.watcher.on('unlink', rebuild);
      viteDevServer.watcher.on('unlinkDir', rebuild);
    }

    return router;
  }

  match(pathname: string): RouteMatch | null {
    return matchRoute(this.registry, pathname);
  }
}
