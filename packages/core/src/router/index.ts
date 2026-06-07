import type { ViteDevServer } from 'vite'
import { buildRegistry, type RouteRegistry } from './registry'
import { matchRoute, type RouteMatch } from './matcher'

export type { RouteMatch }

export class Router {
  private registry: RouteRegistry

  private constructor(
    private routesDir: string,
    registry: RouteRegistry,
  ) {
    this.registry = registry
  }

  static async create(routesDir: string, viteDevServer: ViteDevServer | null): Promise<Router> {
    const registry = await buildRegistry(routesDir)
    const router = new Router(routesDir, registry)

    if (viteDevServer) {
      const rebuild = async () => {
        router.registry = await buildRegistry(routesDir)
      }
      viteDevServer.watcher.on('add', rebuild)
      viteDevServer.watcher.on('unlink', rebuild)
      viteDevServer.watcher.on('change', rebuild)
    }

    return router
  }

  match(pathname: string): RouteMatch | null {
    return matchRoute(this.registry, pathname)
  }
}
