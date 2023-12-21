import fs from 'fs';
import path from 'path';

import Logger from '@/log';
import { Table, TableColumn } from '@/types/table';
import FileUtils from '@/utils/file';

export default async function ddl(options: {
  excel?: string;
  output?: string;
}) {
  if (options.excel == null) {
    Logger.error('请输入正确的 --excel 参数，确保其是一个存在的 excel 文件');
    return;
  }
  const excelFilepath = path.resolve(process.cwd(), options.excel);
  if (!fs.existsSync(excelFilepath)) {
    Logger.error('请输入正确的 --excel 参数，确保其是一个存在的 excel 文件');
    return;
  }
  const tables = FileUtils.loadTables(excelFilepath);
  if (tables == null) {
    return;
  }
  tables?.forEach((table) => {
    const ddl = tableToDDL(table);
    const output = options.output
      ? path.resolve(process.cwd(), options.output)
      : excelFilepath.replace(/\.\w+$/, '') + '.sql';
    try {
      fs.writeFileSync(output, ddl);
    } catch (e) {
      Logger.error(`DDL 生成失败，请检查参数！`);
      return;
    }
    Logger.success(`DDL 生成成功：${output}`);
  });
}

// 将 TableColumn 转换为 DDL 字符串
function columnToDDL(column: TableColumn): string {
  let ddl = `    \`${column.name}\` ${column.type}`;

  if (column.length) {
    ddl += `(${column.length})`;
  }

  if (column.unsigned) {
    ddl += ' UNSIGNED';
  }

  if (column.zeroFill) {
    ddl += ' ZEROFILL';
  }

  if (column.unique) {
    ddl += ' UNIQUE';
  }

  if (column.notNull) {
    ddl += ' NOT NULL';
  }

  if (column.default !== undefined) {
    ddl += ` DEFAULT ${column.default}`;
  }

  if (column.autoIncrement) {
    ddl += ' AUTO_INCREMENT';
  }

  if (column.comment) {
    ddl += ` COMMENT '${column.comment}'`;
  }

  // 其他属性的处理...

  return ddl;
}

// 将 Table 转换为 DDL 字符串
function tableToDDL(table: Table): string {
  const columnsDDL = table.columns.map(columnToDDL).join(',\n');
  const primaryKey = table.columns.find((column) => column.primaryKey);

  let ddl = `-- DROP TABLE IF EXISTS \`${table.name}\`; \n\n`;
  ddl += `CREATE TABLE IF NOT EXISTS \`${table.name}\` (\n${columnsDDL}`;

  if (primaryKey) {
    ddl += `,\n    PRIMARY KEY (\`${primaryKey.name}\`)`;
  }

  ddl += `\n)`;

  if (table.comment) {
    ddl += ` COMMENT '${table.comment}';`;
  }

  return ddl;
}
