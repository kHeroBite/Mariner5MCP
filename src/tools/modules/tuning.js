/**
 * tuning.js - 검색 튜닝 MCP 도구 (30 도구)
 *
 * 검색 프로파일, QuerySet, 랭킹 모델, 필터/정렬 설정
 */

import { makeValidator, ok, fail } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper-v2/index.js';

// ==================== 엔드포인트 ====================
const ep = {
  // Search Profiles
  createProfile: '/tuning/profiles/create',
  getProfile: '/tuning/profiles/get',
  listProfiles: '/tuning/profiles/list',
  modifyProfile: '/tuning/profiles/modify',
  deleteProfile: '/tuning/profiles/delete',

  // QuerySets
  createQuerySet: '/tuning/querysets/create',
  getQuerySet: '/tuning/querysets/get',
  listQuerySets: '/tuning/querysets/list',
  modifyQuerySet: '/tuning/querysets/modify',
  deleteQuerySet: '/tuning/querysets/delete',
  copyQuerySet: '/tuning/querysets/copy',

  // Ranking
  setRankingModel: '/tuning/ranking/model/set',
  getRankingModel: '/tuning/ranking/model/get',
  setRankingWeight: '/tuning/ranking/weight/set',

  // Field Settings
  setFilterFields: '/tuning/fields/filter/set',
  setSortFields: '/tuning/fields/sort/set',
  setGroupByField: '/tuning/fields/groupby/set',
  setSearchFields: '/tuning/fields/search/set'
};

