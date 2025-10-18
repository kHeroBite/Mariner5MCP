/**
 * dict-advanced.js - 고급 사전 관리 MCP 도구 (40+ 도구) ⭐ 신규
 *
 * User CN Dictionary (중국어/일본어/외국어 유의어)
 * User PreMorph (Pre-Morph 형태소 분석)
 */

import { makeValidator, ok, fail } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper-v2/index.js';

// ==================== 엔드포인트 ====================
const ep = {
  // User CN Dictionary
  cnDic_create: '/dictionary/userCnDic/create',
  cnDic_get: '/dictionary/userCnDic/get',
  cnDic_list: '/dictionary/userCnDic/list',
  cnDic_update: '/dictionary/userCnDic/update',
  cnDic_delete: '/dictionary/userCnDic/delete',
  cnDic_apply: '/dictionary/userCnDic/apply',
  cnDic_bulk: '/dictionary/userCnDic/bulk',

  // User PreMorph
  preMorph_create: '/dictionary/userPreMorph/create',
  preMorph_get: '/dictionary/userPreMorph/get',
  preMorph_list: '/dictionary/userPreMorph/list',
  preMorph_update: '/dictionary/userPreMorph/update',
  preMorph_delete: '/dictionary/userPreMorph/delete',
  preMorph_apply: '/dictionary/userPreMorph/apply',
  preMorph_test: '/dictionary/userPreMorph/test',
  preMorph_bulk: '/dictionary/userPreMorph/bulk'
};

