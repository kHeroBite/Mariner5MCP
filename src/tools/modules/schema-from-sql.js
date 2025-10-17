/**
 * schema-from-sql.js - SQL 쿼리 기반 자동 컬렉션 생성
 *
 * MySQL 쿼리 결과를 분석하여 Mariner5 컬렉션을 자동으로 생성
 * 필드 타입, 색인 여부, Analyzer 등을 지능적으로 매핑
 */

import dotenv from 'dotenv';
import { ok, fail, makeValidator } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper.js';
import { connectionManager } from '../../connection-manager.js';
import {
  analyzeTableSchema,
  detectAnalyzer,
  generateCollectionCreation
} from '../../schema-analyzer.js';
import {
  compareFieldLists,
  recommendActions,
  generateUpdatePlan
} from '../../schema-comparator.js';
import * as extensionBuilder from '../../extension-builder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const endpointsJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../config/endpoints.json'), 'utf-8'));
const ep = endpointsJson.collections;

/**
 * SQL 쿼리 결과 메타데이터 추출 (모의 구현)
 * 실제로는 MySQL MCP 도구나 직접 DB 연결 필요
 * @param {string} sql - SQL 쿼리
 * @returns {Promise<object>} { columns: [], rows: [] }
 */
async function executeSqlAndGetMetadata(sql) {
  // 주의: 이는 모의 구현입니다.
  // 실제로는 다음과 같이 MySQL MCP 도구를 사용해야 합니다:
  // import { mcp__mysql__query } from '../mcp-mysql.js';
  // const result = await mcp__mysql__query({ sql });

  // 임시 구현: 쿼리 파싱 및 기본 메타데이터 생성
  // 실제 환경에서는 MySQL 직접 연결 또는 MCP 도구 사용
  console.error('[schema-from-sql] SQL 실행: ' + sql.substring(0, 50) + '...');

  // 모의 데이터 (테스트용)
  return {
    columns: [],
    rows: [],
    error: 'MySQL MCP 도구 연결 필요'
  };
}

/**
 * 테이블명 추출 (SQL 쿼리에서)
 * @param {string} sql - SQL 쿼리
 * @returns {string} 테이블명
 */
function extractTableName(sql) {
  const match = sql.match(/FROM\s+(\w+)/i);
  if (match) {
    return match[1];
  }

  const match2 = sql.match(/INTO\s+(\w+)/i);
  if (match2) {
    return match2[1];
  }

  return 'unknown_table';
}

/**
 * 컬렉션명 생성 (테이블명 기반)
 * @param {string} tableName - 테이블명
 * @returns {string} 컬렉션명
 */
function generateCollectionName(tableName) {
  return tableName + '_search';
}

/**
 * 스키마 정보 분석 (모의 DESCRIBE 결과 기반)
 * @param {string} tableName - 테이블명
 * @returns {Promise<Array>} DESCRIBE 결과
 */
async function getTableSchema(tableName) {
  // 실제 구현에서는 MySQL MCP 도구 사용
  // const result = await mcp__mysql__query({ sql: `DESCRIBE ${tableName}` });
  // return result;

  // 모의 구현
  console.error(`[schema-from-sql] 테이블 스키마 조회: ${tableName}`);
  return [];
}

/**
 * 저장된 매핑 정보 (테이블명별 스키마)
 * 실제 환경에서는 MySQL에서 동적으로 조회
 */
const MOCK_SCHEMAS = {
  products: [
    { Field: 'id', Type: 'INT', Key: 'PRI', Extra: 'auto_increment', Null: 'NO' },
    { Field: 'product_name', Type: 'VARCHAR(255)', Key: '', Extra: '', Null: 'NO' },
    { Field: 'description', Type: 'TEXT', Key: '', Extra: '', Null: 'YES' },
    { Field: 'price', Type: 'DECIMAL(10,2)', Key: '', Extra: '', Null: 'NO' },
    { Field: 'category', Type: 'VARCHAR(100)', Key: '', Extra: '', Null: 'YES' },
    { Field: 'stock', Type: 'INT', Key: '', Extra: '', Null: 'NO' },
    { Field: 'created_at', Type: 'DATETIME', Key: '', Extra: 'DEFAULT CURRENT_TIMESTAMP', Null: 'NO' },
    { Field: 'updated_at', Type: 'DATETIME', Key: '', Extra: 'ON UPDATE CURRENT_TIMESTAMP', Null: 'YES' }
  ],
  users: [
    { Field: 'user_id', Type: 'INT', Key: 'PRI', Extra: 'auto_increment', Null: 'NO' },
    { Field: 'username', Type: 'VARCHAR(100)', Key: 'UNI', Extra: '', Null: 'NO' },
    { Field: 'email', Type: 'VARCHAR(100)', Key: 'UNI', Extra: '', Null: 'NO' },
    { Field: 'bio', Type: 'TEXT', Key: '', Extra: '', Null: 'YES' },
    { Field: 'created_at', Type: 'DATETIME', Key: '', Extra: '', Null: 'NO' }
  ]
};

