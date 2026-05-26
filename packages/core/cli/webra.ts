#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { devCommandModule } from './commands/dev';

yargs()
  .command(devCommandModule)
  .help()
  .parse(hideBin(process.argv))
