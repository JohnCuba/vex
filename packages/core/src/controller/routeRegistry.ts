import type { Dirent } from 'node:fs'
import fs from 'node:fs/promises'

export class RouteRegistry {
  private routes: Dirent[] | null = null

  constructor(
    private isDev: boolean,
    public routesPath: string,
  ) {}

  getRoutes = async () => {
    if (!this.routes || !this.isDev) {
      this.routes = await fs.readdir(this.routesPath, { recursive: true, withFileTypes: true });
    }

    return this.routes
  }
}