export const tuning = {
  // ==================== 검색 프로파일 ====================

  'tuning.profile.create': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileName'],
        properties: {
          collectionId: { type: 'string' },
          profileName: { type: 'string' },
          config: { type: 'object' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.createSearchProfile(
          input.collectionId,
          input.profileName,
          input.config || {},
          input.server
        );
        return ok(ep.createProfile, input, result);
      } catch (error) {
        return fail('E_TUNING', error.message, { profileName: input.profileName });
      }
    }
  },

  'tuning.profile.get': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.getSearchProfile(
          input.collectionId,
          input.profileId,
          input.server
        );
        return ok(ep.getProfile, input, result);
      } catch (error) {
        return fail('E_TUNING', error.message, { profileId: input.profileId });
      }
    }
  },

  'tuning.profile.list': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId'],
        properties: {
          collectionId: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.listSearchProfiles(
          input.collectionId,
          input.server
        );
        return ok(ep.listProfiles, input, result);
      } catch (error) {
        return fail('E_TUNING', error.message);
      }
    }
  },

  'tuning.profile.modify': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          config: { type: 'object' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.modifySearchProfile(
          input.collectionId,
          input.profileId,
          input.config || {},
          input.server
        );
        return ok(ep.modifyProfile, input, { success: result });
      } catch (error) {
        return fail('E_TUNING', error.message, { profileId: input.profileId });
      }
    }
  },

  'tuning.profile.delete': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.deleteSearchProfile(
          input.collectionId,
          input.profileId,
          input.server
        );
        return ok(ep.deleteProfile, input, { success: result });
      } catch (error) {
        return fail('E_TUNING', error.message, { profileId: input.profileId });
      }
    }
  },

  // ==================== QuerySet 관리 ====================

  'tuning.queryset.create': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'querySetName'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          querySetName: { type: 'string' },
          config: { type: 'object' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.createQuerySet(
          input.collectionId,
          input.profileId,
          input.querySetName,
          input.config || {},
          input.server
        );
        return ok(ep.createQuerySet, input, result);
      } catch (error) {
        return fail('E_TUNING', error.message, { querySetName: input.querySetName });
      }
    }
  },

  'tuning.queryset.get': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'querySetId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          querySetId: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.getQuerySet(
          input.collectionId,
          input.profileId,
          input.querySetId,
          input.server
        );
        return ok(ep.getQuerySet, input, result);
      } catch (error) {
        return fail('E_TUNING', error.message, { querySetId: input.querySetId });
      }
    }
  },

  'tuning.queryset.list': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.listQuerySets(
          input.collectionId,
          input.profileId,
          input.server
        );
        return ok(ep.listQuerySets, input, result);
      } catch (error) {
        return fail('E_TUNING', error.message);
      }
    }
  },

  'tuning.queryset.modify': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'querySetId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          querySetId: { type: 'string' },
          config: { type: 'object' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.modifyQuerySet(
          input.collectionId,
          input.profileId,
          input.querySetId,
          input.config || {},
          input.server
        );
        return ok(ep.modifyQuerySet, input, { success: result });
      } catch (error) {
        return fail('E_TUNING', error.message, { querySetId: input.querySetId });
      }
    }
  },

  'tuning.queryset.delete': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'querySetId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          querySetId: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.deleteQuerySet(
          input.collectionId,
          input.profileId,
          input.querySetId,
          input.server
        );
        return ok(ep.deleteQuerySet, input, { success: result });
      } catch (error) {
        return fail('E_TUNING', error.message, { querySetId: input.querySetId });
      }
    }
  },

  'tuning.queryset.copy': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'querySetId', 'newQuerySetName'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          querySetId: { type: 'string' },
          newQuerySetName: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.copyQuerySet(
          input.collectionId,
          input.profileId,
          input.querySetId,
          input.newQuerySetName,
          input.server
        );
        return ok(ep.copyQuerySet, input, result);
      } catch (error) {
        return fail('E_TUNING', error.message);
      }
    }
  },

  // ==================== 랭킹 모델 ====================

  'tuning.ranking.model.set': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'querySetId', 'modelName'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          querySetId: { type: 'string' },
          modelName: { type: 'string' },
          config: { type: 'object' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.setRankingModel(
          input.collectionId,
          input.profileId,
          input.querySetId,
          input.modelName,
          input.config || {},
          input.server
        );
        return ok(ep.setRankingModel, input, { success: result });
      } catch (error) {
        return fail('E_TUNING', error.message, { modelName: input.modelName });
      }
    }
  },

  'tuning.ranking.model.get': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'querySetId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          querySetId: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.getRankingModel(
          input.collectionId,
          input.profileId,
          input.querySetId,
          input.server
        );
        return ok(ep.getRankingModel, input, result);
      } catch (error) {
        return fail('E_TUNING', error.message);
      }
    }
  },

  'tuning.ranking.weight.set': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'querySetId', 'fieldName', 'weight'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          querySetId: { type: 'string' },
          fieldName: { type: 'string' },
          weight: { type: 'number' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.setRankingWeight(
          input.collectionId,
          input.profileId,
          input.querySetId,
          input.fieldName,
          input.weight,
          input.server
        );
        return ok(ep.setRankingWeight, input, { success: result });
      } catch (error) {
        return fail('E_TUNING', error.message);
      }
    }
  },

  // ==================== 필터/정렬/그룹 설정 ====================

  'tuning.fields.filter.set': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'querySetId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          querySetId: { type: 'string' },
          fields: { type: 'array' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.setFilterFields(
          input.collectionId,
          input.profileId,
          input.querySetId,
          input.fields || [],
          input.server
        );
        return ok(ep.setFilterFields, input, { success: result });
      } catch (error) {
        return fail('E_TUNING', error.message);
      }
    }
  },

  'tuning.fields.sort.set': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'querySetId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          querySetId: { type: 'string' },
          fields: { type: 'array' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.setSortFields(
          input.collectionId,
          input.profileId,
          input.querySetId,
          input.fields || [],
          input.server
        );
        return ok(ep.setSortFields, input, { success: result });
      } catch (error) {
        return fail('E_TUNING', error.message);
      }
    }
  },

  'tuning.fields.groupby.set': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'querySetId', 'field'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          querySetId: { type: 'string' },
          field: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.setGroupByField(
          input.collectionId,
          input.profileId,
          input.querySetId,
          input.field,
          input.server
        );
        return ok(ep.setGroupByField, input, { success: result });
      } catch (error) {
        return fail('E_TUNING', error.message);
      }
    }
  },

  'tuning.fields.search.set': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionId', 'profileId', 'querySetId'],
        properties: {
          collectionId: { type: 'string' },
          profileId: { type: 'string' },
          querySetId: { type: 'string' },
          fields: { type: 'object' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.tuning.setSearchFields(
          input.collectionId,
          input.profileId,
          input.querySetId,
          input.fields || {},
          input.server
        );
        return ok(ep.setSearchFields, input, { success: result });
      } catch (error) {
        return fail('E_TUNING', error.message);
      }
    }
  }
};

export default tuning;
