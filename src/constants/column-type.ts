const ColumnTypeEnum = {
  ['INT']: {
    value: 'INT',
    jsMapping: 'number',
    javaMapping: 'Integer',
  },
  ['VARCHAR']: {
    value: 'VARCHAR',
    jsMapping: 'string',
    javaMapping: 'String',
  },
  ['CHAR']: {
    value: 'CHAR',
    jsMapping: 'string',
    javaMapping: 'String',
  },
  ['DATETIME']: {
    value: 'DATETIME',
    jsMapping: 'string',
    javaMapping: 'LocalDateTime',
  },
  ['TIMESTAMP']: {
    value: 'TIMESTAMP',
    jsMapping: 'string',
    javaMapping: 'LocalDateTime',
  },
  ['DATE']: {
    value: 'DATE',
    jsMapping: 'string',
    javaMapping: 'LocalDateTime',
  },
  ['BIT']: {
    value: 'BIT',
    jsMapping: 'boolean',
    javaMapping: 'Boolean',
  },
  ['FLOAT']: {
    value: 'FLOAT',
    jsMapping: 'number',
    javaMapping: 'Double',
  },
  ['DOUBLE']: {
    value: 'DOUBLE',
    jsMapping: 'number',
    javaMapping: 'Double',
  },
  ['DECIMAL']: {
    value: 'DECIMAL',
    jsMapping: 'number',
    javaMapping: 'Double',
  },
  ['BIGINT']: {
    value: 'BIGINT',
    jsMapping: 'number', // TODO
    javaMapping: 'Long',
  },
  ['TEXT']: {
    value: 'TEXT',
    jsMapping: 'string',
    javaMapping: 'String',
  },
  ['JSON']: {
    value: 'JSON',
    jsMapping: 'string',
    javaMapping: 'String',
  },
  ['BLOB']: {
    value: 'BLOB',
    jsMapping: 'string',
    javaMapping: 'String',
  },
  ['BINARY']: {
    value: 'BINARY',
    jsMapping: 'string',
    javaMapping: 'String',
  },
  ['ENUM']: {
    value: 'ENUM',
    jsMapping: 'string',
    javaMapping: 'String',
  },
} as const;

export default ColumnTypeEnum;
