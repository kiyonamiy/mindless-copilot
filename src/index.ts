#! /usr/bin/env node
import { Command } from 'commander';
import mindlessCopilot from './mindless-copilot';

const program = new Command();
program
  .version('1.0.0')
  .description('小组定制化代码生成')
  // .option('-l, --ls  [value]', 'List directory contents')
  // .option('-m, --mkdir <value>', 'Create a directory')
  // .option('-t, --touch <value>', 'Create a file')
  .option('-c, --code', 'Generate code')
  .parse(process.argv);

const options = program.opts<{
  code: boolean;
}>(); // node build/index.js -l

mindlessCopilot(options);
