import { pino } from 'pino';

export const logger = pino({
  // level: 'silent',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  },
})
