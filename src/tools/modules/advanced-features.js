/**
 * advanced-features.js - 고급 기능 MCP 도구 (40+ 도구) ⭐ 신규
 *
 * - VectorSearch: 벡터 검색 설정 (8개 도구)
 * - Union: 다중 컬렉션 합집합 (7개 도구)
 * - Drama: 분산 컬렉션 관리 (10개 도구)
 */

import { makeValidator, ok, fail } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper-v2/index.js';

// ==================== 엔드포인트 ====================
const ep = {
  // Vector Search
  vectorSearchConfig: '/advanced/vector/config',
  vectorSearchModel: '/advanced/vector/model',
  vectorSearchDimension: '/advanced/vector/dimension',
  vectorSearchFields: '/advanced/vector/fields',
  vectorIndex: '/advanced/vector/index',
  vectorSearch: '/advanced/vector/search',

  // Union
  union: '/advanced/union',
  unionCollection: '/advanced/union/collection',
  unionSearch: '/advanced/union/search',

  // Drama
  drama: '/advanced/drama',
  dramaNode: '/advanced/drama/node',
  dramaReplication: '/advanced/drama/replication',
  dramaBalance: '/advanced/drama/balance',
  dramaSearch: '/advanced/drama/search'
};

export const advancedFeatures = {
  // ==================== Vector Search Configuration (8개 도구) ====================

  'advanced.vector.create': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          config: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.createVectorSearchConfig(
          input.collectionName,
          input.config || {},
          input.instanceId
        );
        return ok(ep.vectorSearchConfig, input, result);
      } catch (error) {
        return fail('E_VECTOR_SEARCH', error.message);
      }
    }
  },

  'advanced.vector.get': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.getVectorSearchConfig(
          input.collectionName,
          input.instanceId
        );
        return ok(ep.vectorSearchConfig, input, result);
      } catch (error) {
        return fail('E_VECTOR_SEARCH', error.message);
      }
    }
  },

  'advanced.vector.setModel': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'modelName'],
        properties: {
          collectionName: { type: 'string' },
          modelName: { type: 'string' },
          modelPath: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.setVectorSearchModel(
          input.collectionName,
          input.modelName,
          input.modelPath || null,
          input.instanceId
        );
        return ok(ep.vectorSearchModel, input, result);
      } catch (error) {
        return fail('E_VECTOR_SEARCH', error.message);
      }
    }
  },

  'advanced.vector.setDimension': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'dimension'],
        properties: {
          collectionName: { type: 'string' },
          dimension: { type: 'integer', minimum: 1 },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.setVectorSearchDimension(
          input.collectionName,
          input.dimension,
          input.instanceId
        );
        return ok(ep.vectorSearchDimension, input, result);
      } catch (error) {
        return fail('E_VECTOR_SEARCH', error.message);
      }
    }
  },

  'advanced.vector.setFields': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          fieldNames: {
            type: 'array',
            items: { type: 'string' }
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.setVectorSearchFields(
          input.collectionName,
          input.fieldNames || [],
          input.instanceId
        );
        return ok(ep.vectorSearchFields, input, result);
      } catch (error) {
        return fail('E_VECTOR_SEARCH', error.message);
      }
    }
  },

  'advanced.vector.buildIndex': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          indexType: {
            type: 'string',
            enum: ['hnsw', 'flat', 'ivf'],
            default: 'hnsw'
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.buildVectorIndex(
          input.collectionName,
          input.indexType || 'hnsw',
          input.instanceId
        );
        return ok(ep.vectorIndex, input, { success: result });
      } catch (error) {
        return fail('E_VECTOR_SEARCH', error.message);
      }
    }
  },

  'advanced.vector.search': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName', 'vectorQuery'],
        properties: {
          collectionName: { type: 'string' },
          vectorQuery: { type: 'object' },
          topK: { type: 'integer', minimum: 1, default: 10 },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.vectorSearch(
          input.collectionName,
          input.vectorQuery,
          input.topK || 10,
          input.instanceId
        );
        return ok(ep.vectorSearch, input, { results: result });
      } catch (error) {
        return fail('E_VECTOR_SEARCH', error.message);
      }
    }
  },

  'advanced.vector.delete': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.deleteVectorSearchConfig(
          input.collectionName,
          input.instanceId
        );
        return ok(ep.vectorSearchConfig, input, { success: result });
      } catch (error) {
        return fail('E_VECTOR_SEARCH', error.message);
      }
    }
  },

  // ==================== Union - 다중 컬렉션 합집합 (7개 도구) ====================

  'advanced.union.create': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['unionName', 'collectionNames'],
        properties: {
          unionName: { type: 'string' },
          collectionNames: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          },
          config: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.createUnion(
          input.unionName,
          input.collectionNames,
          input.config || {},
          input.instanceId
        );
        return ok(ep.union, input, result);
      } catch (error) {
        return fail('E_UNION', error.message);
      }
    }
  },

  'advanced.union.get': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['unionName'],
        properties: {
          unionName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.getUnion(
          input.unionName,
          input.instanceId
        );
        return ok(ep.union, input, result);
      } catch (error) {
        return fail('E_UNION', error.message);
      }
    }
  },

  'advanced.union.list': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.listUnions(input.instanceId);
        return ok(ep.union, input, { unions: result });
      } catch (error) {
        return fail('E_UNION', error.message);
      }
    }
  },

  'advanced.union.addCollection': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['unionName', 'collectionName'],
        properties: {
          unionName: { type: 'string' },
          collectionName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.addCollectionToUnion(
          input.unionName,
          input.collectionName,
          input.instanceId
        );
        return ok(ep.unionCollection, input, result);
      } catch (error) {
        return fail('E_UNION', error.message);
      }
    }
  },

  'advanced.union.removeCollection': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['unionName', 'collectionName'],
        properties: {
          unionName: { type: 'string' },
          collectionName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.removeCollectionFromUnion(
          input.unionName,
          input.collectionName,
          input.instanceId
        );
        return ok(ep.unionCollection, input, { success: result });
      } catch (error) {
        return fail('E_UNION', error.message);
      }
    }
  },

  'advanced.union.search': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['unionName', 'querySet'],
        properties: {
          unionName: { type: 'string' },
          querySet: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.executeUnionSearch(
          input.unionName,
          input.querySet,
          input.instanceId
        );
        return ok(ep.unionSearch, input, result);
      } catch (error) {
        return fail('E_UNION', error.message);
      }
    }
  },

  'advanced.union.delete': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['unionName'],
        properties: {
          unionName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.deleteUnion(
          input.unionName,
          input.instanceId
        );
        return ok(ep.union, input, { success: result });
      } catch (error) {
        return fail('E_UNION', error.message);
      }
    }
  },

  // ==================== Drama - 분산 컬렉션 (10개 도구) ====================

  'advanced.drama.create': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['dramaName'],
        properties: {
          dramaName: { type: 'string' },
          config: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.createDrama(
          input.dramaName,
          input.config || {},
          input.instanceId
        );
        return ok(ep.drama, input, result);
      } catch (error) {
        return fail('E_DRAMA', error.message);
      }
    }
  },

  'advanced.drama.get': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['dramaName'],
        properties: {
          dramaName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.getDrama(
          input.dramaName,
          input.instanceId
        );
        return ok(ep.drama, input, result);
      } catch (error) {
        return fail('E_DRAMA', error.message);
      }
    }
  },

  'advanced.drama.list': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.listDramas(input.instanceId);
        return ok(ep.drama, input, { dramas: result });
      } catch (error) {
        return fail('E_DRAMA', error.message);
      }
    }
  },

  'advanced.drama.addNode': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['dramaName', 'nodeId'],
        properties: {
          dramaName: { type: 'string' },
          nodeId: { type: 'string' },
          nodeConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.addNodeToDrama(
          input.dramaName,
          input.nodeId,
          input.nodeConfig || {},
          input.instanceId
        );
        return ok(ep.dramaNode, input, result);
      } catch (error) {
        return fail('E_DRAMA', error.message);
      }
    }
  },

  'advanced.drama.removeNode': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['dramaName', 'nodeId'],
        properties: {
          dramaName: { type: 'string' },
          nodeId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.removeNodeFromDrama(
          input.dramaName,
          input.nodeId,
          input.instanceId
        );
        return ok(ep.dramaNode, input, { success: result });
      } catch (error) {
        return fail('E_DRAMA', error.message);
      }
    }
  },

  'advanced.drama.setReplication': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['dramaName', 'replicationFactor'],
        properties: {
          dramaName: { type: 'string' },
          replicationFactor: { type: 'integer', minimum: 1 },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.setDramaReplication(
          input.dramaName,
          input.replicationFactor,
          input.instanceId
        );
        return ok(ep.dramaReplication, input, result);
      } catch (error) {
        return fail('E_DRAMA', error.message);
      }
    }
  },

  'advanced.drama.getNodeStatus': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['dramaName'],
        properties: {
          dramaName: { type: 'string' },
          nodeId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.getDramaNodeStatus(
          input.dramaName,
          input.nodeId || null,
          input.instanceId
        );
        return ok(ep.dramaNode, input, result);
      } catch (error) {
        return fail('E_DRAMA', error.message);
      }
    }
  },

  'advanced.drama.balance': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['dramaName'],
        properties: {
          dramaName: { type: 'string' },
          strategy: {
            type: 'string',
            enum: ['auto', 'uniform', 'weighted'],
            default: 'auto'
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.balanceDrama(
          input.dramaName,
          input.strategy || 'auto',
          input.instanceId
        );
        return ok(ep.dramaBalance, input, { success: result });
      } catch (error) {
        return fail('E_DRAMA', error.message);
      }
    }
  },

  'advanced.drama.search': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['dramaName', 'querySet'],
        properties: {
          dramaName: { type: 'string' },
          querySet: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.executeDramaSearch(
          input.dramaName,
          input.querySet,
          input.instanceId
        );
        return ok(ep.dramaSearch, input, result);
      } catch (error) {
        return fail('E_DRAMA', error.message);
      }
    }
  },

  'advanced.drama.delete': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['dramaName'],
        properties: {
          dramaName: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.advanced.deleteDrama(
          input.dramaName,
          input.instanceId
        );
        return ok(ep.drama, input, { success: result });
      } catch (error) {
        return fail('E_DRAMA', error.message);
      }
    }
  }
};

export default advancedFeatures;