export const dictAdvanced = {
  // ==================== User CN Dictionary (중국어/일본어/외국어 유의어) ====================

  'dict.userCnDic.create': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'keyword', 'cnKeyword'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          keyword: { type: 'string' },
          cnKeyword: { type: 'string' },
          posTag: { type: 'string', enum: ['NN', 'VV', 'JJ', 'RB', 'OTHER'] },
          data: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.createUserCnDicEntry(
          input.collectionId,
          input.profileId,
          input.keyword,
          input.cnKeyword,
          input.posTag || 'NN',
          input.data || {},
          input.instanceId
        );
        return ok(ep.cnDic_create, input, result);
      } catch (error) {
        return fail('E_DICT_CN', error.message, { keyword: input.keyword, cnKeyword: input.cnKeyword });
      }
    }
  },

  'dict.userCnDic.get': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'keyword', 'cnKeyword'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          keyword: { type: 'string' },
          cnKeyword: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.getDetailedUserCnDicEntry(
          input.collectionId,
          input.profileId,
          input.keyword,
          input.cnKeyword,
          input.instanceId
        );
        return ok(ep.cnDic_get, input, result);
      } catch (error) {
        return fail('E_DICT_CN', error.message, { keyword: input.keyword });
      }
    }
  },

  'dict.userCnDic.list': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          keyword: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.listUserCnDicEntries(
          input.collectionId,
          input.profileId,
          input.keyword || null,
          input.instanceId
        );
        return ok(ep.cnDic_list, input, result);
      } catch (error) {
        return fail('E_DICT_CN', error.message);
      }
    }
  },

  'dict.userCnDic.update': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'keyword', 'cnKeyword'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          keyword: { type: 'string' },
          cnKeyword: { type: 'string' },
          posTag: { type: 'string' },
          data: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.updateUserCnDicEntry(
          input.collectionId,
          input.profileId,
          input.keyword,
          input.cnKeyword,
          input.posTag || 'NN',
          input.data || {},
          input.instanceId
        );
        return ok(ep.cnDic_update, input, result);
      } catch (error) {
        return fail('E_DICT_CN', error.message, { keyword: input.keyword });
      }
    }
  },

  'dict.userCnDic.delete': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'keyword', 'cnKeyword'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          keyword: { type: 'string' },
          cnKeyword: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.deleteUserCnDicEntry(
          input.collectionId,
          input.profileId,
          input.keyword,
          input.cnKeyword,
          input.instanceId
        );
        return ok(ep.cnDic_delete, input, { deleted: result });
      } catch (error) {
        return fail('E_DICT_CN', error.message, { keyword: input.keyword });
      }
    }
  },

  'dict.userCnDic.apply': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.applyUserCnDictionary(
          input.collectionId,
          input.profileId,
          input.instanceId
        );
        return ok(ep.cnDic_apply, input, { applied: result });
      } catch (error) {
        return fail('E_DICT_CN', error.message);
      }
    }
  },

  'dict.userCnDic.bulk': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'entries'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          entries: {
            type: 'array',
            items: {
              type: 'object',
              required: ['keyword', 'cnKeyword'],
              properties: {
                keyword: { type: 'string' },
                cnKeyword: { type: 'string' },
                posTag: { type: 'string' },
                data: { type: 'object' }
              }
            }
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.bulkCreateUserCnDicEntries(
          input.collectionId,
          input.profileId,
          input.entries,
          input.instanceId
        );
        return ok(ep.cnDic_bulk, input, { count: input.entries.length, result });
      } catch (error) {
        return fail('E_DICT_CN', error.message, { count: input.entries.length });
      }
    }
  },

  // ==================== User PreMorph (Pre-Morph 형태소 분석) ====================

  'dict.userPreMorph.create': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'keyword'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          keyword: { type: 'string' },
          morphs: {
            type: 'array',
            items: { type: 'string' }
          },
          posTag: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.createUserPreMorphEntry(
          input.collectionId,
          input.profileId,
          input.keyword,
          input.morphs || [],
          input.posTag || 'NN',
          input.instanceId
        );
        return ok(ep.preMorph_create, input, result);
      } catch (error) {
        return fail('E_PROMORPH', error.message, { keyword: input.keyword });
      }
    }
  },

  'dict.userPreMorph.get': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'keyword'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          keyword: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.getDetailedUserPreMorphEntry(
          input.collectionId,
          input.profileId,
          input.keyword,
          input.instanceId
        );
        return ok(ep.preMorph_get, input, result);
      } catch (error) {
        return fail('E_PROMORPH', error.message, { keyword: input.keyword });
      }
    }
  },

  'dict.userPreMorph.list': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.listUserPreMorphEntries(
          input.collectionId,
          input.profileId,
          input.instanceId
        );
        return ok(ep.preMorph_list, input, result);
      } catch (error) {
        return fail('E_PROMORPH', error.message);
      }
    }
  },

  'dict.userPreMorph.update': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'keyword'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          keyword: { type: 'string' },
          morphs: {
            type: 'array',
            items: { type: 'string' }
          },
          posTag: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.updateUserPreMorphEntry(
          input.collectionId,
          input.profileId,
          input.keyword,
          input.morphs || [],
          input.posTag || 'NN',
          input.instanceId
        );
        return ok(ep.preMorph_update, input, result);
      } catch (error) {
        return fail('E_PROMORPH', error.message, { keyword: input.keyword });
      }
    }
  },

  'dict.userPreMorph.delete': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'keyword'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          keyword: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.deleteUserPreMorphEntry(
          input.collectionId,
          input.profileId,
          input.keyword,
          input.instanceId
        );
        return ok(ep.preMorph_delete, input, { deleted: result });
      } catch (error) {
        return fail('E_PROMORPH', error.message, { keyword: input.keyword });
      }
    }
  },

  'dict.userPreMorph.apply': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.applyUserPreMorph(
          input.collectionId,
          input.profileId,
          input.instanceId
        );
        return ok(ep.preMorph_apply, input, { applied: result });
      } catch (error) {
        return fail('E_PROMORPH', error.message);
      }
    }
  },

  'dict.userPreMorph.test': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'keyword'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          keyword: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.testUserPreMorphAnalysis(
          input.collectionId,
          input.profileId,
          input.keyword,
          input.instanceId
        );
        return ok(ep.preMorph_test, input, result);
      } catch (error) {
        return fail('E_PROMORPH', error.message, { keyword: input.keyword });
      }
    }
  },

  'dict.userPreMorph.bulk': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'entries'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          entries: {
            type: 'array',
            items: {
              type: 'object',
              required: ['keyword'],
              properties: {
                keyword: { type: 'string' },
                morphs: {
                  type: 'array',
                  items: { type: 'string' }
                },
                posTag: { type: 'string' }
              }
            }
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.dictionary.bulkCreateUserPreMorphEntries(
          input.collectionId,
          input.profileId,
          input.entries,
          input.instanceId
        );
        return ok(ep.preMorph_bulk, input, { count: input.entries.length, result });
      } catch (error) {
        return fail('E_PROMORPH', error.message, { count: input.entries.length });
      }
    }
  }
};

export default dictAdvanced;