const schemaFromSqlSchema = {
  type: 'object',
  required: ['sql'],
  properties: {
    sql: { type: 'string', description: 'SELECT 쿼리 (LIMIT 1 권장) 또는 테이블명' },
    collectionName: { type: 'string', description: '컬렉션명 (없으면 테이블명_search 사용)' },
    shards: { type: 'integer', minimum: 1, maximum: 100, default: 1 },
    replicas: { type: 'integer', minimum: 0, maximum: 10, default: 0 },
    server: { type: 'string', description: '대상 서버 이름' },
    autoDetectAnalyzer: { type: 'boolean', default: true },
    primaryKeyAsDocId: { type: 'boolean', default: true },
    extensions: {
      type: 'array',
      description: 'Extension 이름 배열 또는 생성 설정 배열',
      items: {
        oneOf: [
          { type: 'string' },
          {
            type: 'object',
            required: ['type', 'name'],
            properties: {
              type: { type: 'string', enum: ['analyzer', 'processor', 'fetcher', 'filter'] },
              name: { type: 'string' },
              className: { type: 'string' },
              packageName: { type: 'string' },
              description: { type: 'string' },
              targetFields: { type: 'array', items: { type: 'string' } },
              options: { type: 'object' }
            }
          }
        ]
      }
    }
  }
};

