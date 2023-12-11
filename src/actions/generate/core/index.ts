import fs from 'fs';
import Handlebars from 'handlebars';
import inquirer from 'inquirer';
import path from 'path';

import Logger from '@/log';

const HBS_EXT = '.hbs';

/**
 * 组合数据和模板，生成代码，并将生成的代码写入到对应位置
 * @param templateDir 模板路径（相对于脚本）
 * @param targetDir 目标路径（相对于项目）
 * @param data 所有模板所需要的数据集合
 * @returns
 */
export default async function generateCode(
  templateDir: string,
  targetDir: string,
  data: {
    tableName: string;
    camelTableName: string;
    hyphenTableName: string;
    pascalTableName: string;
  } & Record<string, unknown>,
) {
  const files = fs.readdirSync(templateDir);
  // 遍历模板文件夹
  for (let i = 0; i < files.length; i += 1) {
    const filename = files[i];
    const tempFilepath = path.join(templateDir, filename); // 可能是 file，可能是 dir
    const stats = fs.statSync(tempFilepath);

    const targetFilename = filename
      .replace(/XxYyZz/g, data.pascalTableName)
      .replace(/xx-yy-zz/g, data.hyphenTableName)
      .replace(/xxYyZz/g, data.camelTableName);

    if (stats.isDirectory()) {
      const nextTargetDir = path.resolve(targetDir, targetFilename);
      if (fs.existsSync(nextTargetDir)) {
        Logger.debug(`文件夹已经存在（不影响代码生成）：${nextTargetDir}`);
      } else {
        fs.mkdirSync(nextTargetDir, { recursive: true });
      }
      await generateCode(tempFilepath, nextTargetDir, data);
    } else if (stats.isFile()) {
      let targetFilepath = path.resolve(targetDir, targetFilename);
      // 判断文件是否已经存在（是否需要做覆盖）
      {
        const targetFilepathTemp = targetFilepath.endsWith(HBS_EXT)
          ? targetFilepath.slice(0, -HBS_EXT.length)
          : targetFilepath;
        if (fs.existsSync(targetFilepathTemp)) {
          Logger.warn(`文件已经存在：${targetFilepathTemp}`);
          const { overwrite } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'overwrite',
              message: '文件已经存在，是否覆盖该文件？',
              default: true,
            },
          ]);
          if (!overwrite) {
            return;
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
