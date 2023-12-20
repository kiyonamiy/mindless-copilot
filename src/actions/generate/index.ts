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
  (
    rootDir: string,
    tables: Table[],
    options: Record<string, unknown>,
  ) => Promise<void>
> = {
  frontend: generateFrontend,
  backend: generateBackend,
};

export default async function generate(options: {
  template?: TemplateOption | string;
  dir?: string;
  excel?: string;
  overwrite?: boolean;
}) {
  Logger.info(
    `当前正在执行 'generate' 指令${
      options.overwrite && '（直接覆盖已有文件）'
    }`,
  );
  Logger.info("建议：请将其他代码提交后再执行 'generate' 指令");

  if (options.dir == null) {
    Logger.error('请输入正确的 --dir 参数');
    return;
  }
  if (options.excel == null) {
    Logger.error('请输入正确的 --excel 参数');
    return;
  }
  // 项目根目录
  const projectRootDir = path.resolve(process.cwd(), options.dir);
  if (!FileUtils.isDirectoryExists(projectRootDir)) {
    Logger.error('请输入正确的 --dir 参数，确保其是一个存在的文件夹');
    return;
  }
  Logger.info(`指定项目路径为 ${projectRootDir}`);

  let template = options.template;
  if (
    template == null ||
    !(TEMPLATE_OPTIONS as readonly string[]).includes(template)
  ) {
    const result = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: '请选择生成代码的模板',
        choices: TEMPLATE_OPTIONS,
      },
    ]);
    template = result.template;
  }
  // 加载 tables
  const excelFilepath = path.resolve(projectRootDir, options.excel);
  const tables = FileUtils.loadTables(excelFilepath);
  if (tables == null) {
    return;
  }
  // 寻找对应策略
  const generateCode = GenerateCodeStrategyMap[template as TemplateOption];
  // 执行策略，生成代码
  await generateCode(projectRootDir, tables, {
    overwrite: !!options.overwrite,
  });
}
