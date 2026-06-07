import path from 'node:path';
import { readdir } from 'node:fs/promises';

export type StaticRoute = {
  filePath: string;
};

export type DynamicRoute = {
  filePath: string;
  pattern: RegExp;
  paramNames: string[];
  specificity: number;
};

export type RouteRegistry = {
  static: Map<string, StaticRoute>;
  dynamic: DynamicRoute[];
};

const CATCH_ALL = /^\[\.\.\.(.+)\]$/;
const DYNAMIC = /^\[(.+)\]$/;

const fileToSegments = (routesDir: string, filePath: string): string[] => {
  const relative = path.relative(routesDir, filePath);
  const parts = relative.replace(/\.[^/.]+$/, '').split(path.sep);
  if (parts[parts.length - 1] === 'index') parts.pop();
  return parts.filter(Boolean);
};

const buildDynamicRoute = (filePath: string, segments: string[]): DynamicRoute => {
  let specificity = 0;
  const paramNames: string[] = [];

  const regexParts = segments.map((segment) => {
    const catchAll = segment.match(CATCH_ALL);
    if (catchAll?.[1]) {
      paramNames.push(catchAll[1]);
      return '(.+)';
    }
    const dynamic = segment.match(DYNAMIC);
    if (dynamic?.[1]) {
      paramNames.push(dynamic[1]);
      return '([^/]+)';
    }
    specificity++;
    return segment;
  });

  return {
    filePath,
    pattern: new RegExp(`^/${regexParts.join('/')}/?$`),
    paramNames,
    specificity,
  };
};

export const buildRegistry = async (routesDir: string): Promise<RouteRegistry> => {
  const entries = await readdir(routesDir, { recursive: true, withFileTypes: true });

  const staticRoutes = new Map<string, { filePath: string }>();
  const dynamicRoutes: DynamicRoute[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) continue;

    const filePath = path.join(entry.parentPath, entry.name);
    const segments = fileToSegments(routesDir, filePath);
    const pathname = segments.length === 0 ? '/' : `/${segments.join('/')}`;
    const hasDynamic = segments.some((s) => CATCH_ALL.test(s) || DYNAMIC.test(s));

    if (hasDynamic) {
      dynamicRoutes.push(buildDynamicRoute(filePath, segments));
    } else {
      staticRoutes.set(pathname, { filePath });
    }
  }

  // More static segments = matched first
  dynamicRoutes.sort((a, b) => b.specificity - a.specificity);

  return { static: staticRoutes, dynamic: dynamicRoutes };
};
