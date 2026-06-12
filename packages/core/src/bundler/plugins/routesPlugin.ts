import path from 'node:path';
import type { Plugin } from 'vite';

type RoutesPluginOptions = {
  routesDir: string;
};

const VIRTUAL_MODULE_ID = 'virtual:vex-routes';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

export const routesPlugin = (options: RoutesPluginOptions): Plugin => {
  let root: string;
  return {
    name: 'vex:routes',
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID) return;

      const relRoutesDir = '/' + path.relative(root, options.routesDir).split(path.sep).join('/');
      const stripPrefix = relRoutesDir.replace(/\/[^/]+$/, '') + '/';

      return [
        `const modules = import.meta.glob([`,
        `'${relRoutesDir}/**/*',`,
        `'!${relRoutesDir}/**/*.ts',`,
        `])`,
        `export const routes = Object.fromEntries(`,
        `  Object.entries(modules).map(([p, loader]) => [`,
        `    p.replace(${JSON.stringify(stripPrefix)}, '').replace(/\\.[^/.]+$/, ''),`,
        `    loader,`,
        `  ])`,
        `)`,
      ].join('\n');
    },
  };
};
