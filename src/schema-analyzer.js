/**
 * schema-analyzer.js - SQL 타입을 Mariner5 스키마로 자동 변환
 *
 * MySQL 컬럼 정보를 분석하여 Mariner5 검색엔진용 필드 정보로 변환
 * 데이터 샘플을 기반으로 Analyzer 자동 선택
 */

/**
 * MySQL 타입 → Mariner5 필드 매핑 정의
 */
export const SQL_TYPE_MAPPING = {
  // 문자열 필드 (색인 대상)
  'varchar': { type: 'TEXT', indexed: true, stored: true, sortable: false },
  'char': { type: 'TEXT', indexed: true, stored: true, sortable: false },
  'text': { type: 'TEXT', indexed: true, stored: true, sortable: false },
  'longtext': { type: 'TEXT', indexed: true, stored: true, sortable: false },
  'mediumtext': { type: 'TEXT', indexed: true, stored: true, sortable: false },
  'tinytext': { type: 'TEXT', indexed: true, stored: true, sortable: false },

  // 숫자 필드 (정렬 대상)
  'int': { type: 'INTEGER', indexed: false, stored: true, sortable: true },
  'integer': { type: 'INTEGER', indexed: false, stored: true, sortable: true },
  'smallint': { type: 'INTEGER', indexed: false, stored: true, sortable: true },
  'tinyint': { type: 'INTEGER', indexed: false, stored: true, sortable: true },
  'bigint': { type: 'LONG', indexed: false, stored: true, sortable: true },
  'decimal': { type: 'DOUBLE', indexed: false, stored: true, sortable: true },
  'double': { type: 'DOUBLE', indexed: false, stored: true, sortable: true },
  'float': { type: 'DOUBLE', indexed: false, stored: true, sortable: true },
  'real': { type: 'DOUBLE', indexed: false, stored: true, sortable: true },

  // 날짜/시간 필드 (정렬 대상)
  'date': { type: 'DATE', indexed: false, stored: true, sortable: true },
  'datetime': { type: 'DATETIME', indexed: false, stored: true, sortable: true },
  'timestamp': { type: 'DATETIME', indexed: false, stored: true, sortable: true },
  'time': { type: 'TIME', indexed: false, stored: true, sortable: true },
  'year': { type: 'INTEGER', indexed: false, stored: true, sortable: true },

  // 기타
  'boolean': { type: 'BOOLEAN', indexed: false, stored: true, sortable: true },
  'bool': { type: 'BOOLEAN', indexed: false, stored: true, sortable: true },
  'blob': { type: 'BINARY', indexed: false, stored: true, sortable: false },
  'longblob': { type: 'BINARY', indexed: false, stored: true, sortable: false },
  'mediumblob': { type: 'BINARY', indexed: false, stored: true, sortable: false },
  'json': { type: 'TEXT', indexed: true, stored: true, sortable: false },
  'enum': { type: 'TEXT', indexed: false, stored: true, sortable: true },
  'set': { type: 'TEXT', indexed: false, stored: true, sortable: false }
};

/**
 * 데이터 샘플 기반으로 최적의 Analyzer 선택
 * @param {any} sampleValue - 컬럼의 샘플 데이터
 * @param {string} columnName - 컬럼명
 * @returns {string} Analyzer 이름
 */
export function detectAnalyzer(sampleValue, columnName = '') {
  // null/undefined 처리
  if (sampleValue === null || sampleValue === undefined) {
    return 'standard_analyzer';
  }

  const strValue = String(sampleValue).trim();

  // 빈 문자열
  if (strValue.length === 0) {
    return 'standard_analyzer';
  }

  // 한글 포함 여부 확인
  if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(strValue)) {
    return 'korean_analyzer';
  }

  // 중국어 포함
  if (/[\u4E00-\u9FFF]/.test(strValue)) {
    return 'cjk_analyzer';
  }

  // 일본어 포함
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(strValue)) {
    return 'cjk_analyzer';
  }

  // 숫자 전용
  if (/^[\d\s\-\.]+$/.test(strValue)) {
    return 'keyword_analyzer';
  }

  // 영문 전용 (검색 가능)
  if (/^[a-zA-Z0-9\s\-_\.@]+$/.test(strValue)) {
    return 'standard_analyzer';
  }

  // 기타 (한글/영문 혼합 등)
  return 'standard_analyzer';
}

/**
 * MySQL 컬럼 정보를 Mariner5 필드 정보로 변환
 * @param {object} column - MySQL 컬럼 정보 { name, type, key, default, extra, sampleValue }
 * @returns {object} Mariner5 필드 정보
 */
