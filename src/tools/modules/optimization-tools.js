/**
 * optimization-tools.js - 쿼리 최적화 MCP 도구 (10개 도구) ⭐ v3.5 신규
 *
 * - QueryOptimization: 쿼리 실행 계획 및 성능 분석 (5개)
 * - QueryCache: 쿼리 캐시 관리 (5개)
 */

import { makeValidator, ok, fail } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper-v2/index.js';

const ep = {
  // Query Optimization
  executionPlan: '/optimization/execution-plan',
  performance: '/optimization/performance',
  queryStats: '/optimization/stats',
  indexSuggestions: '/optimization/index-suggestions',

  // Query Cache
  cacheConfig: '/optimization/cache',
  cacheStats: '/optimization/cache/stats',
  cachedQueries: '/optimization/cache/queries'
};

export const optimization = {
  // ==================== Query Optimization (5개) ====================

  'optimization.plan.generate': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet'],
        properties: {
          querySet: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.optimization.generateExecutionPlan(
          input.querySet,
          input.instanceId
        );
        return ok(ep.executionPlan, input, result);
      } catch (error) {
        return fail('E_OPTIMIZATION', error.message);
      }
    }
  },

  'optimization.performance.analyze': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet'],
        properties: {
          querySet: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.optimization.analyzeQueryPerformance(
          input.querySet,
          input.instanceId
        );
        return ok(ep.performance, input, result);
      } catch (error) {
        return fail('E_OPTIMIZATION', error.message);
      }
    }
  },

  'optimization.query.optimize': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet'],
        properties: {
          querySet: { type: 'object' },
          optimizationLevel: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'auto'],
            default: 'auto'
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.optimization.optimizeQuerySet(
          input.querySet,
          input.optimizationLevel || 'auto',
          input.instanceId
        );
        return ok(ep.performance, input, result);
      } catch (error) {
        return fail('E_OPTIMIZATION', error.message);
      }
    }
  },

  'optimization.query.statistics': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet'],
        properties: {
          querySet: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.optimization.getQueryStatistics(
          input.querySet,
          input.instanceId
        );
        return ok(ep.queryStats, input, result);
      } catch (error) {
        return fail('E_OPTIMIZATION', error.message);
      }
    }
  },

  'optimization.index.suggest': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet'],
        properties: {
          querySet: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.optimization.suggestIndexes(
          input.querySet,
          input.instanceId
        );
        return ok(ep.indexSuggestions, input, { suggestions: result });
      } catch (error) {
        return fail('E_OPTIMIZATION', error.message);
      }
    }
  },

  // ==================== Query Cache (5개) ====================

  'optimization.cache.enable': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          cacheSize: { type: 'integer', minimum: 1, default: 10000 },
          ttl: { type: 'integer', minimum: 1, default: 3600 },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const config = {
          cacheSize: input.cacheSize || 10000,
          ttl: input.ttl || 3600
        };
        const result = await javaWrapper.optimization.enableQueryCache(
          config,
          input.instanceId
        );
        return ok(ep.cacheConfig, input, { success: result });
      } catch (error) {
        return fail('E_OPTIMIZATION', error.message);
      }
    }
  },

  'optimization.cache.disable': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.optimization.disableQueryCache(
          input.instanceId
        );
        return ok(ep.cacheConfig, input, { success: result });
      } catch (error) {
        return fail('E_OPTIMIZATION', error.message);
      }
    }
  },

  'optimization.cache.statistics': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.optimization.getCacheStatistics(
          input.instanceId
        );
        return ok(ep.cacheStats, input, result);
      } catch (error) {
        return fail('E_OPTIMIZATION', error.message);
      }
    }
  },

  'optimization.cache.clear': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.optimization.clearQueryCache(
          input.instanceId
        );
        return ok(ep.cacheConfig, input, { success: result });
      } catch (error) {
        return fail('E_OPTIMIZATION', error.message);
      }
    }
  },

  'optimization.cache.list': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 10000, default: 100 },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.optimization.getCachedQueries(
          input.limit || 100,
          input.instanceId
        );
        return ok(ep.cachedQueries, input, { queries: result });
      } catch (error) {
        return fail('E_OPTIMIZATION', error.message);
      }
    }
  }
};

export default optimization;