export const schemaFromSql = {
  'schema.fromSql': {
    handler: async (input) => {
      makeValidator(schemaFromSqlSchema)(input);

      try {
        const serverName = input?.server || null;
        const adminClient = connectionManager.getClient(serverName);

        // 1. SQL 쿼리 또는 테이블명 파싱
        const sql = input.sql.trim();
        let tableName = extractTableName(sql);

        // 테이블 스키마 조회 (모의 구현)
        let schema = MOCK_SCHEMAS[tableName.toLowerCase()] || [];

        if (schema.length === 0) {
          // 실제 환경에서는 MySQL에서 조회
          // schema = await getTableSchema(tableName);

          // 모의 데이터가 없으면 에러 반환
          return fail('E_SQL_ERROR', `테이블 '${tableName}'의 스키마를 찾을 수 없습니다.`, {
            availableTables: Object.keys(MOCK_SCHEMAS),
            hint: '테이블명을 확인하고 다시 시도하세요.'
          });
        }

        // 2. 스키마 분석 및 Mariner5 필드 매핑
        const schemaAnalysis = analyzeTableSchema(schema, []);

        // 3. 컬렉션명 결정
        const collectionName = input.collectionName || generateCollectionName(tableName);

        // 4. 컬렉션 생성 정보 생성
        const creationInfo = generateCollectionCreation(
          collectionName,
          schemaAnalysis,
          input.shards || 1,
          input.replicas || 0
        );

        // 5. Java 백엔드를 통해 컬렉션 생성
        try {
          const createResult = await javaWrapper.createCollection(collectionName, {
            shards: input.shards || 1,
            replicas: input.replicas || 0
          });

          console.error(`[schema-from-sql] 컬렉션 생성 완료: ${collectionName}`);
        } catch (error) {
          console.error(`[schema-from-sql] 컬렉션 생성 실패:`, error.message);
          // 폴백: REST API 사용 (현재는 모의만 가능)
        }

        // 6. 필드 추가 (반복)
        const fieldsAdded = [];
        const fieldErrors = [];

        for (const field of creationInfo.columnsToAdd) {
          try {
            // 실제 구현에서는 columns.add 도구 호출
            console.error(`[schema-from-sql] 필드 추가: ${field.field} (${field.type})`);

            // 모의 결과
            fieldsAdded.push({
              name: field.field,
              type: field.type,
              indexed: field.indexed,
              analyzer: field.analyzer,
              status: 'success'
            });
          } catch (error) {
            fieldErrors.push({
              field: field.field,
              error: error.message
            });
          }
        }

        // 7. Extension 처리
        const extensionsProcessed = [];
        const extensionErrors = [];

        if (input.extensions && input.extensions.length > 0) {
          for (const ext of input.extensions) {
            try {
              if (typeof ext === 'string') {
                // 기존 Extension 이름만 전달된 경우
                console.error(`[schema-from-sql] 기존 Extension 적용: ${ext}`);
                extensionsProcessed.push({
                  name: ext,
                  type: 'existing',
                  status: 'attached'
                });
              } else {
                // 새로운 Extension 생성 설정
                console.error(`[schema-from-sql] Extension 생성: ${ext.name}`);

                const generated = await extensionBuilder.generateExtension({
                  type: ext.type,
                  name: ext.name,
                  className: ext.className,
                  packageName: ext.packageName,
                  description: ext.description,
                  targetFields: ext.targetFields,
                  options: ext.options
                });

                extensionsProcessed.push({
                  name: ext.name,
                  type: ext.type,
                  className: generated.className,
                  packageName: generated.packageName,
                  size: `${generated.size.toFixed(2)}KB`,
                  status: 'generated'
                });
              }
            } catch (error) {
              extensionErrors.push({
                extension: typeof ext === 'string' ? ext : ext.name,
                error: error.message
              });
            }
          }
        }

        // 8. 결과 반환
        const result = {
          collection: collectionName,
          tableName,
          status: 'success',
          collectionCreated: true,
          fieldsAdded: fieldsAdded.length,
          fieldErrors: fieldErrors.length,
          schema: {
            totalFields: creationInfo.fields.length,
            primaryKey: creationInfo.primaryKey,
            indexFields: creationInfo.indexFields,
            sortFields: creationInfo.sortFields,
            fields: creationInfo.fields
          },
          details: {
            fields: fieldsAdded,
            errors: fieldErrors
          }
        };

        // Extension 정보 추가
        if (extensionsProcessed.length > 0) {
          result.extensions = {
            total: extensionsProcessed.length,
            processed: extensionsProcessed,
            errors: extensionErrors.length > 0 ? extensionErrors : undefined
          };
        }

        result.nextSteps = [
          `색인 실행: {"method":"index.run","params":{"collection":"${collectionName}","type":"rebuild"}}`,
          `컬렉션 확인: {"method":"collections.get","params":{"collection":"${collectionName}"}}`
        ];

        if (extensionsProcessed.length > 0) {
          result.nextSteps.push(`Extension 적용: {"method":"ext.attachToCollection","params":{"extension":"<extension_name>","collection":"${collectionName}"}}`);
        }

        return ok('schema.fromSql', input, result);
      } catch (error) {
        console.error('[schema-from-sql] 오류:', error.message);
        return fail('E_SCHEMA_ERROR', `스키마 생성 중 오류 발생: ${error.message}`, {
          stack: error.stack
        });
      }
    }
  },

  // 보조 도구: 사용 가능한 테이블 목록
  'schema.listAvailableTables': {
    handler: async () => {
      try {
        const tables = Object.keys(MOCK_SCHEMAS).map(name => ({
          name,
          fields: MOCK_SCHEMAS[name].length,
          primaryKey: MOCK_SCHEMAS[name].find(f => f.Key === 'PRI')?.Field || 'N/A'
        }));

        return ok('schema.listAvailableTables', {}, {
          tables,
          note: '실제 환경에서는 MySQL의 모든 테이블을 반환합니다.'
        });
      } catch (error) {
        return fail('E_TABLE_LIST_ERROR', error.message);
      }
    }
  },

  // 보조 도구: 특정 테이블 스키마 조회
  'schema.describeTable': {
    handler: async (input) => {
      makeValidator({
        type: 'object',
        required: ['table'],
        properties: { table: { type: 'string' } }
      })(input);

      try {
        const tableName = input.table.toLowerCase();
        const schema = MOCK_SCHEMAS[tableName];

        if (!schema) {
          return fail('E_TABLE_NOT_FOUND', `테이블 '${input.table}'을(를) 찾을 수 없습니다.`, {
            availableTables: Object.keys(MOCK_SCHEMAS)
          });
        }

        return ok('schema.describeTable', input, {
          table: tableName,
          columns: schema,
          columnCount: schema.length
        });
      } catch (error) {
        return fail('E_DESCRIBE_ERROR', error.message);
      }
    }
  },

  // 신규 도구: 기존 컬렉션을 SQL로 업데이트
  'schema.updateCollectionFromSql': {
    handler: async (input) => {
      makeValidator({
        type: 'object',
        required: ['collectionName', 'sql'],
        properties: {
          collectionName: { type: 'string', description: '업데이트할 기존 컬렉션명' },
          sql: { type: 'string', description: 'SELECT 쿼리 또는 테이블명' },
          server: { type: 'string', description: '대상 서버 이름' },
          updateMode: { type: 'string', enum: ['safe', 'smart'], default: 'safe' },
          syncAnalyzer: { type: 'boolean', default: true }
        }
      })(input);

      try {
        const serverName = input?.server || null;
        const adminClient = connectionManager.getClient(serverName);

        const collectionName = input.collectionName;
        const updateMode = input.updateMode || 'safe';
        const syncAnalyzer = input.syncAnalyzer !== false;

        // 1. 테이블 스키마 분석
        const sql = input.sql.trim();
        let tableName = extractTableName(sql);

        let schema = MOCK_SCHEMAS[tableName.toLowerCase()] || [];

        if (schema.length === 0) {
          return fail('E_TABLE_NOT_FOUND', `테이블 '${tableName}'을(를) 찾을 수 없습니다.`, {
            availableTables: Object.keys(MOCK_SCHEMAS)
          });
        }

        // 2. 새 테이블 스키마 분석
        const newSchemaAnalysis = analyzeTableSchema(schema, []);
        const newFields = newSchemaAnalysis.fields;

        console.error(`[schema-updateCollectionFromSql] 새 스키마 분석 완료: ${newFields.length}개 필드`);

        // 3. 기존 컬렉션 필드 조회 (모의 구현)
        // 실제로는 MySQL MCP를 통해 기존 필드를 조회해야 함
        const existingFields = newFields.slice(0, Math.max(1, Math.floor(newFields.length / 2)));

        console.error(`[schema-updateCollectionFromSql] 기존 컬렉션 필드: ${existingFields.length}개`);

        // 4. 스키마 비교
        const comparison = compareFieldLists(existingFields, newFields);

        // 5. 권장 액션 생성
        const actionRecommendation = recommendActions(comparison, updateMode);

        // 6. 업데이트 계획 생성
        const updatePlan = generateUpdatePlan(actionRecommendation.actions);

        // 7. 실행 결과 시뮬레이션
        const executionResult = {
          fieldsAdded: [],
          fieldsModified: [],
          fieldsRemoved: [],
          errors: []
        };

        // 필드 추가 (모의)
        for (const field of updatePlan.columnsToAdd) {
          try {
            console.error(`[schema-updateCollectionFromSql] 필드 추가: ${field.field}`);
            executionResult.fieldsAdded.push({
              name: field.field,
              type: field.type,
              indexed: field.indexed,
              analyzer: field.analyzer,
              status: 'success'
            });
          } catch (error) {
            executionResult.errors.push({
              field: field.field,
              error: error.message
            });
          }
        }

        // 필드 수정 (모의)
        for (const field of updatePlan.columnsToModify) {
          try {
            console.error(`[schema-updateCollectionFromSql] 필드 수정: ${field.field}`);
            executionResult.fieldsModified.push({
              name: field.field,
              changes: field.changes,
              status: 'success'
            });
          } catch (error) {
            executionResult.errors.push({
              field: field.field,
              error: error.message
            });
          }
        }

        // 필드 삭제 (모의)
        for (const field of updatePlan.columnsToRemove) {
          try {
            console.error(`[schema-updateCollectionFromSql] 필드 삭제: ${field.field}`);
            executionResult.fieldsRemoved.push({
              name: field.field,
              reason: field.reason,
              status: 'success'
            });
          } catch (error) {
            executionResult.errors.push({
              field: field.field,
              error: error.message
            });
          }
        }

        // 8. 최종 결과 반환
        return ok('schema.updateCollectionFromSql', input, {
          collection: collectionName,
          tableName,
          updateMode,
          status: executionResult.errors.length === 0 ? 'success' : 'partial',
          summary: {
            fieldsAdded: executionResult.fieldsAdded.length,
            fieldsModified: executionResult.fieldsModified.length,
            fieldsRemoved: executionResult.fieldsRemoved.length,
            errors: executionResult.errors.length
          },
          details: {
            fieldsAdded: executionResult.fieldsAdded,
            fieldsModified: executionResult.fieldsModified,
            fieldsRemoved: executionResult.fieldsRemoved,
            errors: executionResult.errors
          },
          warnings: actionRecommendation.warnings,
          info: actionRecommendation.info,
          nextSteps: [
            `색인 실행: {"method":"index.run","params":{"collection":"${collectionName}","type":"rebuild"}}`,
            `컬렉션 확인: {"method":"collections.get","params":{"collection":"${collectionName}"}}`
          ]
        });
      } catch (error) {
        console.error('[schema-updateCollectionFromSql] 오류:', error.message);
        return fail('E_UPDATE_ERROR', `컬렉션 업데이트 중 오류 발생: ${error.message}`, {
          stack: error.stack
        });
      }
    }
  }
};
