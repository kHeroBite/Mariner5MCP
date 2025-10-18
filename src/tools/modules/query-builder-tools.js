/**
 * query-builder-tools.js - 검색쿼리 빌더 MCP 도구 (15개) ⭐ v3.7 신규
 *
 * Fluent API로 직관적인 REST API 검색쿼리 작성
 */

import { makeValidator, ok, fail } from '../../utils.js';
import { SearchQueryBuilder, QueryHelper } from '../../java-wrapper-v2/query-builder.js';

const ep = {
  queryBuilder: '/query/builder',
  queryPreview: '/query/preview',
  queryValidate: '/query/validate'
};

export const queryBuilder = {
  // ==================== QueryBuilder 생성 및 기본 (5개) ====================

  'query.builder.create': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          collection: { type: 'string' },
          fields: { type: 'array', items: { type: 'string' } }
        }
      };
      makeValidator(schema)(input);
      try {
        const builder = new SearchQueryBuilder();
        if (input.collection) {
          builder.from(input.collection);
        }
        if (input.fields) {
          builder.select(input.fields);
        }
        const query = builder.build();
        return ok(ep.queryBuilder, input, { query });
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  },

  'query.builder.simple': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'keyword'],
        properties: {
          collection: { type: 'string' },
          keyword: { type: 'string' },
          fields: { type: 'array', items: { type: 'string' } }
        }
      };
      makeValidator(schema)(input);
      try {
        const query = QueryHelper.simpleSearch(
          input.collection,
          input.keyword,
          input.fields || ['*']
        );
        return ok(ep.queryBuilder, input, { query });
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  },

  'query.builder.range': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'rangeField', 'minValue', 'maxValue'],
        properties: {
          collection: { type: 'string' },
          rangeField: { type: 'string' },
          minValue: { },
          maxValue: { },
          fields: { type: 'array', items: { type: 'string' } }
        }
      };
      makeValidator(schema)(input);
      try {
        const query = QueryHelper.rangeFilter(
          input.collection,
          input.rangeField,
          input.minValue,
          input.maxValue,
          input.fields || ['*']
        );
        return ok(ep.queryBuilder, input, { query });
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  },

  'query.builder.complex': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'filters'],
        properties: {
          collection: { type: 'string' },
          filters: {
            type: 'array',
            items: { type: 'object' }
          },
          fields: { type: 'array', items: { type: 'string' } }
        }
      };
      makeValidator(schema)(input);
      try {
        const query = QueryHelper.complexFilter(
          input.collection,
          input.filters,
          input.fields || ['*']
        );
        return ok(ep.queryBuilder, input, { query });
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  },

  'query.builder.paged': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'keyword'],
        properties: {
          collection: { type: 'string' },
          keyword: { type: 'string' },
          page: { type: 'integer', minimum: 0, default: 0 },
          pageSize: { type: 'integer', minimum: 1, default: 20 },
          fields: { type: 'array', items: { type: 'string' } }
        }
      };
      makeValidator(schema)(input);
      try {
        const query = QueryHelper.pagedSearch(
          input.collection,
          input.keyword,
          input.page || 0,
          input.pageSize || 20,
          input.fields || ['*']
        );
        return ok(ep.queryBuilder, input, { query });
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  },

  // ==================== 필터 및 정렬 (5개) ====================

  'query.builder.addFilter': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet', 'field', 'operator', 'value'],
        properties: {
          querySet: { type: 'object' },
          field: { type: 'string' },
          operator: { type: 'string' },
          value: { }
        }
      };
      makeValidator(schema)(input);
      try {
        const builder = new SearchQueryBuilder();
        Object.assign(builder.querySet, input.querySet);
        builder.filter(input.field, input.operator, input.value);
        const query = builder.build();
        return ok(ep.queryBuilder, input, { query });
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  },

  'query.builder.addSort': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet', 'field'],
        properties: {
          querySet: { type: 'object' },
          field: { type: 'string' },
          order: { type: 'string', enum: ['ASC', 'DESC'], default: 'ASC' },
          priority: { type: 'integer' }
        }
      };
      makeValidator(schema)(input);
      try {
        const builder = new SearchQueryBuilder();
        Object.assign(builder.querySet, input.querySet);
        builder.sort(input.field, input.order || 'ASC', input.priority || null);
        const query = builder.build();
        return ok(ep.queryBuilder, input, { query });
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  },

  'query.builder.setPage': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet', 'start', 'count'],
        properties: {
          querySet: { type: 'object' },
          start: { type: 'integer', minimum: 0 },
          count: { type: 'integer', minimum: 1 }
        }
      };
      makeValidator(schema)(input);
      try {
        const builder = new SearchQueryBuilder();
        Object.assign(builder.querySet, input.querySet);
        builder.page(input.start, input.count);
        const query = builder.build();
        return ok(ep.queryBuilder, input, { query });
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  },

  'query.builder.highlight': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet', 'fields'],
        properties: {
          querySet: { type: 'object' },
          fields: { type: 'array', items: { type: 'string' } },
          preTag: { type: 'string', default: '<em>' },
          postTag: { type: 'string', default: '</em>' },
          fragmentSize: { type: 'integer', default: 150 }
        }
      };
      makeValidator(schema)(input);
      try {
        const builder = new SearchQueryBuilder();
        Object.assign(builder.querySet, input.querySet);
        builder.highlight(input.fields, {
          preTag: input.preTag || '<em>',
          postTag: input.postTag || '</em>',
          fragmentSize: input.fragmentSize || 150
        });
        const query = builder.build();
        return ok(ep.queryBuilder, input, { query });
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  },

  'query.builder.facet': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet', 'field'],
        properties: {
          querySet: { type: 'object' },
          field: { type: 'string' },
          limit: { type: 'integer', minimum: 1, default: 10 }
        }
      };
      makeValidator(schema)(input);
      try {
        const builder = new SearchQueryBuilder();
        Object.assign(builder.querySet, input.querySet);
        builder.facet(input.field, input.limit || 10);
        const query = builder.build();
        return ok(ep.queryBuilder, input, { query });
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  },

  // ==================== 검증 및 미리보기 (5개) ====================

  'query.builder.validate': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet'],
        properties: {
          querySet: { type: 'object' }
        }
      };
      makeValidator(schema)(input);
      try {
        const builder = new SearchQueryBuilder();
        Object.assign(builder.querySet, input.querySet);
        const validation = builder.validate();
        return ok(ep.queryValidate, input, validation);
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  },

  'query.builder.preview': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet'],
        properties: {
          querySet: { type: 'object' }
        }
      };
      makeValidator(schema)(input);
      try {
        const builder = new SearchQueryBuilder();
        Object.assign(builder.querySet, input.querySet);
        const preview = builder.preview();
        return ok(ep.queryPreview, input, { preview });
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  },

  'query.builder.build': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet'],
        properties: {
          querySet: { type: 'object' }
        }
      };
      makeValidator(schema)(input);
      try {
        const builder = new SearchQueryBuilder();
        Object.assign(builder.querySet, input.querySet);
        const query = builder.build();
        return ok(ep.queryBuilder, input, { query });
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  },

  'query.builder.reset': {
    handler: async (input) => {
      try {
        const builder = new SearchQueryBuilder();
        const query = builder.build();
        return ok(ep.queryBuilder, input, { query, message: '쿼리셋이 초기화되었습니다' });
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  },

  'query.builder.clone': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['querySet'],
        properties: {
          querySet: { type: 'object' }
        }
      };
      makeValidator(schema)(input);
      try {
        const builder = new SearchQueryBuilder();
        Object.assign(builder.querySet, input.querySet);
        const cloned = builder.clone();
        const query = cloned.build();
        return ok(ep.queryBuilder, input, { query, message: '쿼리셋이 복제되었습니다' });
      } catch (error) {
        return fail('E_QUERY_BUILDER', error.message);
      }
    }
  }
};

export default queryBuilder;
