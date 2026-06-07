import type { ViteDevServer } from 'vite'

export const loadModule = async <T = Record<string, unknown>>(
  filePath: string,
  viteDevServer: ViteDevServer | null,
): Promise<T> => {
  if (viteDevServer) {
    return viteDevServer.ssrLoadModule(filePath) as Promise<T>
  }
  return import(filePath) as Promise<T>
}
