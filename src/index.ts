#! /usr/bin/env node
import { Command } from 'commander';
import generateAction from '@/actions/generate';

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
  .option('-t, --template <value>', 'frontend or backend')
  .option('-d, --dir <value>', '指定项目目录，默认是当前文件夹')
  .action(generateAction);

program.parse(process.argv);
