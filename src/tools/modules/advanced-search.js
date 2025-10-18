/**
 * advanced-search.js - 고급 검색 MCP 도구 (18개 도구) ⭐ 신규
 *
 * - IntegratedInfo: 서버 통합 정보 조회 (7개 도구)
 * - SearchRequest: 고급 검색 기능 (11개 도구)
 */

import { makeValidator, ok, fail } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper-v2/index.js';

// ==================== 엔드포인트 ====================
const ep = {
  // IntegratedInfo
  serverInfo: '/search/integrated/info',
  serverHealth: '/search/integrated/health',
  sysResources: '/search/integrated/resources',
  collections: '/search/integrated/collections',
  performance: '/search/integrated/performance',
  activities: '/search/integrated/activities',
  dashboard: '/search/integrated/dashboard',

  // SearchRequest
  advancedSearch: '/search/advanced/execute',
  facetSearch: '/search/advanced/facets',
  spellCheck: '/search/advanced/spellcheck',
  suggestions: '/search/advanced/suggestions',
  recommendations: '/search/advanced/recommendations',
  boostSearch: '/search/advanced/boost',
  filterSearch: '/search/advanced/filters',
  analyzeQuery: '/search/advanced/analyze'
};

export const advancedSearch = {
  // ==================== IntegratedInfo ====================

  'search.integrated.info': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.getServerIntegratedInfo(input.instanceId);
        return ok(ep.serverInfo, input, result);
      } catch (error) {
        return fail('E_INTEGRATED', error.message);
      }
    }
  },

  'search.integrated.health': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.getServerHealth(input.instanceId);
        return ok(ep.serverHealth, input, result);
      } catch (error) {
        return fail('E_INTEGRATED', error.message);
      }
    }
  },

  'search.integrated.resources': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.getSystemResources(input.instanceId);
        return ok(ep.sysResources, input, result);
      } catch (error) {
        return fail('E_INTEGRATED', error.message);
      }
    }
  },

  'search.integrated.collections': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.getCollectionsSummary(input.instanceId);
        return ok(ep.collections, input, result);
      } catch (error) {
        return fail('E_INTEGRATED', error.message);
      }
    }
  },

  'search.integrated.performance': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.getPerformanceMetrics(input.instanceId);
        return ok(ep.performance, input, result);
      } catch (error) {
        return fail('E_INTEGRATED', error.message);
      }
    }
  },

  'search.integrated.activities': {
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
        const result = await javaWrapper.hotspot.getRecentActivities(
          input.limit || 100,
          input.instanceId
        );
        return ok(ep.activities, input, result);
      } catch (error) {
        return fail('E_INTEGRATED', error.message);
      }
    }
  },

  'search.integrated.dashboard': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          dashboardType: { type: 'string', enum: ['overview', 'search', 'index', 'system'] },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.getDashboard(
          input.dashboardType || 'overview',
          input.instanceId
        );
        return ok(ep.dashboard, input, result);
      } catch (error) {
        return fail('E_INTEGRATED', error.message);
      }
    }
  },

  // ==================== SearchRequest ====================

  'search.advanced.execute': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet'],
        properties: {
          querySet: { type: 'object' },
          options: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.executeAdvancedSearch(
          input.querySet,
          input.options || {},
          input.instanceId
        );
        return ok(ep.advancedSearch, input, result);
      } catch (error) {
        return fail('E_SEARCH', error.message);
      }
    }
  },

  'search.advanced.facets': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet', 'facetFields'],
        properties: {
          querySet: { type: 'object' },
          facetFields: {
            type: 'array',
            items: { type: 'string' }
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.searchWithFacets(
          input.querySet,
          input.facetFields,
          input.instanceId
        );
        return ok(ep.facetSearch, input, result);
      } catch (error) {
        return fail('E_SEARCH', error.message);
      }
    }
  },

  'search.advanced.spellcheck': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['keyword', 'collectionName'],
        properties: {
          keyword: { type: 'string' },
          collectionName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.searchWithSpellCheck(
          input.keyword,
          input.collectionName,
          input.instanceId
        );
        return ok(ep.spellCheck, input, result);
      } catch (error) {
        return fail('E_SEARCH', error.message, { keyword: input.keyword });
      }
    }
  },

  'search.advanced.suggestions': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['keyword', 'collectionName'],
        properties: {
          keyword: { type: 'string' },
          collectionName: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.getSearchSuggestions(
          input.keyword,
          input.collectionName,
          input.limit || 10,
          input.instanceId
        );
        return ok(ep.suggestions, input, result);
      } catch (error) {
        return fail('E_SEARCH', error.message, { keyword: input.keyword });
      }
    }
  },

  'search.advanced.recommendations': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['keyword', 'collectionName'],
        properties: {
          keyword: { type: 'string' },
          collectionName: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.getSearchRecommendations(
          input.keyword,
          input.collectionName,
          input.limit || 10,
          input.instanceId
        );
        return ok(ep.recommendations, input, result);
      } catch (error) {
        return fail('E_SEARCH', error.message, { keyword: input.keyword });
      }
    }
  },

  'search.advanced.boost': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet', 'boostConfig'],
        properties: {
          querySet: { type: 'object' },
          boostConfig: {
            type: 'object',
            properties: {
              fields: { type: 'object' },
              phrase: { type: 'number' },
              recency: { type: 'number' }
            }
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.searchWithBoost(
          input.querySet,
          input.boostConfig,
          input.instanceId
        );
        return ok(ep.boostSearch, input, result);
      } catch (error) {
        return fail('E_SEARCH', error.message);
      }
    }
  },

  'search.advanced.filters': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet', 'filters'],
        properties: {
          querySet: { type: 'object' },
          filters: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.hotspot.searchWithFilters(
          input.querySet,
          input.filters,
          input.instanceId
        );
        return ok(ep.filterSearch, input, result);
      } catch (error) {
        return fail('E_SEARCH', error.message);
      }
    }
  },

  'search.advanced.analyze': {
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
        const result = await javaWrapper.hotspot.analyzeSearchQuery(
          input.querySet,
          input.instanceId
        );
        return ok(ep.analyzeQuery, input, result);
      } catch (error) {
        return fail('E_SEARCH', error.message);
      }
    }
  }
};

export default advancedSearch;
