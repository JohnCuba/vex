#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { devCommandModule } from './commands/dev';
import { buildCommandModule } from './commands/build';
import { startCommandModule } from './commands/start';

yargs()
  .command(devCommandModule)
  .command(buildCommandModule)
  .command(startCommandModule)
  .help()
  .parse(hideBin(process.argv))
