import path from 'node:path'
import { Server } from '../../src/server.ts';
import { Controller } from '../../src/controller.ts';
import type { CommandModule } from 'yargs';

export const devCommandModule: CommandModule = {
  command: 'dev',
  describe: 'run project in development mode',
  handler: () => {
    console.log('Start webra');

    const routesPath = path.resolve(process.cwd(), 'src', 'routes')
    const controller = new Controller(routesPath)
    const server = new Server(controller)

    server.start()
  }
}
