#! /usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import figlet from 'figlet';

import ddlAction from '@/actions/ddl';
import generateAction from '@/actions/generate';

import packageJson from '../package.json';

const artText = figlet.textSync('Mindless Copilot');
console.log(chalk.hex('#9fdddd').bold(artText));

const program = new Command();
program
  .version(packageJson.version, '-v, --version', 'output the current version')
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
  .option('-t, --template <value>', '指定模板')
  .option('--excel <value>', '指定生成代码的描述结构的 excel 文件')
  .option('--overwrite', '直接覆盖已存在的文件')
  .action(generateAction);

program
  .command('ddl')
  .description('根据 excel 文件生成 ddl 脚本')
  .option('--excel <value>', 'excel 文件路径')
  .option('--output <value>', '输出文件路径')
  .action(ddlAction);

program.parse(process.argv);