export function mapColumnToMariner5Field(column) {
  // MySQL 타입 추출 (예: varchar(100) → varchar)
  const sqlType = column.type.toLowerCase().split('(')[0].trim();

  // 기본 매핑 정보 획득
  const baseMapping = SQL_TYPE_MAPPING[sqlType] || {
    type: 'TEXT',
    indexed: false,
    stored: true,
    sortable: false
  };

  // 필드 정보 구성
  const field = {
    name: column.name,
    type: baseMapping.type,
    indexed: baseMapping.indexed,
    stored: baseMapping.stored,
    sortable: baseMapping.sortable,
    isPrimaryKey: column.key === 'PRI' || column.key === 'PRIMARY'
  };

  // 색인 필드인 경우 Analyzer 설정
  if (field.indexed && column.sampleValue !== undefined) {
    field.analyzer = detectAnalyzer(column.sampleValue, column.name);
  }

  // Auto increment 필드 처리
  if (column.extra && column.extra.includes('auto_increment')) {
    field.autoIncrement = true;
  }

  return field;
}

/**
 * SQL 쿼리 메타데이터를 Mariner5 컬렉션 스키마로 변환
 * @param {Array} columns - MySQL 쿼리 결과 컬럼 메타데이터 배열
 * @param {Array} rows - 쿼리 결과 데이터 (샘플용)
 * @returns {object} { fields, indexFields, sortFields, primaryKey }
 */
export function analyzeQueryResult(columns, rows = []) {
  const fields = [];
  const indexFields = [];
  const sortFields = [];
  let primaryKey = null;

  // 첫 번째 행에서 샘플 데이터 추출
  const sampleRow = rows && rows.length > 0 ? rows[0] : {};

  // 각 컬럼 분석
  for (let i = 0; i < columns.length; i++) {
    const column = {
      name: columns[i],
      type: 'TEXT', // MySQL 타입 정보가 없으면 TEXT로 기본 설정
      sampleValue: sampleRow[columns[i]]
    };

    // Mariner5 필드로 변환
    const field = mapColumnToMariner5Field(column);
    fields.push(field);

    // Primary Key 추적
    if (field.isPrimaryKey) {
      primaryKey = field.name;
    }

    // 색인 필드 추적
    if (field.indexed) {
      indexFields.push(field.name);
    }

    // 정렬 필드 추적
    if (field.sortable) {
      sortFields.push(field.name);
    }
  }

  return {
    fields,
    indexFields,
    sortFields,
    primaryKey
  };
}

/**
 * MySQL 스키마 정보 기반으로 필드 분석
 * @param {Array} schema - DESCRIBE 테이블 결과
 * @param {Array} rows - 샘플 데이터 (옵션)
 * @returns {object} { fields, indexFields, sortFields, primaryKey }
 */
export function analyzeTableSchema(schema, rows = []) {
  const fields = [];
  const indexFields = [];
  const sortFields = [];
  let primaryKey = null;

  // 샘플 데이터 추출
  const sampleRow = rows && rows.length > 0 ? rows[0] : {};

  // 각 컬럼 분석
  for (const col of schema) {
    // DESCRIBE 결과 형식: { Field, Type, Null, Key, Default, Extra }
    const column = {
      name: col.Field || col.field,
      type: col.Type || col.type,
      key: col.Key || col.key,
      extra: col.Extra || col.extra,
      sampleValue: sampleRow[col.Field || col.field]
    };

    // Mariner5 필드로 변환
    const field = mapColumnToMariner5Field(column);
    fields.push(field);

    // Primary Key 추적
    if (field.isPrimaryKey) {
      primaryKey = field.name;
    }

    // 색인 필드 추적
    if (field.indexed) {
      indexFields.push(field.name);
    }

    // 정렬 필드 추적
    if (field.sortable) {
      sortFields.push(field.name);
    }
  }

  return {
    fields,
    indexFields,
    sortFields,
    primaryKey
  };
}

/**
 * 컬렉션 생성 정보 생성
 * @param {string} collectionName - 컬렉션명
 * @param {object} schemaInfo - 스키마 분석 결과
 * @param {number} shards - 샤드 개수
 * @param {number} replicas - 복제본 개수
 * @returns {object} { collection, fields, columns }
 */
export function generateCollectionCreation(collectionName, schemaInfo, shards = 1, replicas = 0) {
  return {
    collection: collectionName,
    shards,
    replicas,
    fields: schemaInfo.fields,
    indexFields: schemaInfo.indexFields,
    sortFields: schemaInfo.sortFields,
    primaryKey: schemaInfo.primaryKey,
    // 필드 추가 작업용
    columnsToAdd: schemaInfo.fields.map(f => ({
      field: f.name,
      type: f.type,
      indexed: f.indexed,
      stored: f.stored,
      analyzer: f.analyzer,
      options: { sortable: f.sortable }
    }))
  };
}

export default {
  SQL_TYPE_MAPPING,
  detectAnalyzer,
  mapColumnToMariner5Field,
  analyzeQueryResult,
  analyzeTableSchema,
  generateCollectionCreation
};
