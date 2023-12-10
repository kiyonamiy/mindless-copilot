import path from 'path';
import fs from 'fs';
import { Table } from '@/types/table';

import generateBackend from './strategies/backend';
import generateFrontend from './strategies/frontend';

const TEMPLATE_OPTIONS = ['frontend', 'backend'] as const;
type TemplateOption = (typeof TEMPLATE_OPTIONS)[number];

// 生成代码策略
const GenerateCodeStrategyMap: Record<
  TemplateOption,
  (projectRootDir: string, tables: Table[]) => void
> = {
  frontend: generateFrontend,
  backend: generateBackend,
};

export default function generate(options: {
  template?: TemplateOption | string;
  dir?: string;
}) {
  // TODO 丰富日志（console 不打印）
  // TODO 会直接覆盖掉已有的文件（没有做提示）

  // 确保参数符合预期
  if (
    options.template == null ||
    !(TEMPLATE_OPTIONS as unknown as string[]).includes(options.template)
  ) {
    console.log('请输入正确的 template 参数', TEMPLATE_OPTIONS);
    return;
  }
  if (options.dir != null && !isDirectoryExists(options.dir)) {
    console.log('请输入正确的 dir 参数，确保其是一个存在的文件夹');
    return;
  }
  // 项目根目录
  const projectRootDir =
    options.dir != null
      ? path.resolve(process.cwd(), options.dir)
      : process.cwd(); // 项目路径
  // 加载 tables
  const tables = loadTables(path.resolve(projectRootDir, 'sql/sql.json'));
  // 寻找对应策略
  const generateCode =
    GenerateCodeStrategyMap[options.template as TemplateOption];
  // 执行策略，生成代码
  generateCode(projectRootDir, tables);
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

/**
 * 判断文件夹是否存在
 * @param path 路径
 * @returns
 */
function isDirectoryExists(path: string): boolean {
  try {
    // 使用 fs.existsSync 判断路径是否存在
    if (fs.existsSync(path)) {
      // 使用 fs.statSync 获取路径的状态信息
      const stats = fs.statSync(path);

      // 判断是否是一个目录
      return stats.isDirectory();
    }
    // 路径不存在
    return false;
  } catch (error) {
    // 发生错误，路径不存在或者不是一个目录
    return false;
  }
}
