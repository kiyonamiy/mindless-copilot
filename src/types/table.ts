type TableColumnType =
  | 'INT'
  | 'VARCHAR'
  | 'CHAR'
  | 'DATETIME'
  | 'TIMESTAMP'
  | 'DATE'
  | 'BIT'
  | 'FLOAT'
  | 'DOUBLE'
  | 'DECIMAL'
  | 'BIGINT'
  | 'TEXT'
  | 'JSON'
  | 'BLOB'
  | 'BINARY'
  | 'ENUM';

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
}
