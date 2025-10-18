/**
 * datasource.js - DataSource 관리 MCP 도구 (15+ 도구) ⭐ 신규
 *
 * 외부 DB 연동 설정 (MySQL, Oracle, PostgreSQL 등)
 * - DataSource 생성/수정/삭제/조회
 * - 연결 테스트
 * - 필드 매핑
 * - 데이터 동기화
 * - 동기화 로그 조회
 */

import { makeValidator, ok, fail } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper-v2/index.js';

// ==================== 엔드포인트 ====================
const ep = {
  create: '/datasource/create',
  get: '/datasource/get',
  list: '/datasource/list',
  update: '/datasource/update',
  delete: '/datasource/delete',
  testConnection: '/datasource/testConnection',
  enable: '/datasource/enable',
  disable: '/datasource/disable',
  getStatus: '/datasource/getStatus',
  setMapping: '/datasource/setMapping',
  getMapping: '/datasource/getMapping',
  sync: '/datasource/sync',
  getSyncLog: '/datasource/getSyncLog',
  testQuery: '/datasource/testQuery'
};

export const datasource = {
  // ==================== DataSource 기본 ====================

  'datasource.create': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dataSourceName', 'config'],
        properties: {
          collectionName: { type: 'string' },
          dataSourceName: { type: 'string' },
          config: {
            type: 'object',
            required: ['type', 'host', 'port', 'database'],
            properties: {
              type: { type: 'string', enum: ['MySQL', 'Oracle', 'PostgreSQL', 'MariaDB', 'MSSQL'] },
              host: { type: 'string' },
              port: { type: 'integer', minimum: 1, maximum: 65535 },
              database: { type: 'string' },
              username: { type: 'string' },
              password: { type: 'string' },
              charset: { type: 'string' },
              maxConnections: { type: 'integer' },
              timeout: { type: 'integer' }
            }
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.createDataSource(
          input.collectionName,
          input.dataSourceName,
          input.config,
          input.instanceId
        );
        return ok(ep.create, input, result);
      } catch (error) {
        return fail('E_DATASOURCE', error.message, { dataSourceName: input.dataSourceName });
      }
    }
  },

  'datasource.get': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dataSourceName'],
        properties: {
          collectionName: { type: 'string' },
          dataSourceName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.getDataSource(
          input.collectionName,
          input.dataSourceName,
          input.instanceId
        );
        return ok(ep.get, input, result);
      } catch (error) {
        return fail('E_DATASOURCE', error.message, { dataSourceName: input.dataSourceName });
      }
    }
  },

  'datasource.list': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.listDataSources(
          input.collectionName,
          input.instanceId
        );
        return ok(ep.list, input, result);
      } catch (error) {
        return fail('E_DATASOURCE', error.message);
      }
    }
  },

  'datasource.update': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dataSourceName', 'config'],
        properties: {
          collectionName: { type: 'string' },
          dataSourceName: { type: 'string' },
          config: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.updateDataSource(
          input.collectionName,
          input.dataSourceName,
          input.config,
          input.instanceId
        );
        return ok(ep.update, input, result);
      } catch (error) {
        return fail('E_DATASOURCE', error.message, { dataSourceName: input.dataSourceName });
      }
    }
  },

  'datasource.delete': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dataSourceName'],
        properties: {
          collectionName: { type: 'string' },
          dataSourceName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.deleteDataSource(
          input.collectionName,
          input.dataSourceName,
          input.instanceId
        );
        return ok(ep.delete, input, { deleted: result });
      } catch (error) {
        return fail('E_DATASOURCE', error.message, { dataSourceName: input.dataSourceName });
      }
    }
  },

  // ==================== DataSource 제어 ====================

  'datasource.testConnection': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dataSourceName'],
        properties: {
          collectionName: { type: 'string' },
          dataSourceName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.testDataSourceConnection(
          input.collectionName,
          input.dataSourceName,
          input.instanceId
        );
        return ok(ep.testConnection, input, { connected: result });
      } catch (error) {
        return fail('E_DATASOURCE', error.message, { dataSourceName: input.dataSourceName });
      }
    }
  },

  'datasource.enable': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dataSourceName'],
        properties: {
          collectionName: { type: 'string' },
          dataSourceName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.enableDataSource(
          input.collectionName,
          input.dataSourceName,
          input.instanceId
        );
        return ok(ep.enable, input, { enabled: result });
      } catch (error) {
        return fail('E_DATASOURCE', error.message, { dataSourceName: input.dataSourceName });
      }
    }
  },

  'datasource.disable': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dataSourceName'],
        properties: {
          collectionName: { type: 'string' },
          dataSourceName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.disableDataSource(
          input.collectionName,
          input.dataSourceName,
          input.instanceId
        );
        return ok(ep.disable, input, { disabled: result });
      } catch (error) {
        return fail('E_DATASOURCE', error.message, { dataSourceName: input.dataSourceName });
      }
    }
  },

  'datasource.getStatus': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dataSourceName'],
        properties: {
          collectionName: { type: 'string' },
          dataSourceName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.getDataSourceStatus(
          input.collectionName,
          input.dataSourceName,
          input.instanceId
        );
        return ok(ep.getStatus, input, result);
      } catch (error) {
        return fail('E_DATASOURCE', error.message, { dataSourceName: input.dataSourceName });
      }
    }
  },

  // ==================== DataSource 필드 매핑 ====================

  'datasource.setMapping': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dataSourceName', 'fieldMappings'],
        properties: {
          collectionName: { type: 'string' },
          dataSourceName: { type: 'string' },
          fieldMappings: {
            type: 'object',
            additionalProperties: { type: 'string' }
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.createDataSourceMapping(
          input.collectionName,
          input.dataSourceName,
          input.fieldMappings,
          input.instanceId
        );
        return ok(ep.setMapping, input, result);
      } catch (error) {
        return fail('E_DATASOURCE', error.message, { dataSourceName: input.dataSourceName });
      }
    }
  },

  'datasource.getMapping': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dataSourceName'],
        properties: {
          collectionName: { type: 'string' },
          dataSourceName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.getDataSourceMapping(
          input.collectionName,
          input.dataSourceName,
          input.instanceId
        );
        return ok(ep.getMapping, input, result);
      } catch (error) {
        return fail('E_DATASOURCE', error.message, { dataSourceName: input.dataSourceName });
      }
    }
  },

  // ==================== DataSource 동기화 ====================

  'datasource.sync': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dataSourceName'],
        properties: {
          collectionName: { type: 'string' },
          dataSourceName: { type: 'string' },
          options: {
            type: 'object',
            properties: {
              incremental: { type: 'boolean' },
              startRow: { type: 'integer' },
              maxRows: { type: 'integer' },
              dateField: { type: 'string' },
              dateFrom: { type: 'string' }
            }
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.syncDataSourceData(
          input.collectionName,
          input.dataSourceName,
          input.options || {},
          input.instanceId
        );
        return ok(ep.sync, input, result);
      } catch (error) {
        return fail('E_DATASOURCE', error.message, { dataSourceName: input.dataSourceName });
      }
    }
  },

  'datasource.getSyncLog': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dataSourceName'],
        properties: {
          collectionName: { type: 'string' },
          dataSourceName: { type: 'string' },
          limit: { type: 'integer', default: 100 },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.getDataSourceSyncLog(
          input.collectionName,
          input.dataSourceName,
          input.limit || 100,
          input.instanceId
        );
        return ok(ep.getSyncLog, input, result);
      } catch (error) {
        return fail('E_DATASOURCE', error.message, { dataSourceName: input.dataSourceName });
      }
    }
  },

  'datasource.testQuery': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dataSourceName', 'query'],
        properties: {
          collectionName: { type: 'string' },
          dataSourceName: { type: 'string' },
          query: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.testDataSourceQuery(
          input.collectionName,
          input.dataSourceName,
          input.query,
          input.instanceId
        );
        return ok(ep.testQuery, input, result);
      } catch (error) {
        return fail('E_DATASOURCE', error.message, { query: input.query });
      }
    }
  }
};

export default datasource;
