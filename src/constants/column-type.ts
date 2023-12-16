const ColumnTypeEnum = {
  ['INT']: {
    value: 'INT',
    jsMapping: 'number',
    javaDOMapping: 'Integer',
    javaVOMapping: 'Integer',
  },
  ['VARCHAR']: {
    value: 'VARCHAR',
    jsMapping: 'string',
    javaDOMapping: 'String',
    javaVOMapping: 'String',
  },
  ['CHAR']: {
    value: 'CHAR',
    jsMapping: 'string',
    javaDOMapping: 'String',
    javaVOMapping: 'String',
  },
  ['DATETIME']: {
    value: 'DATETIME',
    jsMapping: 'string',
    javaDOMapping: 'LocalDateTime',
    javaVOMapping: 'Long',
  },
  ['TIMESTAMP']: {
    value: 'TIMESTAMP',
    jsMapping: 'string',
    javaDOMapping: 'LocalDateTime',
    javaVOMapping: 'Long',
  },
  ['DATE']: {
    value: 'DATE',
    jsMapping: 'string',
    javaDOMapping: 'LocalDateTime',
    javaVOMapping: 'Long',
  },
  ['BIT']: {
    value: 'BIT',
    jsMapping: 'boolean',
    javaDOMapping: 'Boolean',
    javaVOMapping: 'Boolean',
  },
  ['FLOAT']: {
    value: 'FLOAT',
    jsMapping: 'number',
    javaDOMapping: 'Double',
    javaVOMapping: 'Double',
  },
  ['DOUBLE']: {
    value: 'DOUBLE',
    jsMapping: 'number',
    javaDOMapping: 'Double',
    javaVOMapping: 'Double',
  },
  ['DECIMAL']: {
    value: 'DECIMAL',
    jsMapping: 'number',
    javaDOMapping: 'Double',
    javaVOMapping: 'Double',
  },
  ['BIGINT']: {
    value: 'BIGINT',
    jsMapping: 'number', // TODO
    javaDOMapping: 'Long',
    javaVOMapping: 'Long',
  },
  ['TEXT']: {
    value: 'TEXT',
    jsMapping: 'string',
    javaDOMapping: 'String',
    javaVOMapping: 'String',
  },
  ['JSON']: {
    value: 'JSON',
    jsMapping: 'string',
    javaDOMapping: 'String',
    javaVOMapping: 'String',
  },
  ['BLOB']: {
    value: 'BLOB',
    jsMapping: 'string',
    javaDOMapping: 'String',
    javaVOMapping: 'String',
  },
  ['BINARY']: {
    value: 'BINARY',
    jsMapping: 'string',
    javaDOMapping: 'String',
    javaVOMapping: 'String',
  },
  ['ENUM']: {
    value: 'ENUM',
    jsMapping: 'string',
    javaDOMapping: 'String',
    javaVOMapping: 'String',
  },
} as const;

export default ColumnTypeEnum;
