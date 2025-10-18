/**
 * analyzer-tools.js - 분석기(Analyzer) 설정 MCP 도구 (12개) ⭐ v3.7 신규
 *
 * 형태소분석/바이그램/유니그램 명시적 제어
 */

import { makeValidator, ok, fail } from '../../utils.js';
import {
  listAnalyzers,
  getFieldAnalyzer,
  setFieldAnalyzer,
  setMorphemeAnalyzer,
  setBigramAnalyzer,
  setUnigramAnalyzer,
  testAnalyzer,
  compareAnalyzers,
  recommendAnalyzer,
  resetFieldAnalyzer,
  getCollectionAnalyzers,
  setCollectionAnalyzers
} from '../../java-wrapper-v2/analyzer-config.js';

const ep = {
  analyzer: '/analyzer/config'
};

export const analyzerTools = {
  // ==================== Analyzer 조회 및 설정 (12개) ====================

  'analyzer.list': {
    handler: async (input) => {
      const schema = { type: 'object' };
      makeValidator(schema)(input);
      try {
        const result = await listAnalyzers(input.instanceId);
        return ok(ep.analyzer, input, { analyzers: result });
      } catch (error) {
        return fail('E_ANALYZER', error.message);
      }
    }
  },

  'analyzer.getField': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'field'],
        properties: {
          collection: { type: 'string' },
          field: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await getFieldAnalyzer(input.collection, input.field, input.instanceId);
        return ok(ep.analyzer, input, result);
      } catch (error) {
        return fail('E_ANALYZER', error.message);
      }
    }
  },

  'analyzer.setField': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'field', 'analyzerConfig'],
        properties: {
          collection: { type: 'string' },
          field: { type: 'string' },
          analyzerConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const success = await setFieldAnalyzer(
          input.collection,
          input.field,
          input.analyzerConfig,
          input.instanceId
        );
        return ok(ep.analyzer, input, { success });
      } catch (error) {
        return fail('E_ANALYZER', error.message);
      }
    }
  },

  'analyzer.setMorpheme': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'field'],
        properties: {
          collection: { type: 'string' },
          field: { type: 'string' },
          options: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const success = await setMorphemeAnalyzer(
          input.collection,
          input.field,
          input.options || {},
          input.instanceId
        );
        return ok(ep.analyzer, input, {
          success,
          message: '형태소 분석기가 설정되었습니다'
        });
      } catch (error) {
        return fail('E_ANALYZER', error.message);
      }
    }
  },

  'analyzer.setBigram': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'field'],
        properties: {
          collection: { type: 'string' },
          field: { type: 'string' },
          options: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const success = await setBigramAnalyzer(
          input.collection,
          input.field,
          input.options || {},
          input.instanceId
        );
        return ok(ep.analyzer, input, {
          success,
          message: '바이그램 분석기가 설정되었습니다'
        });
      } catch (error) {
        return fail('E_ANALYZER', error.message);
      }
    }
  },

  'analyzer.setUnigram': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'field'],
        properties: {
          collection: { type: 'string' },
          field: { type: 'string' },
          options: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const success = await setUnigramAnalyzer(
          input.collection,
          input.field,
          input.options || {},
          input.instanceId
        );
        return ok(ep.analyzer, input, {
          success,
          message: '유니그램 분석기가 설정되었습니다'
        });
      } catch (error) {
        return fail('E_ANALYZER', error.message);
      }
    }
  },

  'analyzer.test': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['analyzerType', 'text'],
        properties: {
          analyzerType: { type: 'string' },
          text: { type: 'string' },
          options: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const tokens = await testAnalyzer(
          input.analyzerType,
          input.text,
          input.options || {},
          input.instanceId
        );
        return ok(ep.analyzer, input, { tokens });
      } catch (error) {
        return fail('E_ANALYZER', error.message);
      }
    }
  },

  'analyzer.compare': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['text', 'analyzer1Type', 'analyzer2Type'],
        properties: {
          text: { type: 'string' },
          analyzer1Type: { type: 'string' },
          analyzer2Type: { type: 'string' },
          options1: { type: 'object' },
          options2: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const comparison = await compareAnalyzers(
          input.text,
          input.analyzer1Type,
          input.analyzer2Type,
          input.options1 || {},
          input.options2 || {},
          input.instanceId
        );
        return ok(ep.analyzer, input, comparison);
      } catch (error) {
        return fail('E_ANALYZER', error.message);
      }
    }
  },

  'analyzer.recommend': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['field', 'dataSamples'],
        properties: {
          field: { type: 'string' },
          dataSamples: { type: 'array' },
          collection: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const recommendation = await recommendAnalyzer(
          input.field,
          input.dataSamples,
          input.collection || null,
          input.instanceId
        );
        return ok(ep.analyzer, input, recommendation);
      } catch (error) {
        return fail('E_ANALYZER', error.message);
      }
    }
  },

  'analyzer.resetField': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'field'],
        properties: {
          collection: { type: 'string' },
          field: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const success = await resetFieldAnalyzer(
          input.collection,
          input.field,
          input.instanceId
        );
        return ok(ep.analyzer, input, {
          success,
          message: '필드 분석기가 초기화되었습니다'
        });
      } catch (error) {
        return fail('E_ANALYZER', error.message);
      }
    }
  },

  'analyzer.getCollection': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection'],
        properties: {
          collection: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const analyzers = await getCollectionAnalyzers(input.collection, input.instanceId);
        return ok(ep.analyzer, input, analyzers);
      } catch (error) {
        return fail('E_ANALYZER', error.message);
      }
    }
  },

  'analyzer.setCollection': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'analyzerConfig'],
        properties: {
          collection: { type: 'string' },
          analyzerConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const success = await setCollectionAnalyzers(
          input.collection,
          input.analyzerConfig,
          input.instanceId
        );
        return ok(ep.analyzer, input, {
          success,
          message: '컬렉션 분석기가 설정되었습니다'
        });
      } catch (error) {
        return fail('E_ANALYZER', error.message);
      }
    }
  }
};

export default analyzerTools;
