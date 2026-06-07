import pino from 'pino';
import type { VexConfigEnv } from './types';

export type Logger = pino.Logger;
export type Level = pino.Level;

const buildDevOptions = (level: Level): pino.LoggerOptions<never, boolean> => ({
  level,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

const buildProdOptions = (level: Level): pino.LoggerOptions<never, boolean> => ({
  level,
});

export const init = (mode: VexConfigEnv['mode'], level: Level) =>
  pino(mode === 'development' ? buildDevOptions(level) : buildProdOptions(level));
