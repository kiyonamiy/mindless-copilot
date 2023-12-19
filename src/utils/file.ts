import fs from 'fs';
import xlsx from 'xlsx';

import Logger from '@/log';
import { Table, TableColumn } from '@/types/table';

const FileUtils = {
  /**
   * 从指定文件夹中读取并解析出 tables
   * @returns
   */
  loadTables(excelFilepath: string): Table[] | null {
    try {
      const TABLE_INFO_ROWS = 6;
      const excelFileContent = fs.readFileSync(excelFilepath);
      // 解析 Excel 文件
      const workbook = xlsx.read(excelFileContent, { type: 'buffer' });
      // 获取第一个工作表（通常为 Sheet1）
      const firstSheetName = workbook.SheetNames[0]; // TODO
      const worksheet = workbook.Sheets[firstSheetName];
      // 将工作表转换为 JSON 对象
      const excelColumns: {
        Name: string;
        Type: TableColumn['type'];
        Comment: string;
        Length: number;
        Default: string;
        ['Not Null']: boolean;
        ['Primary Key']: boolean;
        UNIQUE: boolean;
        UNSIGNED: boolean;
        Zerofill: boolean;
        ['Auto Increment']: boolean;
        ['创建时需要']: boolean;
        ['更新时需要']: boolean;
        ['作为分页查询条件']: boolean;
        ['分页结果包含']: boolean;
        ['详情结果包含']: boolean; // TODO 类型抽离
      }[] = xlsx.utils.sheet_to_json(worksheet, {
        range: TABLE_INFO_ROWS,
      });

      const columns: TableColumn[] = excelColumns.map((item) => ({
        name: item.Name,
        type: item.Type,
        comment: item.Comment,
        length: item.Length,
        default: item.Default,
        notNull: item['Not Null'],
        primaryKey: item['Primary Key'],
        unique: item.UNIQUE,
        unsigned: item.UNSIGNED,
        zeroFill: item.Zerofill,
        autoIncrement: item['Auto Increment'],
        createRequired: item['创建时需要'],
        updateRequired: item['更新时需要'],
        pageQuery: item['作为分页查询条件'],
        pageItemRespInclude: item['分页结果包含'],
        detailRespInclude: item['详情结果包含'],
      }));

      // 将工作表转换为 JSON 对象，仅包括指定行范围
      const excelTableInfo = xlsx.utils
        .sheet_to_csv(worksheet)
        .split('\n')
        .slice(0, TABLE_INFO_ROWS) // 前六行
        .map((row) => row.split(',').filter((str) => !!str))
        .filter((row) => !!row?.length) as [
        ['表名', string],
        ['表中文名', string],
        ['所属模块', string],
      ];

      // TODO 解析错误的情况

      return [
        {
          name: excelTableInfo[0][1],
          comment: excelTableInfo[1][1],
          columns,
          module: excelTableInfo[2][1],
        },
      ];
    } catch (e) {
      Logger.error(
        `请提供正确的生成代码的描述结构的 excel 文件, ${excelFilepath}`,
      );
      return null;
    }
  },
  /**
   * 判断文件夹是否存在
   * @param path
   * @returns
   */
  isDirectoryExists(path: string): boolean {
    try {
      // 使用 fs.existsSync 判断路径是否存在
      if (fs.existsSync(path)) {
        // 使用 fs.statSync 获取路径的状态信息
        const stats = fs.statSync(path);

        // 判断是否是一个目录
        return stats.isDirectory();
      }
      // 路径不存在
      return false;
    } catch (error) {
      // 发生错误，路径不存在或者不是一个目录
      return false;
    }
  },
};

export default FileUtils;
