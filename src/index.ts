#! /usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import figlet from 'figlet';

import generateAction from '@/actions/generate';

const artText = figlet.textSync('Mindless Copilot');
console.log(chalk.hex('#9fdddd').bold(artText));

const program = new Command();
program
  .version('1.0.0', '-v, --version', 'output the current version')
  .description('小组定制化代码生成');
// // .option('-l, --ls  [value]', 'List directory contents')
// // .option('-m, --mkdir <value>', 'Create a directory')
// // .option('-t, --touch <value>', 'Create a file')
// .option('-c, --code', 'Generate code')
// .action(mindlessCopilot);

program
  .command('generate')
  .description('代码生成')
  .option('-d, --dir <value>', '指定项目目录，默认是当前文件夹')
  .action(generateAction);

program.parse(process.argv);
