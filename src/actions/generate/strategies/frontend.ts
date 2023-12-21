import path from 'path';

import ColumnTypeEnum from '@/constants/column-type';
import { Table } from '@/types/table';
import StringUtils from '@/utils/string';

import generateCode from '../core';

export default async function generateFrontend(
  rootDir: string,
  tables: Table[],
  options: {
    overwrite?: boolean;
  },
) {
  for (const table of tables) {
    const templateData = {
      index: 0,
      tableName: table.name,
      tableComment: table.comment,
      camelTableName: StringUtils.UNDERSCORE.convertToCamelCase(table.name),
      hyphenTableName: StringUtils.UNDERSCORE.convertToHyphenCase(table.name),
      pascalTableName: StringUtils.UNDERSCORE.convertToPascalCase(table.name),
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
    await generateCode(
      path.resolve(__dirname, '../../../../templates/frontend'),
      rootDir,
      templateData,
      options,
    );
  }
}
