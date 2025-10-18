/**
 * enrichment-tools.js - 데이터 보강 MCP 도구 (15개 도구) ⭐ v3.6 신규
 *
 * - DataEnrichment: 문서 보강 및 외부 연동 (7개)
 * - JoinOperation: 컬렉션 조인 및 병합 (8개)
 */

import { makeValidator, ok, fail } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper-v2/index.js';

const ep = {
  // Data Enrichment
  enrichment: '/enrichment/enrich',
  externalData: '/enrichment/external',
  computedFields: '/enrichment/computed-fields',
  geoData: '/enrichment/geo',
  nlpData: '/enrichment/nlp',
  validation: '/enrichment/validation',

  // Join Operations
  join: '/enrichment/join',
  innerJoin: '/enrichment/join/inner',
  leftJoin: '/enrichment/join/left',
  rightJoin: '/enrichment/join/right',
  fullJoin: '/enrichment/join/full',
  crossJoin: '/enrichment/join/cross',
  merge: '/enrichment/merge',
  joinStats: '/enrichment/join/stats'
};

export const enrichment = {
  // ==================== Data Enrichment (7개) ====================

  'enrichment.documents': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          enrichmentConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.enrichDocuments(
          input.collectionName,
          input.enrichmentConfig || {},
          input.instanceId
        );
        return ok(ep.enrichment, input, result);
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  },

  'enrichment.external': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dataSourceId'],
        properties: {
          collectionName: { type: 'string' },
          dataSourceId: { type: 'string' },
          mappingConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.enrichWithExternalData(
          input.collectionName,
          input.dataSourceId,
          input.mappingConfig || {},
          input.instanceId
        );
        return ok(ep.externalData, input, { success: result });
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  },

  'enrichment.computedFields': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          computedFieldConfigs: {
            type: 'array',
            items: { type: 'object' }
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.addComputedFields(
          input.collectionName,
          input.computedFieldConfigs || [],
          input.instanceId
        );
        return ok(ep.computedFields, input, { fields: result });
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  },

  'enrichment.geo': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          geoConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.enrichWithGeoData(
          input.collectionName,
          input.geoConfig || {},
          input.instanceId
        );
        return ok(ep.geoData, input, { success: result });
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  },

  'enrichment.nlp': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          nlpConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.enrichWithNLPAnalysis(
          input.collectionName,
          input.nlpConfig || {},
          input.instanceId
        );
        return ok(ep.nlpData, input, result);
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  },

  'enrichment.validate': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          validationRules: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.validateEnrichedData(
          input.collectionName,
          input.validationRules || {},
          input.instanceId
        );
        return ok(ep.validation, input, result);
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  },

  'enrichment.rollback': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          enrichmentId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.rollbackEnrichment(
          input.collectionName,
          input.enrichmentId || null,
          input.instanceId
        );
        return ok(ep.enrichment, input, { success: result });
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  },

  // ==================== Join Operations (8개) ====================

  'enrichment.join': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection1', 'collection2'],
        properties: {
          collection1: { type: 'string' },
          collection2: { type: 'string' },
          joinConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.joinCollections(
          input.collection1,
          input.collection2,
          input.joinConfig || {},
          input.instanceId
        );
        return ok(ep.join, input, result);
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  },

  'enrichment.innerJoin': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection1', 'collection2', 'joinKey'],
        properties: {
          collection1: { type: 'string' },
          collection2: { type: 'string' },
          joinKey: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.innerJoin(
          input.collection1,
          input.collection2,
          input.joinKey,
          input.instanceId
        );
        return ok(ep.innerJoin, input, result);
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  },

  'enrichment.leftJoin': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection1', 'collection2', 'joinKey'],
        properties: {
          collection1: { type: 'string' },
          collection2: { type: 'string' },
          joinKey: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.leftJoin(
          input.collection1,
          input.collection2,
          input.joinKey,
          input.instanceId
        );
        return ok(ep.leftJoin, input, result);
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  },

  'enrichment.rightJoin': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection1', 'collection2', 'joinKey'],
        properties: {
          collection1: { type: 'string' },
          collection2: { type: 'string' },
          joinKey: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.rightJoin(
          input.collection1,
          input.collection2,
          input.joinKey,
          input.instanceId
        );
        return ok(ep.rightJoin, input, result);
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  },

  'enrichment.fullOuterJoin': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection1', 'collection2', 'joinKey'],
        properties: {
          collection1: { type: 'string' },
          collection2: { type: 'string' },
          joinKey: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.fullOuterJoin(
          input.collection1,
          input.collection2,
          input.joinKey,
          input.instanceId
        );
        return ok(ep.fullJoin, input, result);
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  },

  'enrichment.crossJoin': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection1', 'collection2'],
        properties: {
          collection1: { type: 'string' },
          collection2: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.crossJoin(
          input.collection1,
          input.collection2,
          input.instanceId
        );
        return ok(ep.crossJoin, input, result);
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  },

  'enrichment.merge': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['targetCollection'],
        properties: {
          targetCollection: { type: 'string' },
          sourceCollections: {
            type: 'array',
            items: { type: 'string' }
          },
          mergeStrategy: {
            type: 'string',
            enum: ['upsert', 'append', 'replace', 'merge'],
            default: 'upsert'
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.mergeCollections(
          input.targetCollection,
          input.sourceCollections || [],
          input.mergeStrategy || 'upsert',
          input.instanceId
        );
        return ok(ep.merge, input, { success: result });
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  },

  'enrichment.joinStatistics': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collection1', 'collection2'],
        properties: {
          collection1: { type: 'string' },
          collection2: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.enrichment.getJoinStatistics(
          input.collection1,
          input.collection2,
          input.instanceId
        );
        return ok(ep.joinStats, input, result);
      } catch (error) {
        return fail('E_ENRICHMENT', error.message);
      }
    }
  }
};

export default enrichment;
