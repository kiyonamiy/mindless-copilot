import path from 'path';
import fs from 'fs';
import { Table } from './types/table';
import Handlebars from 'handlebars';

export default function mindlessCopilot(options: { code: boolean }) {
  if (options.code) {
    const currentWorkingDir = process.cwd(); // 当前执行命令的目录

    const sqlFilepath = path.resolve(currentWorkingDir, 'sql/sql.json'); // TODO 也可以从命令行读取
    const sqlJson = fs.readFileSync(sqlFilepath, 'utf-8');
    const tables = JSON.parse(sqlJson) as Table[];

    const pagesRootDir = path.resolve(currentWorkingDir, './src/pages');
    tables.forEach((table) => {
      const tableNameWords = table.name.split('_');
      const pageDirName = tableNameWords.join('-');
      // TODO 处理文件创建失败的情况
      fs.mkdirSync(path.resolve(pagesRootDir, pageDirName));
      fs.mkdirSync(path.resolve(pagesRootDir, `${pageDirName}/hooks`));
      {
        // 读取模板
        const templateContent = fs.readFileSync(
          path.resolve(
            __dirname,
            '../templates/table-page/hooks/table-columns.tsx.hbs',
          ),
          'utf-8',
        );
        // 模板与变量进行组合
        const templateDelegate = Handlebars.compile(templateContent);
        const compiledContent = templateDelegate({
          columns: table.columns.map((column) => {
            return {
              title: column.comment,
              dataIndex: column.name,
            };
          }),
        });
        // 写入文件
        fs.writeFileSync(
          path.resolve(
            path.resolve(
              pagesRootDir,
              `${pageDirName}/hooks/table-columns.tsx`,
            ),
          ),
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
