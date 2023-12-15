import fs from 'fs';
import path from 'path';

import ColumnTypeEnum from '@/constants/column-type';
import Logger from '@/log';
import { Table } from '@/types/table';
import StringUtils from '@/utils/string';

import generateCode from '../core';

export default async function generateBackend(
  projectRootDir: string,
  tables: Table[],
) {
  // 以 XxxApplication.java 所在的文件夹为“生成代码”的根路径
  const targetDir = findDirContainingFile(
    path.resolve(projectRootDir, 'src/main/java'),
    /Application\.java$/,
  );
  if (targetDir == null) {
    Logger.error(
      '找不到 src/main/java 下的 Application.java 文件，代码生成终止',
    );
    return;
  }
  const rootPackageName = path
    .relative(path.resolve(projectRootDir, 'src/main/java'), targetDir)
    .split('/')
    .join('.');
  for (let i = 0; i < tables.length; i += 1) {
    const table = tables[i];
    // 准备数据
    const templateData = {
      index: i,
      tableName: table.name,
      tableComment: table.comment,
      tableModule: table.module,
      pascalTableName: StringUtils.convertToPascalCase(table.name),
      camelTableName: StringUtils.convertToCamelCase(table.name),
      hyphenTableName: StringUtils.convertToHyphenCase(table.name),
      rootPackageName,
      filterPrimaryKeyTimeColumns: table.columns
        .filter(
          ({ type, primaryKey, autoIncrement }) =>
            (type === 'DATETIME' || type === 'TIMESTAMP' || type === 'DATE') &&
            !primaryKey &&
            !autoIncrement,
        )
        .map(({ comment, name, type }) => ({
          comment,
          name,
          camelName: StringUtils.convertToPascalCase(name),
          type: type,
          doType: ColumnTypeEnum[type].javaDOMapping,
          voType: ColumnTypeEnum[type].javaVOMapping,
        })),
      filterPrimaryKeyColumns: table.columns
        .filter(
          ({ primaryKey, autoIncrement }) => !primaryKey && !autoIncrement, // 过滤掉主键
        )
        .map(({ comment, name, type }) => {
          return {
            comment,
            name,
            camelName: StringUtils.convertToPascalCase(name),
            type: type,
            doType: ColumnTypeEnum[type].javaDOMapping,
            voType: ColumnTypeEnum[type].javaVOMapping,
          };
        }),
      columns: table.columns.map(({ comment, name, type }) => {
        return {
          comment,
          name,
          camelName: StringUtils.convertToPascalCase(name),
          type: type,
          doType: ColumnTypeEnum[type].javaDOMapping,
          voType: ColumnTypeEnum[type].javaVOMapping,
        };
      }),
    };
    // 生成代码
    await generateCode(
      path.resolve(__dirname, '../../../../templates/backend'),
      targetDir,
      templateData,
    );
  }
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
