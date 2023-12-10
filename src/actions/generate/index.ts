import path from 'path';
import fs from 'fs';
import { Table } from '@/types/table';
import Handlebars from 'handlebars';
import ColumnTypeEnum from '@/constants/column-type';

export default function generate(options: {
  template?: 'frontend' | 'backend' | string;
  dir?: string;
}) {
  const projectRootDir =
    options.dir != null
      ? path.resolve(process.cwd(), options.dir)
      : process.cwd(); // 项目路径

  const tables = loadTables(path.resolve(projectRootDir, 'sql/sql.json'));
  if (options.template === 'frontend') {
    tables.forEach((table) => {
      const templateData = {
        index: 0,
        tableName: table.name,
        tableComment: table.comment,
        camelTableName: convertToCamelCase(table.name),
        hyphenTableName: convertToHyphenCase(table.name),
        pascalTableName: convertToPascalCase(table.name),
        tableColumns: table.columns.map((column) => {
          return {
            title: column.comment,
            dataIndex: column.name,
          };
        }),
        typeItems: table.columns.map((column) => {
          return {
            key: column.name,
            type: ColumnTypeEnum[column.type].jsMapping,
          };
        }),
      };
      generateCode(
        path.resolve(__dirname, '../../../templates/frontend'),
        path.resolve(projectRootDir, 'src/'),
        templateData,
      );
    });
  }

  if (options.template === 'backend') {
    // 以 XxxApplication.java 所在的文件夹为“生成代码”的根路径
    const targetDir = findDirContainingFile(
      path.resolve(projectRootDir, 'src/main/java'),
      /Application\.java$/,
    );
    if (targetDir == null) {
      // TODO 报错提示
      return;
    }
    const rootPackageName = path
      .relative(path.resolve(projectRootDir, 'src/main/java'), targetDir)
      .split('/')
      .join('.');
    tables.forEach((table, index) => {
      // 准备数据
      const templateData = {
        index,
        tableName: table.name,
        tableComment: table.comment,
        pascalTableName: convertToPascalCase(table.name),
        camelTableName: convertToPascalCase(table.name),
        hyphenTableName: convertToHyphenCase(table.name),
        rootPackageName,
        filterPrimaryKeyColumns: table.columns
          .filter(
            ({ primaryKey, autoIncrement }) => !primaryKey && !autoIncrement, // 过滤掉主键
          )
          .map(({ comment, name, type }) => {
            return {
              comment,
              name,
              camelName: convertToPascalCase(name),
              type: ColumnTypeEnum[type].javaMapping,
            };
          }),
        columns: table.columns.map(({ comment, name, type }) => {
          return {
            comment,
            name,
            camelName: convertToPascalCase(name),
            type: ColumnTypeEnum[type].javaMapping,
          };
        }),
      };
      // 生成代码
      generateCode(
        path.resolve(__dirname, '../../../templates/backend'),
        targetDir,
        templateData,
      );
    });
  }

  // TODO 处理 没输入 template 则报错
  // TODO 丰富日志（console 不打印）
  // TODO 会直接覆盖掉已有的文件（没有做提示）
}

function generateCode(
  templateDir: string,
  targetDir: string,
  data: {
    tableName: string;
    camelTableName: string;
    hyphenTableName: string;
    pascalTableName: string;
  } & Record<string, unknown>,
) {
  const hbsExt = '.hbs';

  const files = fs.readdirSync(templateDir);

  for (const filename of files) {
    const tempFilepath = path.join(templateDir, filename);
    const stats = fs.statSync(tempFilepath);
    const targetFilename = filename
      .replace(/XxYyZz/g, data.pascalTableName)
      .replace(/xx-yy-zz/g, data.hyphenTableName)
      .replace(/xxYyZz/g, data.camelTableName);
    if (stats.isDirectory()) {
      const nextTargetDir = path.resolve(targetDir, targetFilename);
      try {
        fs.mkdirSync(nextTargetDir, { recursive: true });
      } catch (err: unknown) {
        if (isErrnoException(err) && err?.code === 'EEXIST') {
          console.log('文件夹已经存在：', err.path);
          return;
        }
        throw err;
      }
      generateCode(tempFilepath, nextTargetDir, data);
    } else if (stats.isFile()) {
      let targetFilepath = path.resolve(targetDir, targetFilename);
      // 普通文件直接复制
      if (!targetFilepath.endsWith(hbsExt)) {
        fs.copyFileSync(tempFilepath, targetFilepath);
        return;
      }
      // hbs 文件：模板引擎渲染
      targetFilepath = targetFilepath.slice(0, -hbsExt.length);
      // 读取模板
      const templateContent = fs.readFileSync(tempFilepath, 'utf-8');
      // 模板与变量进行组合
      const templateDelegate = Handlebars.compile(templateContent);
      const compiledContent = templateDelegate(data);
      // 写入文件
      fs.writeFileSync(targetFilepath, compiledContent);
    }
  }
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

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return (err as NodeJS.ErrnoException)?.code !== undefined;
}

/**
 * 查找包含“指定文件”的文件夹
 * @param directory 寻找起点
 * @param fileName 所要寻找的文件名
 */

function findDirContainingFile(
  directory: string,
  regex: RegExp,
): string | null {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // 如果是目录，则递归调用
      const foundFolder = findDirContainingFile(filePath, regex);
      if (foundFolder) {
        return foundFolder; // 如果在子目录中找到了包含指定文件的文件夹，直接返回
      }
    } else if (stats.isFile() && regex.test(file)) {
      // 如果是文件，并且文件名匹配正则表达式，则返回包含该文件的文件夹路径
      return directory;
    }
  }

  return null; // 如果没有找到匹配文件，返回 null
}

// xx_yy_zz => xx-yy-zz
function convertToHyphenCase(input: string): string {
  return input.replace(/_/g, '-');
}

// xx-yy-zz => xxYyZz
function convertToCamelCase(input: string): string {
  return input.replace(/_./g, (match) => match.charAt(1).toUpperCase());
}

// xx-yy-zz => XxYyZz
function convertToPascalCase(input: string): string {
  const camelCase = convertToCamelCase(input);
  return camelCase.charAt(0).toLocaleUpperCase() + camelCase.slice(1);
}
