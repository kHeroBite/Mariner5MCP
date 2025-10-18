/**
 * sort-tools.js - n차 정렬 설정 MCP 도구 (8개) ⭐ v3.7 신규
 *
 * 1차/2차/3차 정렬 우선순위 명시적 제어
 */

import { makeValidator, ok, fail } from '../../utils.js';
import {
  getSortPriority,
  setSortPriority,
  setPrimarySort,
  addSecondarySort,
  addTertiarySort,
  validateSortConfig,
  previewSortResults,
  resetSortConfig
} from '../../java-wrapper-v2/sort-config.js';

const ep = {
  sort: '/sort/config'
};

export const sortTools = {
  // ==================== n차 정렬 관리 (8개) ====================

  'sort.getPriority': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection'],
        properties: {
          collection: { type: 'string' },
          profileId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const sortChain = await getSortPriority(
          input.collection,
          input.profileId || null,
          input.instanceId
        );
        return ok(ep.sort, input, { sortChain });
      } catch (error) {
        return fail('E_SORT_CONFIG', error.message);
      }
    }
  },

  'sort.setPriority': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'sortChain'],
        properties: {
          collection: { type: 'string' },
          sortChain: {
            type: 'array',
            items: {
              type: 'object',
              required: ['field', 'order', 'priority'],
              properties: {
                field: { type: 'string' },
                order: { type: 'string', enum: ['ASC', 'DESC'] },
                priority: { type: 'integer', minimum: 1 }
              }
            }
          },
          profileId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const success = await setSortPriority(
          input.collection,
          input.sortChain,
          input.profileId || null,
          input.instanceId
        );
        return ok(ep.sort, input, {
          success,
          message: 'n차 정렬 우선순위가 설정되었습니다',
          levels: input.sortChain.length
        });
      } catch (error) {
        return fail('E_SORT_CONFIG', error.message);
      }
    }
  },

  'sort.setPrimary': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'field'],
        properties: {
          collection: { type: 'string' },
          field: { type: 'string' },
          order: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' },
          profileId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const success = await setPrimarySort(
          input.collection,
          input.field,
          input.order || 'DESC',
          input.profileId || null,
          input.instanceId
        );
        return ok(ep.sort, input, {
          success,
          message: '1차 정렬이 설정되었습니다',
          field: input.field,
          order: input.order || 'DESC'
        });
      } catch (error) {
        return fail('E_SORT_CONFIG', error.message);
      }
    }
  },

  'sort.addSecondary': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'field'],
        properties: {
          collection: { type: 'string' },
          field: { type: 'string' },
          order: { type: 'string', enum: ['ASC', 'DESC'], default: 'ASC' },
          profileId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const success = await addSecondarySort(
          input.collection,
          input.field,
          input.order || 'ASC',
          input.profileId || null,
          input.instanceId
        );
        return ok(ep.sort, input, {
          success,
          message: '2차 정렬이 추가되었습니다',
          field: input.field,
          order: input.order || 'ASC'
        });
      } catch (error) {
        return fail('E_SORT_CONFIG', error.message);
      }
    }
  },

  'sort.addTertiary': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection', 'field'],
        properties: {
          collection: { type: 'string' },
          field: { type: 'string' },
          order: { type: 'string', enum: ['ASC', 'DESC'], default: 'ASC' },
          profileId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const success = await addTertiarySort(
          input.collection,
          input.field,
          input.order || 'ASC',
          input.profileId || null,
          input.instanceId
        );
        return ok(ep.sort, input, {
          success,
          message: '3차 정렬이 추가되었습니다',
          field: input.field,
          order: input.order || 'ASC'
        });
      } catch (error) {
        return fail('E_SORT_CONFIG', error.message);
      }
    }
  },

  'sort.validate': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection'],
        properties: {
          collection: { type: 'string' },
          profileId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const validation = await validateSortConfig(
          input.collection,
          input.profileId || null,
          input.instanceId
        );
        return ok(ep.sort, input, validation);
      } catch (error) {
        return fail('E_SORT_CONFIG', error.message);
      }
    }
  },

  'sort.preview': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection'],
        properties: {
          collection: { type: 'string' },
          querySet: { type: 'object' },
          profileId: { type: 'string' },
          limit: { type: 'integer', minimum: 1, default: 10 },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const results = await previewSortResults(
          input.collection,
          input.querySet || {},
          input.profileId || null,
          input.limit || 10,
          input.instanceId
        );
        return ok(ep.sort, input, { results, count: results.length });
      } catch (error) {
        return fail('E_SORT_CONFIG', error.message);
      }
    }
  },

  'sort.reset': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection'],
        properties: {
          collection: { type: 'string' },
          profileId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const success = await resetSortConfig(
          input.collection,
          input.profileId || null,
          input.instanceId
        );
        return ok(ep.sort, input, {
          success,
          message: '정렬 설정이 초기화되었습니다'
        });
      } catch (error) {
        return fail('E_SORT_CONFIG', error.message);
      }
    }
  }
};

export default sortTools;
