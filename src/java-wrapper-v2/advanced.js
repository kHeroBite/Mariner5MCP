/**
 * java-wrapper-v2/advanced.js - 고급 기능 API (40+ 메서드) ⭐ 신규
 *
 * - VectorSearch: 벡터 검색 설정
 * - Union: 다중 컬렉션 합집합
 * - Drama: 분산 컬렉션 관리
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject,
  javaClasses
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// ==================== Vector Search (15+ 메서드) ====================

export async function createVectorSearchConfig(collectionName, config = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['VectorSearchConfig']);
    const javaConfig = convertToJavaObject(config);
    const result = await callJavaMethod(command, 'create', collectionName, javaConfig);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Advanced] Error creating vector search config:', error.message);
    throw error;
  }
}

export async function getVectorSearchConfig(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['VectorSearchConfig']);
    const result = await callJavaMethod(command, 'get', collectionName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Advanced] Error getting vector search config:', error.message);
    throw error;
  }
}

export async function setVectorSearchModel(collectionName, modelName, modelPath = null, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['VectorSearchConfig']);
    let result;
    if (modelPath) {
      result = await callJavaMethod(command, 'setModel', collectionName, modelName, modelPath);
    } else {
      result = await callJavaMethod(command, 'setModel', collectionName, modelName);
    }
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Advanced] Error setting vector search model:', error.message);
    throw error;
  }
}

export async function setVectorSearchDimension(collectionName, dimension, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['VectorSearchConfig']);
    const result = await callJavaMethod(command, 'setDimension', collectionName, dimension);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Advanced] Error setting vector search dimension:', error.message);
    throw error;
  }
}

export async function setVectorSearchFields(collectionName, fieldNames = [], instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['VectorSearchConfig']);
    const javaFields = convertToJavaObject(fieldNames);
    const result = await callJavaMethod(command, 'setFields', collectionName, javaFields);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Advanced] Error setting vector search fields:', error.message);
    throw error;
  }
}

export async function buildVectorIndex(collectionName, indexType = 'hnsw', instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['VectorSearchConfig']);
    const result = await callJavaMethod(command, 'buildIndex', collectionName, indexType);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Advanced] Error building vector index:', error.message);
    throw error;
  }
}

export async function vectorSearch(collectionName, vectorQuery, topK = 10, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['VectorSearchConfig']);
    const javaQuery = convertToJavaObject(vectorQuery);
    const result = await callJavaMethod(command, 'search', collectionName, javaQuery, topK);
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Advanced] Error performing vector search:', error.message);
    throw error;
  }
}

export async function deleteVectorSearchConfig(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['VectorSearchConfig']);
    const result = await callJavaMethod(command, 'delete', collectionName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Advanced] Error deleting vector search config:', error.message);
    throw error;
  }
}

// ==================== Union (다중 컬렉션 합집합) (10+ 메서드) ====================

export async function createUnion(unionName, collectionNames = [], config = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Union']);
    const javaCollections = convertToJavaObject(collectionNames);
    const javaConfig = convertToJavaObject(config);
    const result = await callJavaMethod(command, 'create', unionName, javaCollections, javaConfig);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Advanced] Error creating union:', error.message);
    throw error;
  }
}

export async function getUnion(unionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Union']);
    const result = await callJavaMethod(command, 'get', unionName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Advanced] Error getting union:', error.message);
    throw error;
  }
}

export async function listUnions(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Union']);
    const result = await callJavaMethod(command, 'list');
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Advanced] Error listing unions:', error.message);
    throw error;
  }
}

export async function addCollectionToUnion(unionName, collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Union']);
    const result = await callJavaMethod(command, 'addCollection', unionName, collectionName);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Advanced] Error adding collection to union:', error.message);
    throw error;
  }
}

export async function removeCollectionFromUnion(unionName, collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Union']);
    const result = await callJavaMethod(command, 'removeCollection', unionName, collectionName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Advanced] Error removing collection from union:', error.message);
    throw error;
  }
}

export async function executeUnionSearch(unionName, querySet, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Union']);
    const javaQuerySet = convertToJavaObject(querySet);
    const result = await callJavaMethod(command, 'search', unionName, javaQuerySet);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Advanced] Error executing union search:', error.message);
    throw error;
  }
}

export async function deleteUnion(unionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Union']);
    const result = await callJavaMethod(command, 'delete', unionName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Advanced] Error deleting union:', error.message);
    throw error;
  }
}

// ==================== Drama (분산 컬렉션) (15+ 메서드) ====================

export async function createDrama(dramaName, config = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Drama']);
    const javaConfig = convertToJavaObject(config);
    const result = await callJavaMethod(command, 'create', dramaName, javaConfig);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Advanced] Error creating drama:', error.message);
    throw error;
  }
}

export async function getDrama(dramaName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Drama']);
    const result = await callJavaMethod(command, 'get', dramaName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Advanced] Error getting drama:', error.message);
    throw error;
  }
}

export async function listDramas(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Drama']);
    const result = await callJavaMethod(command, 'list');
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Advanced] Error listing dramas:', error.message);
    throw error;
  }
}

export async function addNodeToDrama(dramaName, nodeId, nodeConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Drama']);
    const javaConfig = convertToJavaObject(nodeConfig);
    const result = await callJavaMethod(command, 'addNode', dramaName, nodeId, javaConfig);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Advanced] Error adding node to drama:', error.message);
    throw error;
  }
}

export async function removeNodeFromDrama(dramaName, nodeId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Drama']);
    const result = await callJavaMethod(command, 'removeNode', dramaName, nodeId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Advanced] Error removing node from drama:', error.message);
    throw error;
  }
}

export async function setDramaReplication(dramaName, replicationFactor, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Drama']);
    const result = await callJavaMethod(command, 'setReplication', dramaName, replicationFactor);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Advanced] Error setting drama replication:', error.message);
    throw error;
  }
}

export async function getDramaNodeStatus(dramaName, nodeId = null, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Drama']);
    let result;
    if (nodeId) {
      result = await callJavaMethod(command, 'getNodeStatus', dramaName, nodeId);
    } else {
      result = await callJavaMethod(command, 'getAllNodeStatus', dramaName);
    }
    releaseAdminClient(instanceId);
    if (Array.isArray(result)) {
      return await javaListToArray(result);
    }
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Advanced] Error getting drama node status:', error.message);
    throw error;
  }
}

export async function balanceDrama(dramaName, strategy = 'auto', instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Drama']);
    const result = await callJavaMethod(command, 'balance', dramaName, strategy);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Advanced] Error balancing drama:', error.message);
    throw error;
  }
}

export async function executeDramaSearch(dramaName, querySet, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Drama']);
    const javaQuerySet = convertToJavaObject(querySet);
    const result = await callJavaMethod(command, 'search', dramaName, javaQuerySet);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Advanced] Error executing drama search:', error.message);
    throw error;
  }
}

export async function deleteDrama(dramaName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Drama']);
    const result = await callJavaMethod(command, 'delete', dramaName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Advanced] Error deleting drama:', error.message);
    throw error;
  }
}

export default {
  // Vector Search
  createVectorSearchConfig,
  getVectorSearchConfig,
  setVectorSearchModel,
  setVectorSearchDimension,
  setVectorSearchFields,
  buildVectorIndex,
  vectorSearch,
  deleteVectorSearchConfig,

  // Union
  createUnion,
  getUnion,
  listUnions,
  addCollectionToUnion,
  removeCollectionFromUnion,
  executeUnionSearch,
  deleteUnion,

  // Drama
  createDrama,
  getDrama,
  listDramas,
  addNodeToDrama,
  removeNodeFromDrama,
  setDramaReplication,
  getDramaNodeStatus,
  balanceDrama,
  executeDramaSearch,
  deleteDrama
};
