import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

import Logger from '@/log';
import { Table } from '@/types/table';
import FileUtils from '@/utils/file';

import generateBackend from './strategies/backend';
import generateFrontend from './strategies/frontend';

const TEMPLATE_OPTIONS = ['frontend', 'backend'] as const;
type TemplateOption = (typeof TEMPLATE_OPTIONS)[number];

// 生成代码策略
const GenerateCodeStrategyMap: Record<
  TemplateOption,
  (projectRootDir: string, tables: Table[]) => Promise<void>
> = {
  frontend: generateFrontend,
  backend: generateBackend,
};

export default async function generate(options: {
  template?: TemplateOption | string;
  dir?: string;
}) {
  Logger.info("当前正在执行 'generate' 指令");

  if (options.dir != null && !FileUtils.isDirectoryExists(options.dir)) {
    Logger.error('请输入正确的 --dir 参数，确保其是一个存在的文件夹');
    return;
  }
  // 项目根目录
  const projectRootDir =
    options.dir != null
      ? path.resolve(process.cwd(), options.dir)
      : process.cwd(); // 项目路径
  Logger.info(`指定项目路径为 ${projectRootDir}`);

  const { template } = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: '请选择生成代码的模板',
      choices: TEMPLATE_OPTIONS,
    },
  ]);
  // 加载 tables
  const tables = loadTables(path.resolve(projectRootDir, 'sql/sql.json'));
  // 寻找对应策略
  const generateCode = GenerateCodeStrategyMap[template as TemplateOption];
  // 执行策略，生成代码
  await generateCode(projectRootDir, tables);
}

/**
 * 从指定文件夹中读取并解析出 tables
 * @returns
 */
function loadTables(sqlFilepath: string): Table[] {
  const sqlJson = fs.readFileSync(sqlFilepath, 'utf-8');
  const tables = JSON.parse(sqlJson) as Table[];
  return tables;
}
