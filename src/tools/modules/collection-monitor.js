/**
 * collection-monitor.js - 컬렉션 모니터링 MCP 도구 (30+ 도구) ⭐ 신규
 *
 * - DBWatcher 고급: 실시간 DB 변경 감지 + 필터링 (8개 도구)
 * - CollectionMonitor: 컬렉션 실시간 모니터링 (12개 도구)
 * - Topicker: 상위 키워드/트렌드 분석 (8개 도구)
 */

import { makeValidator, ok, fail } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper-v2/index.js';

// ==================== 엔드포인트 ====================
const ep = {
  // DBWatcher 고급
  setupWatcher: '/monitor/dbwatcher/setup',
  watcherStatus: '/monitor/dbwatcher/status',
  watcherLog: '/monitor/dbwatcher/log',
  addFilter: '/monitor/dbwatcher/filter/add',
  removeFilter: '/monitor/dbwatcher/filter/remove',
  listFilters: '/monitor/dbwatcher/filter/list',
  pauseWatcher: '/monitor/dbwatcher/pause',
  resumeWatcher: '/monitor/dbwatcher/resume',

  // CollectionMonitor
  createMonitor: '/monitor/collection/create',
  monitorStatus: '/monitor/collection/status',
  getMetrics: '/monitor/collection/metrics',
  getStats: '/monitor/collection/stats',
  docCount: '/monitor/collection/doccount',
  collSize: '/monitor/collection/size',
  indexStats: '/monitor/collection/indexstats',
  slowQueries: '/monitor/collection/slowqueries',
  topKeywords: '/monitor/collection/topkeywords',
  deleteMonitor: '/monitor/collection/delete',

  // Topicker
  topickerConfig: '/monitor/topicker/config',
  topKeywords: '/monitor/topicker/keywords',
  trending: '/monitor/topicker/trending',
  keywordStats: '/monitor/topicker/stats',
  keywordTrend: '/monitor/topicker/trend',
  buildIndex: '/monitor/topicker/build',
  export: '/monitor/topicker/export'
};

