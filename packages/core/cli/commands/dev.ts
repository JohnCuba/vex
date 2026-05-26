import type { CommandModule } from 'yargs';
import { logger } from '../../src/logger';
import { App } from '../../src/app';

export const devCommandModule: CommandModule = {
  command: 'dev',
  describe: 'run project in development mode',
  handler: async () => {
    logger.info('Webra started')

    const app = new App()

    await app.create()
    await app.start()
  }
}
