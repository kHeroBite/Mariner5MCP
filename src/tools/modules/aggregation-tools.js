/**
 * aggregation-tools.js - 데이터 집계 MCP 도구 (10개 도구) ⭐ v3.5 신규
 *
 * - DataAggregation: 다중 컬렉션 데이터 집계 (5개)
 * - GroupOperation: 데이터 그룹화 및 분석 (5개)
 */

import { makeValidator, ok, fail } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper-v2/index.js';

const ep = {
  // Data Aggregation
  aggregation: '/aggregation/aggregate',
  grouping: '/aggregation/group',
  metrics: '/aggregation/metrics',
  unionAgg: '/aggregation/union',

  // Group Operations
  groupSort: '/aggregation/group-sort',
  groupStats: '/aggregation/group-stats',
  pivot: '/aggregation/pivot',
  rollup: '/aggregation/rollup',
  drilldown: '/aggregation/drilldown'
};

export const aggregation = {
  // ==================== Data Aggregation (5개) ====================

  'aggregation.documents': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          collectionNames: {
            type: 'array',
            items: { type: 'string' }
          },
          aggregationConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.aggregation.aggregateDocuments(
          input.collectionNames || [],
          input.aggregationConfig || {},
          input.instanceId
        );
        return ok(ep.aggregation, input, { results: result });
      } catch (error) {
        return fail('E_AGGREGATION', error.message);
      }
    }
  },

  'aggregation.groupBy': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['groupField'],
        properties: {
          collectionNames: {
            type: 'array',
            items: { type: 'string' }
          },
          groupField: { type: 'string' },
          aggregateFunctions: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.aggregation.groupByField(
          input.collectionNames || [],
          input.groupField,
          input.aggregateFunctions || {},
          input.instanceId
        );
        return ok(ep.grouping, input, { results: result });
      } catch (error) {
        return fail('E_AGGREGATION', error.message);
      }
    }
  },

  'aggregation.metrics': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          collectionNames: {
            type: 'array',
            items: { type: 'string' }
          },
          metricsConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.aggregation.calculateMetrics(
          input.collectionNames || [],
          input.metricsConfig || {},
          input.instanceId
        );
        return ok(ep.metrics, input, result);
      } catch (error) {
        return fail('E_AGGREGATION', error.message);
      }
    }
  },

  'aggregation.union': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          collectionNames: {
            type: 'array',
            items: { type: 'string' }
          },
          unionConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.aggregation.performUnionAggregation(
          input.collectionNames || [],
          input.unionConfig || {},
          input.instanceId
        );
        return ok(ep.unionAgg, input, result);
      } catch (error) {
        return fail('E_AGGREGATION', error.message);
      }
    }
  },

  'aggregation.statistics': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          collectionNames: {
            type: 'array',
            items: { type: 'string' }
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.aggregation.getAggregationStatistics(
          input.collectionNames || [],
          input.instanceId
        );
        return ok(ep.metrics, input, result);
      } catch (error) {
        return fail('E_AGGREGATION', error.message);
      }
    }
  },

  // ==================== Group Operations (5개) ====================

  'aggregation.groupSort': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          collectionNames: {
            type: 'array',
            items: { type: 'string' }
          },
          groupConfig: { type: 'object' },
          sortConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.aggregation.groupAndSort(
          input.collectionNames || [],
          input.groupConfig || {},
          input.sortConfig || {},
          input.instanceId
        );
        return ok(ep.groupSort, input, { results: result });
      } catch (error) {
        return fail('E_AGGREGATION', error.message);
      }
    }
  },

  'aggregation.groupStats': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['groupField'],
        properties: {
          collectionNames: {
            type: 'array',
            items: { type: 'string' }
          },
          groupField: { type: 'string' },
          statisticsFunctions: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.aggregation.calculateGroupStatistics(
          input.collectionNames || [],
          input.groupField,
          input.statisticsFunctions || {},
          input.instanceId
        );
        return ok(ep.groupStats, input, { results: result });
      } catch (error) {
        return fail('E_AGGREGATION', error.message);
      }
    }
  },

  'aggregation.pivot': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          collectionNames: {
            type: 'array',
            items: { type: 'string' }
          },
          pivotConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.aggregation.performPivotTable(
          input.collectionNames || [],
          input.pivotConfig || {},
          input.instanceId
        );
        return ok(ep.pivot, input, result);
      } catch (error) {
        return fail('E_AGGREGATION', error.message);
      }
    }
  },

  'aggregation.rollup': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          collectionNames: {
            type: 'array',
            items: { type: 'string' }
          },
          rollupConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.aggregation.rollupData(
          input.collectionNames || [],
          input.rollupConfig || {},
          input.instanceId
        );
        return ok(ep.rollup, input, { results: result });
      } catch (error) {
        return fail('E_AGGREGATION', error.message);
      }
    }
  },

  'aggregation.drilldown': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          collectionNames: {
            type: 'array',
            items: { type: 'string' }
          },
          drillDownConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.aggregation.getDrillDownData(
          input.collectionNames || [],
          input.drillDownConfig || {},
          input.instanceId
        );
        return ok(ep.drilldown, input, { results: result });
      } catch (error) {
        return fail('E_AGGREGATION', error.message);
      }
    }
  }
};

export default aggregation;
