const ColumnTypeEnum = {
  ['INT']: {
    value: 'INT',
    jsMapping: 'number',
  },
  ['VARCHAR']: {
    value: 'VARCHAR',
    jsMapping: 'string',
  },
  ['CHAR']: {
    value: 'CHAR',
    jsMapping: 'string',
  },
  ['DATETIME']: {
    value: 'DATETIME',
    jsMapping: 'string',
  },
  ['TIMESTAMP']: {
    value: 'TIMESTAMP',
    jsMapping: 'string',
  },
  ['DATE']: {
    value: 'DATE',
    jsMapping: 'string',
  },
  ['BIT']: {
    value: 'BIT',
    jsMapping: 'boolean',
  },
  ['FLOAT']: {
    value: 'FLOAT',
    jsMapping: 'number',
  },
  ['DOUBLE']: {
    value: 'DOUBLE',
    jsMapping: 'number',
  },
  ['DECIMAL']: {
    value: 'DECIMAL',
    jsMapping: 'number',
  },
  ['BIGINT']: {
    value: 'BIGINT',
    jsMapping: 'number', // TODO
  },
  ['TEXT']: {
    value: 'TEXT',
    jsMapping: 'string',
  },
  ['JSON']: {
    value: 'JSON',
    jsMapping: 'string',
  },
  ['BLOB']: {
    value: 'BLOB',
    jsMapping: 'string',
  },
  ['BINARY']: {
    value: 'BINARY',
    jsMapping: 'string',
  },
  ['ENUM']: {
    value: 'ENUM',
    jsMapping: 'string',
  },
} as const;

export default ColumnTypeEnum;
