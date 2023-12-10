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
    // 通用文件夹创建
    const pagesRootDir = path.resolve(projectRootDir, './src/pages');
    const typesRootDir = path.resolve(projectRootDir, './src/types');
    mkdirSafely(path.resolve(pagesRootDir));
    mkdirSafely(path.resolve(typesRootDir));

    tables.forEach((table) => {
      // 先创建出所有需要的目录
      const tableNameSegments = table.name.split('_');
      const moduleName = tableNameSegments.join('-');
      const typeName = tableNameSegments
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join('');
      mkdirSafely(path.resolve(pagesRootDir, `${moduleName}/hooks`));
      // 创建 /pages/{moduleName}/hooks/table-columns.tsx
      generateCodeByTemplate(
        path.resolve(
          __dirname,
          '../../../templates/frontend/pages/table-page/hooks/table-columns.tsx.hbs',
        ),
        path.resolve(pagesRootDir, `${moduleName}/hooks/table-columns.tsx`),
        {
          moduleName,
          typeName,
          columns: table.columns.map((column) => {
            return {
              title: column.comment,
              dataIndex: column.name,
            };
          }),
        },
      );
      // 创建 /pages/{moduleName}/index.less
      generateCodeByTemplate(
        path.resolve(
          __dirname,
          '../../../templates/frontend/pages/table-page/index.less.hbs',
        ),
        path.resolve(pagesRootDir, `${moduleName}/index.less`),
        {
          moduleName,
        },
      );
      // 创建 /pages/{moduleName}/index.ts
      generateCodeByTemplate(
        path.resolve(
          __dirname,
          '../../../templates/frontend/pages/table-page/index.tsx.hbs',
        ),
        path.resolve(pagesRootDir, `${moduleName}/index.tsx`),
        {
          moduleName,
          typeName,
        },
      );
      // 创建 /types/{moduleName}.ts
      generateCodeByTemplate(
        path.resolve(
          __dirname,
          '../../../templates/frontend/types/index.ts.hbs',
        ),
        path.resolve(typesRootDir, `${moduleName}.ts`),
        {
          typeName,
          columns: table.columns.map((column) => {
            return {
              key: column.name,
              type: ColumnTypeEnum[column.type].jsMapping,
            };
          }),
        },
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
    tables.forEach((table, index) => {
      // xx_yy_zz
      const tableNameSegments = table.name.split('_');
      // xx-yy-zz
      const moduleName = tableNameSegments.join('-');
      // XxYyZx
      const typeName = tableNameSegments
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join('');
      // xxYyZz
      const entityName =
        tableNameSegments.slice(0, 1) +
        tableNameSegments
          .slice(1)
          .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join('');
      const rootPackageName = path
        .relative(path.resolve(projectRootDir, 'src/main/java'), targetDir)
        .split('/')
        .join('.');
      const dataobjectDir = path.resolve(targetDir, 'domain/dataobject');
      mkdirSafely(dataobjectDir);
      const mapperDir = path.resolve(targetDir, 'domain/mapper');
      mkdirSafely(mapperDir);
      const controllerDir = path.resolve(targetDir, 'controller');
      mkdirSafely(controllerDir);
      const serviceDir = path.resolve(targetDir, 'service');
      mkdirSafely(serviceDir);
      const voDir = path.resolve(targetDir, 'vo');
      mkdirSafely(voDir);
      const dtoDir = path.resolve(targetDir, 'dto');
      mkdirSafely(dtoDir);
      const converterDir = path.resolve(targetDir, 'converter');
      mkdirSafely(converterDir);
      // 创建 {targetDir}/domain/dataobject/{XxYyZzDO}.java
      generateCodeByTemplate(
        path.resolve(
          __dirname,
          '../../../templates/backend/domain/dataobject/XxYyZzDO.java.hbs',
        ),
        path.resolve(dataobjectDir, `${typeName}DO.java`),
        {
          rootPackageName,
          typeName,
          tableName: table.name,
          columns: table.columns.map(({ comment, name, type }) => {
            return {
              comment,
              name,
              type: ColumnTypeEnum[type].javaMapping,
            };
          }),
        },
      );
      // 创建 {targetDir}/domain/mapper/{XxYyZzMapper}.java
      generateCodeByTemplate(
        path.resolve(
          __dirname,
          '../../../templates/backend/domain/mapper/XxYyZzMapper.java.hbs',
        ),
        path.resolve(mapperDir, `${typeName}Mapper.java`),
        {
          rootPackageName,
          typeName,
        },
      );
      // 创建 {targetDir}/controller/{XxYyZzController}.java
      generateCodeByTemplate(
        path.resolve(
          __dirname,
          '../../../templates/backend/controller/XxYyZzController.java.hbs',
        ),
        path.resolve(controllerDir, `${typeName}Controller.java`),
        {
          tableComment: table.comment,
          index,
          moduleName,
          rootPackageName,
          typeName,
          entityName,
        },
      );
      // 创建 {targetDir}/service/{XxYyZzService}.java
      generateCodeByTemplate(
        path.resolve(
          __dirname,
          '../../../templates/backend/service/XxYyZzService.java.hbs',
        ),
        path.resolve(serviceDir, `${typeName}Service.java`),
        {
          rootPackageName,
          typeName,
          // entityName,
        },
      );
      // 创建 {targetDir}/service/{XxYyZzServiceImpl}.java
      generateCodeByTemplate(
        path.resolve(
          __dirname,
          '../../../templates/backend/service/XxYyZzServiceImpl.java.hbs',
        ),
        path.resolve(serviceDir, `${typeName}ServiceImpl.java`),
        {
          rootPackageName,
          typeName,
          entityName,
        },
      );
      // 创建 {targetDir}/converter/{XxYyZzConverter}.java
      generateCodeByTemplate(
        path.resolve(
          __dirname,
          '../../../templates/backend/converter/XxYyZzConverter.java.hbs',
        ),
        path.resolve(converterDir, `${typeName}Converter.java`),
        {
          rootPackageName,
          typeName,
          entityName,
        },
      );
      // 创建 {targetDir}/vo/{XxYyZzCreateReqVO}.java
      generateCodeByTemplate(
        path.resolve(
          __dirname,
          '../../../templates/backend/vo/XxYyZzCreateReqVO.java.hbs',
        ),
        path.resolve(voDir, `${typeName}CreateReqVO.java`),
        {
          rootPackageName,
          typeName,
        },
      );
      // 创建 {targetDir}/vo/{XxYyZzCreateRespVO}.java
      generateCodeByTemplate(
        path.resolve(
          __dirname,
          '../../../templates/backend/vo/XxYyZzCreateRespVO.java.hbs',
        ),
        path.resolve(voDir, `${typeName}CreateRespVO.java`),
        {
          rootPackageName,
          typeName,
        },
      );
      // 创建 {targetDir}/dto/{XxYyZzServiceCreateDTO}.java
      generateCodeByTemplate(
        path.resolve(
          __dirname,
          '../../../templates/backend/dto/XxYyZzServiceCreateDTO.java.hbs',
        ),
        path.resolve(dtoDir, `${typeName}ServiceCreateDTO.java`),
        {
          rootPackageName,
          typeName,
        },
      );
      // 创建 {targetDir}/dto/{XxYyZzServiceCreateRetDTO}.java
      generateCodeByTemplate(
        path.resolve(
          __dirname,
          '../../../templates/backend/dto/XxYyZzServiceCreateRetDTO.java.hbs',
        ),
        path.resolve(dtoDir, `${typeName}ServiceCreateRetDTO.java`),
        {
          rootPackageName,
          typeName,
        },
      );
    });
  }

  // TODO 处理 没输入 template 则报错
  // TODO 丰富日志（console 不打印）
  // TODO 会直接覆盖掉已有的文件（没有做提示）
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

/**
 * 创建文件夹时候可能会出现“文件夹已经存在”的情况，不抛错继续执行
 * @param dirPath 要创建的文件夹的绝对路径
 * @returns void
 */
function mkdirSafely(dirPath: string): void {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (err: unknown) {
    if (isErrnoException(err) && err?.code === 'EEXIST') {
      console.log('文件夹已经存在：', err.path);
      return;
    }
    throw err;
  }
}

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return (err as NodeJS.ErrnoException)?.code !== undefined;
}

/**
 * 根据模板和数据生成代码，并写入文件
 * @param templatePath 模板文件的绝对路径
 * @param outputPath 输出文件的绝对路径
 * @param data 模板所需的数据
 */
function generateCodeByTemplate(
  templatePath: string,
  outputPath: string,
  data: Record<string, unknown>,
) {
  // 读取模板
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  // 模板与变量进行组合
  const templateDelegate = Handlebars.compile(templateContent);
  const compiledContent = templateDelegate(data);
  // 写入文件
  fs.writeFileSync(outputPath, compiledContent);
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
