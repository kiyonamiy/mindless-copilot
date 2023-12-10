import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';

/**
 * 组合数据和模板，生成代码，并将生成的代码写入到对应位置
 * @param templateDir 模板路径（相对于脚本）
 * @param targetDir 目标路径（相对于项目）
 * @param data 所有模板所需要的数据集合
 * @returns
 */
export default function generateCode(
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

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return (err as NodeJS.ErrnoException)?.code !== undefined;
}
