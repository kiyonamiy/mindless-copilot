import path from 'path';
import fs from 'fs';
import { Table } from './types/table';
import Handlebars from 'handlebars';
import ColumnTypeEnum from './constants/column-type';

export default function mindlessCopilot(options: { code: boolean }) {
  if (options.code) {
    const currentWorkingDir = process.cwd(); // 当前执行命令的目录
    const tables = loadTables();
    // 通用文件夹创建
    const pagesRootDir = path.resolve(currentWorkingDir, './src/pages');
    const typesRootDir = path.resolve(currentWorkingDir, './src/types');
    mkdirSafely(path.resolve(pagesRootDir));
    mkdirSafely(path.resolve(typesRootDir));

    tables.forEach((table) => {
      // 先创建出所有需要的目录
      const tableNameSegments = table.name.split('_');
      const moduleName = tableNameSegments.join('-');
      const typeName = tableNameSegments
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join('');
      // TODO 处理文件创建失败的情况
      mkdirSafely(path.resolve(pagesRootDir, `${moduleName}/hooks`));
      // 再创建所有需要的文件
      {
        // 创建 /pages/{ENTITY}/hooks/table-columns.tsx
        // 读取模板
        const templateContent = fs.readFileSync(
          path.resolve(
            __dirname,
            '../templates/pages/table-page/hooks/table-columns.tsx.hbs',
          ),
          'utf-8',
        );
        // 模板与变量进行组合
        const templateDelegate = Handlebars.compile(templateContent);
        const compiledContent = templateDelegate({
          moduleName,
          typeName,
          columns: table.columns.map((column) => {
            return {
              title: column.comment,
              dataIndex: column.name,
            };
          }),
        });
        // 写入文件
        fs.writeFileSync(
          path.resolve(pagesRootDir, `${moduleName}/hooks/table-columns.tsx`),
          compiledContent,
        );
      }
      {
        // 创建 /types/{ENTITY}.ts
        // 读取模板
        const templateContent = fs.readFileSync(
          path.resolve(__dirname, '../templates/types/index.ts.hbs'),
          'utf-8',
        );
        // 模板与变量进行组合
        const templateDelegate = Handlebars.compile(templateContent);
        const compiledContent = templateDelegate({
          typeName,
          columns: table.columns.map((column) => {
            return {
              key: column.name,
              type: ColumnTypeEnum[column.type].jsMapping,
            };
          }),
        });
        // 写入文件
        fs.writeFileSync(
          path.resolve(typesRootDir, `${moduleName}.ts`),
          compiledContent,
        );
      }
    });

    // const templateContent = fs.readFileSync(
    //   path.resolve(__dirname, '../templates/template.hbs'),
    //   'utf-8',
    // );
    // const template = Handlebars.compile(templateContent);
    // console.log(
    //   template({
    //     componentName: 'MyComponent',
    //   }),
    // );
  }
}

/**
 * 从指定文件夹中读取并解析出 tables
 * @returns
 */
function loadTables(): Table[] {
  const currentWorkingDir = process.cwd(); // 当前执行命令的目录
  const sqlFilepath = path.resolve(currentWorkingDir, 'sql/sql.json'); // TODO 也可以从命令行读取
  const sqlJson = fs.readFileSync(sqlFilepath, 'utf-8');
  const tables = JSON.parse(sqlJson) as Table[];
  return tables;
}

/**
 * 创建文件夹时候可能会出现“文件夹已经存在”的情况，不抛错继续执行
 * @param dirPath 要创建的文件夹的绝对路径
 * @returns void
 */
function mkdirSafely(dirPath: string): void {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (err: unknown) {
    if (isErrnoException(err) && err?.code === 'EEXIST') {
      console.log('文件夹已经存在：', err.path);
      return;
    }
    throw err;
  }
}

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return (err as NodeJS.ErrnoException)?.code !== undefined;
}
