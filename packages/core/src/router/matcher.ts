import type { RouteRegistry } from './registry';

export type RouteMatch = {
  filePath: string;
  params: Record<string, string>;
};

export const matchRoute = (registry: RouteRegistry, pathname: string): RouteMatch | null => {
  const normalized = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;

  const staticRoute = registry.static.get(normalized);
  if (staticRoute) return { filePath: staticRoute.filePath, params: {} };

  for (const route of registry.dynamic) {
    const match = normalized.match(route.pattern);
    if (!match) continue;

    const params: Record<string, string> = {};
    route.paramNames.forEach((name, i) => {
      params[name] = match[i + 1] ?? '';
    });
    return { filePath: route.filePath, params };
  }

  return null;
};
