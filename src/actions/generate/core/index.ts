import fs from 'fs';
import Handlebars from 'handlebars';
import inquirer from 'inquirer';
import path from 'path';

import Logger from '@/log';
import { AdvancedTableColumn, Table, TableColumn } from '@/types/table';

const HBS_EXT = '.hbs';

Handlebars.registerHelper(
  'bothEach',
  function (a: AdvancedTableColumn[], b: AdvancedTableColumn[], options) {
    return [...a, ...b].map((item) => options.fn(item)).join('');
  },
);

Handlebars.registerHelper(
  'timeColumnsMapping',
  function (columns: Table['columns'], options) {
    return columns
      .map((column) => {
        // 过滤出只有时间类型的字段（这些字段需要做映射）
        if (['DATETIME', 'TIMESTAMP', 'DATE'].includes(column.type)) {
          return options.fn(column);
        }
      })
      .join('');
  },
);

Handlebars.registerHelper(
  'containsTimeColumn',
  function (columns: Table['columns'], options) {
    const contains = columns.some((column) => {
      if (['DATETIME', 'TIMESTAMP', 'DATE'].includes(column.type)) {
        return true;
      }
    });
    if (contains) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return options.fn(this);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return options.inverse(this);
    }
  },
);

Handlebars.registerHelper(
  'notColumnNull',
  function (column: TableColumn, options) {
    if (column.notNull) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return options.fn(this);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return options.inverse(this);
    }
  },
);

Handlebars.registerHelper(
  'isVoString',
  function (column: AdvancedTableColumn, options) {
    if (['String'].includes(column.voType)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return options.fn(this);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return options.inverse(this);
    }
  },
);

/**
 * 组合数据和模板，生成代码，并将生成的代码写入到对应位置
 * @param templateDir 模板路径（相对于脚本）
 * @param targetDir 目标路径（相对于项目）
 * @param data 所有模板所需要的数据集合
 * @returns
 */
export default async function generateCode(
  templateRootDir: string,
  targetRootDir: string,
  data: {
    tableName: string;
    camelTableName: string;
    hyphenTableName: string;
    pascalTableName: string;
  } & Record<string, unknown>,
  options: {
    overwrite?: boolean;
    filepathMap?: Record<string, string>;
  },
) {
  // 内部定义 generateCodeRecursively 递归函数，直接复用外部的参数，不需要重复传入
  async function generateCodeRecursively(
    curTemplateDir: string,
    curTargetDir: string,
  ) {
    const files = fs.readdirSync(curTemplateDir);
    // 遍历模板文件夹
    for (let i = 0; i < files.length; i += 1) {
      const filename = files[i];
      const tempFilepath = path.join(curTemplateDir, filename); // 可能是 file，可能是 dir
      const stats = fs.statSync(tempFilepath);

      // 做目标文件路径映射（controller -> xx/controller），并做文件名替换
      const relativeTempPath = path.relative(templateRootDir, tempFilepath);
      const targetFilename = (
        options.filepathMap?.[relativeTempPath] || filename
      )
        .replace(/XxYyZz/g, data.pascalTableName)
        .replace(/xx-yy-zz/g, data.hyphenTableName)
        .replace(/xxYyZz/g, data.camelTableName);

      if (stats.isDirectory()) {
        const nextTargetDir = path.resolve(curTargetDir, targetFilename);
        if (fs.existsSync(nextTargetDir)) {
          Logger.debug(`文件夹已经存在（不影响代码生成）：${nextTargetDir}`);
        } else {
          fs.mkdirSync(nextTargetDir, { recursive: true });
        }
        await generateCodeRecursively(tempFilepath, nextTargetDir);
      } else if (stats.isFile()) {
        let targetFilepath = path.resolve(curTargetDir, targetFilename);
        // 判断文件是否已经存在（是否需要做覆盖）
        {
          const targetFilepathTemp = targetFilepath.endsWith(HBS_EXT)
            ? targetFilepath.slice(0, -HBS_EXT.length)
            : targetFilepath;
          if (fs.existsSync(targetFilepathTemp)) {
            Logger.warn(
              `文件已经存在${
                options.overwrite && '(直接覆盖)'
              }：${targetFilepathTemp}`,
            );
            // 不直接覆盖，则询问
            if (!options.overwrite) {
              const result = await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'overwrite',
                  message: '文件已经存在，是否覆盖该文件？',
                  default: true,
                },
              ]);
              // 不覆盖则返回
              if (!result.overwrite) {
                return;
              }
            }
          }
        }
        // 如果是模板文件
        if (targetFilepath.endsWith(HBS_EXT)) {
          // hbs 文件：模板引擎渲染
          targetFilepath = targetFilepath.slice(0, -HBS_EXT.length);
          // 读取模板
          const templateContent = fs.readFileSync(tempFilepath, 'utf-8');
          // 模板与变量进行组合
          const templateDelegate = Handlebars.compile(templateContent);
          const compiledContent = templateDelegate(data);
          // 写入文件
          fs.writeFileSync(targetFilepath, compiledContent);
        } else {
          // 如果是普通文件
          fs.copyFileSync(tempFilepath, targetFilepath);
        }
        Logger.success(`代码生成成功 ${targetFilepath}\n`);
      }
    }
  }

  return generateCodeRecursively(templateRootDir, targetRootDir);
}
