import path from 'path';

import ColumnTypeEnum from '@/constants/column-type';
import { AdvancedTableColumn, Table } from '@/types/table';
import StringUtils from '@/utils/string';

import generateCode from '../core';

export default async function generateBackend(
  rootDir: string,
  tables: Table[],
  options: {
    overwrite?: boolean;
  },
) {
  for (let i = 0; i < tables.length; i += 1) {
    const table = tables[i];
    const tableNameWithoutPrefix = getTableNameWithoutModule(
      table.name,
      table.module,
    );
    // 准备数据
    const templateData = {
      tableNo: table.no,
      tableName: table.name,
      tableComment: table.comment,
      tableModule: table.module,
      apiPrefix: table.apiPrefix,
      uppercaseTableName: tableNameWithoutPrefix.toUpperCase(),
      pascalTableName: StringUtils.UNDERSCORE.convertToPascalCase(
        tableNameWithoutPrefix,
      ),
      camelTableName: StringUtils.UNDERSCORE.convertToCamelCase(
        tableNameWithoutPrefix,
      ),
      hyphenTableName: StringUtils.UNDERSCORE.convertToHyphenCase(
        tableNameWithoutPrefix,
      ),
      // java 包数据
      rootPackageName: table.rootPackageName,
      controllerPackageName: StringUtils.SLASH.convertToDotCase(
        table.filepathMap.controller || 'controller',
      ),
      voPackageName: StringUtils.SLASH.convertToDotCase(
        table.filepathMap.vo || 'vo',
      ),
      servicePackageName: StringUtils.SLASH.convertToDotCase(
        table.filepathMap.service || 'service',
      ),
      domainPackageName: StringUtils.SLASH.convertToDotCase(
        table.filepathMap.domain || 'domain',
      ),
      convertPackageName: StringUtils.SLASH.convertToDotCase(
        table.filepathMap.convert || 'convert',
      ),
      // 列数据
      ...classifyColumns(table.columns),
    };
    // 生成代码
    await generateCode(
      path.resolve(__dirname, '../../../../templates/backend'),
      rootDir,
      templateData,
      {
        ...options,
        filepathMap: table.filepathMap,
      },
    );
  }
}

const getTableNameWithoutModule = (tableName: string, moduleName?: string) => {
  if (moduleName == null) {
    return tableName;
  }
  if (tableName.startsWith(moduleName)) {
    return tableName.substring(moduleName.length + 1);
  }
  return tableName;
};

const classifyColumns = (columns: Table['columns']) => {
  const processedColumns: AdvancedTableColumn[] = columns.map((column) => ({
    ...column,
    camelName: StringUtils.UNDERSCORE.convertToCamelCase(column.name),
    pascalName: StringUtils.UNDERSCORE.convertToPascalCase(column.name),
    upperName: column.name.toUpperCase(),
    doType: ColumnTypeEnum[column.type].javaDOMapping,
    voType: ColumnTypeEnum[column.type].javaVOMapping,
  }));
  // 公共字段
  const baseColumns = processedColumns.filter(
    (column) =>
      column.createRequired &&
      column.updateRequired &&
      column.detailRespInclude,
  );
  // 取创建时独有的字段
  const createRequiredColumns = processedColumns.filter(
    (column) =>
      column.createRequired && !baseColumns.some((c) => c.name === column.name),
  );
  // 取更新时独有的字段
  const updateRequiredColumns = processedColumns.filter(
    (column) =>
      column.updateRequired && !baseColumns.some((c) => c.name === column.name),
  );
  // 取详情时独有的字段
  const detailRespIncludeColumns = processedColumns.filter(
    (column) =>
      column.detailRespInclude &&
      !baseColumns.some((c) => c.name === column.name),
  );
  // 取分页时时独有的字段
  const pageItemRespIncludeColumns = processedColumns.filter(
    (column) =>
      column.pageItemRespInclude &&
      !baseColumns.some((c) => c.name === column.name),
  );
  // 取分页查询条件的字段
  const pageQueryColumns = processedColumns.filter(
    (column) => column.pageQuery,
  );
  // 取 DO 字段
  const doColumns = processedColumns.filter(
    (column) =>
      !['id', 'create_time', 'update_time', 'delete_time'].includes(
        column.name,
      ),
  );

  return {
    baseColumns,
    createRequiredColumns,
    updateRequiredColumns,
    detailRespIncludeColumns,
    pageItemRespIncludeColumns,
    pageQueryColumns,
    doColumns,
  };
};

// /**
//  * 查找包含“指定文件”的文件夹
//  * @param directory 寻找起点
//  * @param fileName 所要寻找的文件名
//  */

// function findDirContainingFile(
//   directory: string,
//   regex: RegExp,
// ): string | null {
//   const files = fs.readdirSync(directory);

//   for (const file of files) {
//     const filePath = path.join(directory, file);
//     const stats = fs.statSync(filePath);

//     if (stats.isDirectory()) {
//       // 如果是目录，则递归调用
//       const foundFolder = findDirContainingFile(filePath, regex);
//       if (foundFolder) {
//         return foundFolder; // 如果在子目录中找到了包含指定文件的文件夹，直接返回
//       }
//     } else if (stats.isFile() && regex.test(file)) {
//       // 如果是文件，并且文件名匹配正则表达式，则返回包含该文件的文件夹路径
//       return directory;
//     }
//   }

//   return null; // 如果没有找到匹配文件，返回 null
// }
