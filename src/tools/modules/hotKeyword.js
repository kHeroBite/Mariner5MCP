/**
 * hotKeyword.js - 핫 키워드 관리 MCP 도구 (15 도구)
 *
 * 인기 검색어, 추천 키워드, 트렌딩 분석
 */

import { makeValidator, ok, fail } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper-v2/index.js';

// ==================== 엔드포인트 ====================
const ep = {
  // Hot Keywords
  listHotKeywords: '/keyword/hot/list',
  getHotKeywordDetail: '/keyword/hot/detail',
  addHotKeyword: '/keyword/hot/add',
  removeHotKeyword: '/keyword/hot/remove',
  updateHotKeywordRank: '/keyword/hot/rank/update',

  // Trending Keywords
  getTrendingKeywords: '/keyword/trending/list',
  analyzeTrendingPattern: '/keyword/trending/analyze',
  setTrendingPeriod: '/keyword/trending/period',

  // Keyword Recommendations
  listRecommendations: '/keyword/recommendations/list',
  addRecommendation: '/keyword/recommendations/add',
  removeRecommendation: '/keyword/recommendations/remove',

  // Keyword Statistics
  getKeywordStats: '/keyword/stats',
  getKeywordFrequency: '/keyword/frequency',
  exportKeywordStats: '/keyword/stats/export',
  importKeywordData: '/keyword/data/import'
};

export const hotKeyword = {
  // ==================== 핫 키워드 ====================

  'hotKeyword.list': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 100 },
          offset: { type: 'number', default: 0 },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.listHotKeywords(
          input.limit || 100,
          input.offset || 0,
          input.server
        );
        return ok(ep.listHotKeywords, input, result);
      } catch (error) {
        return fail('E_KEYWORD', error.message);
      }
    }
  },

  'hotKeyword.detail': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['keyword'],
        properties: {
          keyword: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.getHotKeywordDetail(
          input.keyword,
          input.server
        );
        return ok(ep.getHotKeywordDetail, input, result);
      } catch (error) {
        return fail('E_KEYWORD', error.message, { keyword: input.keyword });
      }
    }
  },

  'hotKeyword.add': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['keyword', 'rank'],
        properties: {
          keyword: { type: 'string' },
          rank: { type: 'number' },
          score: { type: 'number' },
          description: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.addHotKeyword(
          input.keyword,
          input.rank,
          input.score || 0,
          input.description || '',
          input.server
        );
        return ok(ep.addHotKeyword, input, { success: result });
      } catch (error) {
        return fail('E_KEYWORD', error.message, { keyword: input.keyword });
      }
    }
  },

  'hotKeyword.remove': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['keyword'],
        properties: {
          keyword: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.removeHotKeyword(
          input.keyword,
          input.server
        );
        return ok(ep.removeHotKeyword, input, { success: result });
      } catch (error) {
        return fail('E_KEYWORD', error.message, { keyword: input.keyword });
      }
    }
  },

  'hotKeyword.updateRank': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['keyword', 'newRank'],
        properties: {
          keyword: { type: 'string' },
          newRank: { type: 'number' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.updateHotKeywordRank(
          input.keyword,
          input.newRank,
          input.server
        );
        return ok(ep.updateHotKeywordRank, input, { success: result });
      } catch (error) {
        return fail('E_KEYWORD', error.message, { keyword: input.keyword });
      }
    }
  },

  // ==================== 트렌딩 키워드 ====================

  'hotKeyword.trending.list': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          period: { type: 'string', default: 'daily' },
          limit: { type: 'number', default: 50 },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.getTrendingKeywords(
          input.period || 'daily',
          input.limit || 50,
          input.server
        );
        return ok(ep.getTrendingKeywords, input, result);
      } catch (error) {
        return fail('E_KEYWORD', error.message);
      }
    }
  },

  'hotKeyword.trending.analyze': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['startDate', 'endDate'],
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          keywords: { type: 'array' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.analyzeTrendingPattern(
          input.startDate,
          input.endDate,
          input.keywords || [],
          input.server
        );
        return ok(ep.analyzeTrendingPattern, input, result);
      } catch (error) {
        return fail('E_KEYWORD', error.message);
      }
    }
  },

  'hotKeyword.trending.setPeriod': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['period'],
        properties: {
          period: { type: 'string' },
          intervalDays: { type: 'number' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.setTrendingPeriod(
          input.period,
          input.intervalDays || 1,
          input.server
        );
        return ok(ep.setTrendingPeriod, input, { success: result });
      } catch (error) {
        return fail('E_KEYWORD', error.message);
      }
    }
  },

  // ==================== 키워드 추천 ====================

  'hotKeyword.recommendation.list': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 100 },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.listKeywordRecommendations(
          input.limit || 100,
          input.server
        );
        return ok(ep.listRecommendations, input, result);
      } catch (error) {
        return fail('E_KEYWORD', error.message);
      }
    }
  },

  'hotKeyword.recommendation.add': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['sourceKeyword', 'recommendedKeyword'],
        properties: {
          sourceKeyword: { type: 'string' },
          recommendedKeyword: { type: 'string' },
          weight: { type: 'number', default: 1 },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.addKeywordRecommendation(
          input.sourceKeyword,
          input.recommendedKeyword,
          input.weight || 1,
          input.server
        );
        return ok(ep.addRecommendation, input, { success: result });
      } catch (error) {
        return fail('E_KEYWORD', error.message);
      }
    }
  },

  'hotKeyword.recommendation.remove': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['sourceKeyword', 'recommendedKeyword'],
        properties: {
          sourceKeyword: { type: 'string' },
          recommendedKeyword: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.removeKeywordRecommendation(
          input.sourceKeyword,
          input.recommendedKeyword,
          input.server
        );
        return ok(ep.removeRecommendation, input, { success: result });
      } catch (error) {
        return fail('E_KEYWORD', error.message);
      }
    }
  },

  // ==================== 키워드 통계 ====================

  'hotKeyword.stats.get': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['period'],
        properties: {
          period: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.getKeywordStats(
          input.period,
          input.startDate,
          input.endDate,
          input.server
        );
        return ok(ep.getKeywordStats, input, result);
      } catch (error) {
        return fail('E_KEYWORD', error.message);
      }
    }
  },

  'hotKeyword.frequency': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['keyword'],
        properties: {
          keyword: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.getKeywordFrequency(
          input.keyword,
          input.startDate,
          input.endDate,
          input.server
        );
        return ok(ep.getKeywordFrequency, input, result);
      } catch (error) {
        return fail('E_KEYWORD', error.message, { keyword: input.keyword });
      }
    }
  },

  'hotKeyword.stats.export': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['format'],
        properties: {
          format: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          filePath: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.exportKeywordStats(
          input.format,
          input.startDate,
          input.endDate,
          input.filePath,
          input.server
        );
        return ok(ep.exportKeywordStats, input, { success: result });
      } catch (error) {
        return fail('E_KEYWORD', error.message);
      }
    }
  },

  'hotKeyword.data.import': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['filePath'],
        properties: {
          filePath: { type: 'string' },
          format: { type: 'string' },
          overwrite: { type: 'boolean', default: false },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.importKeywordData(
          input.filePath,
          input.format,
          input.overwrite || false,
          input.server
        );
        return ok(ep.importKeywordData, input, { success: result });
      } catch (error) {
        return fail('E_KEYWORD', error.message);
      }
    }
  }
};

export default hotKeyword;