export const collectionMonitor = {
  // ==================== DBWatcher 고급 ====================

  'monitor.dbwatcher.setup': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          config: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.setupDBWatcherAdvanced(
          input.collectionName,
          input.config || {},
          input.instanceId
        );
        return ok(ep.setupWatcher, input, result);
      } catch (error) {
        return fail('E_DBWATCHER', error.message, { collection: input.collectionName });
      }
    }
  },

  'monitor.dbwatcher.status': {
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
        const result = await javaWrapper.collection.getDBWatcherStatus(
          input.collectionName,
          input.instanceId
        );
        return ok(ep.watcherStatus, input, result);
      } catch (error) {
        return fail('E_DBWATCHER', error.message, { collection: input.collectionName });
      }
    }
  },

  'monitor.dbwatcher.log': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 10000, default: 100 },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.getDBWatcherChangeLog(
          input.collectionName,
          input.limit || 100,
          input.instanceId
        );
        return ok(ep.watcherLog, input, result);
      } catch (error) {
        return fail('E_DBWATCHER', error.message, { collection: input.collectionName });
      }
    }
  },

  'monitor.dbwatcher.filter.add': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'fieldName', 'operator', 'value'],
        properties: {
          collectionName: { type: 'string' },
          fieldName: { type: 'string' },
          operator: { type: 'string', enum: ['=', '!=', '>', '<', '>=', '<=', 'in', 'like'] },
          value: { type: ['string', 'number', 'array'] },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.addDBWatcherFilter(
          input.collectionName,
          input.fieldName,
          input.operator,
          input.value,
          input.instanceId
        );
        return ok(ep.addFilter, input, result);
      } catch (error) {
        return fail('E_DBWATCHER', error.message, { field: input.fieldName });
      }
    }
  },

  'monitor.dbwatcher.filter.remove': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'fieldName'],
        properties: {
          collectionName: { type: 'string' },
          fieldName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.removeDBWatcherFilter(
          input.collectionName,
          input.fieldName,
          input.instanceId
        );
        return ok(ep.removeFilter, input, { removed: result });
      } catch (error) {
        return fail('E_DBWATCHER', error.message, { field: input.fieldName });
      }
    }
  },

  'monitor.dbwatcher.filter.list': {
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
        const result = await javaWrapper.collection.getDBWatcherFilters(
          input.collectionName,
          input.instanceId
        );
        return ok(ep.listFilters, input, result);
      } catch (error) {
        return fail('E_DBWATCHER', error.message);
      }
    }
  },

  'monitor.dbwatcher.pause': {
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
        const result = await javaWrapper.collection.pauseDBWatcher(
          input.collectionName,
          input.instanceId
        );
        return ok(ep.pauseWatcher, input, { paused: result });
      } catch (error) {
        return fail('E_DBWATCHER', error.message);
      }
    }
  },

  'monitor.dbwatcher.resume': {
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
        const result = await javaWrapper.collection.resumeDBWatcher(
          input.collectionName,
          input.instanceId
        );
        return ok(ep.resumeWatcher, input, { resumed: result });
      } catch (error) {
        return fail('E_DBWATCHER', error.message);
      }
    }
  },

  // ==================== CollectionMonitor ====================

  'monitor.collection.create': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          config: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.createCollectionMonitor(
          input.collectionName,
          input.config || {},
          input.instanceId
        );
        return ok(ep.createMonitor, input, result);
      } catch (error) {
        return fail('E_MONITOR', error.message, { collection: input.collectionName });
      }
    }
  },

  'monitor.collection.status': {
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
        const result = await javaWrapper.collection.getCollectionMonitorStatus(
          input.collectionName,
          input.instanceId
        );
        return ok(ep.monitorStatus, input, result);
      } catch (error) {
        return fail('E_MONITOR', error.message);
      }
    }
  },

  'monitor.collection.metrics': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          metricType: { type: 'string', enum: ['all', 'search', 'index', 'resource'] },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.getCollectionMetrics(
          input.collectionName,
          input.metricType || 'all',
          input.instanceId
        );
        return ok(ep.getMetrics, input, result);
      } catch (error) {
        return fail('E_MONITOR', error.message);
      }
    }
  },

  'monitor.collection.stats': {
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
        const result = await javaWrapper.collection.getCollectionStats(
          input.collectionName,
          input.instanceId
        );
        return ok(ep.getStats, input, result);
      } catch (error) {
        return fail('E_MONITOR', error.message);
      }
    }
  },

  'monitor.collection.doccount': {
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
        const result = await javaWrapper.collection.getDocumentCount(
          input.collectionName,
          input.instanceId
        );
        return ok(ep.docCount, input, { count: result });
      } catch (error) {
        return fail('E_MONITOR', error.message);
      }
    }
  },

  'monitor.collection.size': {
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
        const result = await javaWrapper.collection.getCollectionSize(
          input.collectionName,
          input.instanceId
        );
        return ok(ep.collSize, input, { size: result });
      } catch (error) {
        return fail('E_MONITOR', error.message);
      }
    }
  },

  'monitor.collection.indexstats': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          indexName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.getIndexStats(
          input.collectionName,
          input.indexName || null,
          input.instanceId
        );
        return ok(ep.indexStats, input, result);
      } catch (error) {
        return fail('E_MONITOR', error.message);
      }
    }
  },

  'monitor.collection.slowqueries': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 50 },
          thresholdMs: { type: 'integer', minimum: 0, default: 1000 },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.getSlowQueries(
          input.collectionName,
          input.limit || 50,
          input.thresholdMs || 1000,
          input.instanceId
        );
        return ok(ep.slowQueries, input, result);
      } catch (error) {
        return fail('E_MONITOR', error.message);
      }
    }
  },

  'monitor.collection.topkeywords': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 50 },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.collection.getTopSearchKeywords(
          input.collectionName,
          input.limit || 50,
          input.instanceId
        );
        return ok(ep.topKeywords, input, result);
      } catch (error) {
        return fail('E_MONITOR', error.message);
      }
    }
  },

  'monitor.collection.delete': {
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
        const result = await javaWrapper.collection.deleteCollectionMonitor(
          input.collectionName,
          input.instanceId
        );
        return ok(ep.deleteMonitor, input, { deleted: result });
      } catch (error) {
        return fail('E_MONITOR', error.message);
      }
    }
  },

  // ==================== Topicker ====================

  'monitor.topicker.config': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          action: { type: 'string', enum: ['get', 'set'], default: 'get' },
          config: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        let result;
        if (input.action === 'set') {
          result = await javaWrapper.hotspot.setTopPickerConfig(
            input.collectionName,
            input.config || {},
            input.instanceId
          );
        } else {
          result = await javaWrapper.hotspot.getTopPickerConfig(
            input.collectionName,
            input.instanceId
          );
        }
        return ok(ep.topickerConfig, input, result);
      } catch (error) {
        return fail('E_TOPICKER', error.message);
      }
    }
  },

  'monitor.topicker.keywords': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 50 },
          timeWindow: { type: 'string', enum: ['hourly', 'daily', 'weekly', 'monthly'] },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.getTopKeywords(
          input.collectionName,
          input.limit || 50,
          input.timeWindow || 'daily',
          input.instanceId
        );
        return ok(ep.topKeywords, input, result);
      } catch (error) {
        return fail('E_TOPICKER', error.message);
      }
    }
  },

  'monitor.topicker.trending': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 30 },
          timeWindow: { type: 'string', enum: ['hourly', 'daily', 'weekly'], default: 'hourly' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.getTrendingKeywords(
          input.collectionName,
          input.limit || 30,
          input.timeWindow || 'hourly',
          input.instanceId
        );
        return ok(ep.trending, input, result);
      } catch (error) {
        return fail('E_TOPICKER', error.message);
      }
    }
  },

  'monitor.topicker.stats': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'keyword'],
        properties: {
          collectionName: { type: 'string' },
          keyword: { type: 'string' },
          timeWindow: { type: 'string', enum: ['hourly', 'daily', 'weekly', 'monthly'] },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.getKeywordStats(
          input.collectionName,
          input.keyword,
          input.timeWindow || 'daily',
          input.instanceId
        );
        return ok(ep.keywordStats, input, result);
      } catch (error) {
        return fail('E_TOPICKER', error.message, { keyword: input.keyword });
      }
    }
  },

  'monitor.topicker.trend': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'keyword'],
        properties: {
          collectionName: { type: 'string' },
          keyword: { type: 'string' },
          days: { type: 'integer', minimum: 1, maximum: 365, default: 30 },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.getKeywordTrend(
          input.collectionName,
          input.keyword,
          input.days || 30,
          input.instanceId
        );
        return ok(ep.keywordTrend, input, result);
      } catch (error) {
        return fail('E_TOPICKER', error.message, { keyword: input.keyword });
      }
    }
  },

  'monitor.topicker.build': {
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
        const result = await javaWrapper.hotspot.buildTopPickerIndex(
          input.collectionName,
          input.instanceId
        );
        return ok(ep.buildIndex, input, { built: result });
      } catch (error) {
        return fail('E_TOPICKER', error.message);
      }
    }
  },

  'monitor.topicker.export': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          format: { type: 'string', enum: ['json', 'csv', 'excel'] },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.exportTopPickerData(
          input.collectionName,
          input.format || 'json',
          input.instanceId
        );
        return ok(ep.export, input, result);
      } catch (error) {
        return fail('E_TOPICKER', error.message);
      }
    }
  }
};

export default collectionMonitor;
