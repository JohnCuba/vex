import type { RouteKind, RouteRegistry } from './registry';

export type RouteMatch = {
  filePath: string;
  kind: RouteKind;
  params: Record<string, string>;
};

export const matchRoute = (registry: RouteRegistry, pathname: string): RouteMatch | null => {
  const normalized = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;

  const staticRoute = registry.static.get(normalized);
  if (staticRoute) {
    return { filePath: staticRoute.filePath, kind: staticRoute.kind, params: {} };
  }

  for (const route of registry.dynamic) {
    const match = normalized.match(route.pattern);
    if (!match) continue;

    const params: Record<string, string> = {};
    route.paramNames.forEach((name, i) => {
      params[name] = match[i + 1] ?? '';
    });
    return { filePath: route.filePath, kind: route.kind, params };
  }

  return null;
};
