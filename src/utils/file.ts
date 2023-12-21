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
      // 闭开区间
      const TABLE_COL_START_INDEX = 19;
      const BASIC_INFO_INDEX = [0, 5];
      const FILE_PATH_MAP_INDEX_RANGE = [7, 13];

      const excelFileContent = fs.readFileSync(excelFilepath);
      // 解析 Excel 文件
      const workbook = xlsx.read(excelFileContent, { type: 'buffer' });
      // 获取第一个工作表（通常为 Sheet1）
      const firstSheetName = workbook.SheetNames[0]; // TODO
      const worksheet = workbook.Sheets[firstSheetName];
      // 解析“列信息”
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
        range: TABLE_COL_START_INDEX,
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

      const excelTableBasicInfo = xlsx.utils
        .sheet_to_csv(worksheet)
        .split('\n')
        .slice(...BASIC_INFO_INDEX)
        .map((row) => row.split(',').filter((str) => !!str))
        .filter((row) => !!row?.length) as [
        ['表名', string],
        ['表中文名', string],
        ['所属模块', string],
        ['根包名', string],
        ['请求前缀', string],
      ];

      const excelFilepathMap = xlsx.utils
        .sheet_to_csv(worksheet)
        .split('\n')
        .slice(...FILE_PATH_MAP_INDEX_RANGE)
        .map((row) => row.split(',').filter((str) => !!str))
        .filter((row) => !!row?.length) as [
        ['controller', string],
        ['vo', string],
        ['service', string],
        ['domain', string],
        ['convert', string],
      ];

      const result = [
        {
          columns,
          name: excelTableBasicInfo[0][1],
          comment: excelTableBasicInfo[1][1],
          module: excelTableBasicInfo[2][1],
          rootPackageName: excelTableBasicInfo[3][1],
          apiPrefix: excelTableBasicInfo[4][1],
          filepathMap: excelFilepathMap.reduce(
            (prev, curRow) => ({
              ...prev,
              [curRow[0]]: curRow[1],
            }),
            {},
          ),
        },
      ];
      return result;
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
