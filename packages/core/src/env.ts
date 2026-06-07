import * as Container from './container';
import type { VexConfigEnv } from './types';

export const isProd = () => Container.inject('env').mode === 'production';
export const isDev = () => Container.inject('env').mode === 'development';

export const resolver = <T>(variants: Record<VexConfigEnv['mode'], T>): T => {
  return variants[Container.inject('env').mode] ?? variants.production;
};
