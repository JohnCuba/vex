import type { Plugin } from 'vite'

type RoutesPluginOptions = {
  routesDir?: string
}

const VIRTUAL_MODULE_ID = 'virtual:webra-routes'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

export const routesPlugin = (options: RoutesPluginOptions = {}): Plugin => {
  const routesDir = options.routesDir ?? 'routes'

  return {
    name: 'webra:routes',
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID) return

      return [
        `const modules = import.meta.glob([`,
        `'/src/${routesDir}/**/*',`,
        `'!/src/${routesDir}/**/*.ts',`,
        `])`,
        `export const routes = Object.fromEntries(`,
        `  Object.entries(modules).map(([p, loader]) => [`,
        `    p.replace(/^\\/src\\//, '').replace(/\\.[^/.]+$/, ''),`,
        `    loader,`,
        `  ])`,
        `)`,
      ].join('\n')
    },
  }
}
