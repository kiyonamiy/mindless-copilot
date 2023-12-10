import ColumnTypeEnum from '@/constants/column-type';
import { Table } from '@/types/table';
import generateCode from '../core';
import path from 'path';
import StringUtils from '@/utils/string';

export default function generateFrontend(
  projectRootDir: string,
  tables: Table[],
) {
  tables.forEach((table) => {
    const templateData = {
      index: 0,
      tableName: table.name,
      tableComment: table.comment,
      camelTableName: StringUtils.convertToCamelCase(table.name),
      hyphenTableName: StringUtils.convertToHyphenCase(table.name),
      pascalTableName: StringUtils.convertToPascalCase(table.name),
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
      path.resolve(__dirname, '../../../../templates/frontend'),
      path.resolve(projectRootDir, 'src/'),
      templateData,
    );
  });
}
