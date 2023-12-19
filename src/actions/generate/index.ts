import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import xlsx from 'xlsx';

import Logger from '@/log';
import { Table, TableColumn } from '@/types/table';
import FileUtils from '@/utils/file';

import generateBackend from './strategies/backend';
import generateFrontend from './strategies/frontend';

const TEMPLATE_OPTIONS = ['frontend', 'backend'] as const;
type TemplateOption = (typeof TEMPLATE_OPTIONS)[number];

// 生成代码策略
const GenerateCodeStrategyMap: Record<
  TemplateOption,
  (
    projectRootDir: string,
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
  let tables: Table[] | null = null;
  try {
    tables = loadTables(excelFilepath);
    if (tables == null) {
      throw new Error();
    }
  } catch (e) {
    Logger.error(
      `请提供正确的生成代码的描述结构的 excel 文件, ${excelFilepath}`,
    );
    return;
  }
  // 寻找对应策略
  const generateCode = GenerateCodeStrategyMap[template as TemplateOption];
  // 执行策略，生成代码
  await generateCode(projectRootDir, tables!, {
    overwrite: !!options.overwrite,
  });
}

/**
 * 从指定文件夹中读取并解析出 tables
 * @returns
 */
function loadTables(excelFilepath: string): Table[] | null {
  const TABLE_INFO_ROWS = 6;
  const excelFileContent = fs.readFileSync(excelFilepath);
  // 解析 Excel 文件
  const workbook = xlsx.read(excelFileContent, { type: 'buffer' });
  // 获取第一个工作表（通常为 Sheet1）
  const firstSheetName = workbook.SheetNames[0]; // TODO
  const worksheet = workbook.Sheets[firstSheetName];
  // 将工作表转换为 JSON 对象
  const excelColumns: {
    Name: string;
    Type: TableColumn['type'];
    Comment: string;
    Length: number;
    Default: string;
    ['Not Null']: boolean;
    ['Primary Key']: boolean;
    UNIQUE: boolean;
    UNSIGNED: boolean;
    Zerofill: boolean;
    ['Auto Increment']: boolean;
    ['创建时需要']: boolean;
    ['更新时需要']: boolean;
    ['作为分页查询条件']: boolean;
    ['分页结果包含']: boolean;
    ['详情结果包含']: boolean; // TODO 类型抽离
  }[] = xlsx.utils.sheet_to_json(worksheet, {
    range: TABLE_INFO_ROWS,
  });

  const columns: TableColumn[] = excelColumns.map((item) => ({
    name: item.Name,
    type: item.Type,
    comment: item.Comment,
    length: item.Length,
    default: item.Default,
    notNull: item['Not Null'],
    primaryKey: item['Primary Key'],
    unique: item.UNIQUE,
    unsigned: item.UNSIGNED,
    zeroFill: item.Zerofill,
    autoIncrement: item['Auto Increment'],
    createRequired: item['创建时需要'],
    updateRequired: item['更新时需要'],
    pageQuery: item['作为分页查询条件'],
    pageItemRespInclude: item['分页结果包含'],
    detailRespInclude: item['详情结果包含'],
  }));

  // 将工作表转换为 JSON 对象，仅包括指定行范围
  const excelTableInfo = xlsx.utils
    .sheet_to_csv(worksheet)
    .split('\n')
    .slice(0, TABLE_INFO_ROWS) // 前六行
    .map((row) => row.split(',').filter((str) => !!str))
    .filter((row) => !!row?.length) as [
    ['表名', string],
    ['表中文名', string],
    ['所属模块', string],
  ];

  // TODO 解析错误的情况

  return [
    {
      name: excelTableInfo[0][1],
      comment: excelTableInfo[1][1],
      columns,
      module: excelTableInfo[2][1],
    },
  ];
}
