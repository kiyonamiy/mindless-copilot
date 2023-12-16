import ColumnTypeEnum from '../constants/column-type';

type TableColumnType = keyof typeof ColumnTypeEnum;

// 表每列定义
export interface TableColumn {
  name: string;
  type: TableColumnType;
  comment?: string;
  length?: number;
  default?: string;
  notNull?: boolean;
  primaryKey?: boolean;
  unique?: boolean;
  unsigned?: boolean;
  zeroFill?: boolean;
  autoIncrement?: boolean;
}

// 表定义
export interface Table {
  name: string;
  columns: TableColumn[];
  comment: string;
  module: string;
}
