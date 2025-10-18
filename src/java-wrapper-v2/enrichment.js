/**
 * java-wrapper-v2/enrichment.js - 데이터 보강 및 외부 연동 API (15+ 메서드) ⭐ v3.6 신규
 *
 * - DataEnrichment: 외부 데이터 결합 및 문서 보강
 * - JoinOperation: 다중 컬렉션 조인 및 병합
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject,
  javaClasses
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// ==================== Data Enrichment (7+ 메서드) ====================

export async function enrichDocuments(collectionName, enrichmentConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DataEnrichment']);
    const javaConfig = convertToJavaObject(enrichmentConfig);
    const result = await callJavaMethod(
      command,
      'enrichDocuments',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Enrichment] Error enriching documents:', error.message);
    throw error;
  }
}

export async function enrichWithExternalData(collectionName, dataSourceId, mappingConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DataEnrichment']);
    const javaMapping = convertToJavaObject(mappingConfig);
    const result = await callJavaMethod(
      command,
      'enrichWithExternalData',
      collectionName,
      dataSourceId,
      javaMapping
    );
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Enrichment] Error enriching with external data:', error.message);
    throw error;
  }
}

export async function addComputedFields(collectionName, computedFieldConfigs = [], instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DataEnrichment']);
    const javaConfigs = convertToJavaObject(computedFieldConfigs);
    const result = await callJavaMethod(
      command,
      'addComputedFields',
      collectionName,
      javaConfigs
    );
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Enrichment] Error adding computed fields:', error.message);
    throw error;
  }
}

export async function enrichWithGeoData(collectionName, geoConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DataEnrichment']);
    const javaConfig = convertToJavaObject(geoConfig);
    const result = await callJavaMethod(
      command,
      'enrichWithGeoData',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Enrichment] Error enriching with geo data:', error.message);
    throw error;
  }
}

export async function enrichWithNLPAnalysis(collectionName, nlpConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DataEnrichment']);
    const javaConfig = convertToJavaObject(nlpConfig);
    const result = await callJavaMethod(
      command,
      'enrichWithNLP',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Enrichment] Error enriching with NLP analysis:', error.message);
    throw error;
  }
}

export async function validateEnrichedData(collectionName, validationRules = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DataEnrichment']);
    const javaRules = convertToJavaObject(validationRules);
    const result = await callJavaMethod(
      command,
      'validateData',
      collectionName,
      javaRules
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Enrichment] Error validating enriched data:', error.message);
    throw error;
  }
}

export async function rollbackEnrichment(collectionName, enrichmentId = null, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DataEnrichment']);
    let result;
    if (enrichmentId) {
      result = await callJavaMethod(command, 'rollback', collectionName, enrichmentId);
    } else {
      result = await callJavaMethod(command, 'rollbackLatest', collectionName);
    }
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Enrichment] Error rolling back enrichment:', error.message);
    throw error;
  }
}

// ==================== Join Operations (8+ 메서드) ====================

export async function joinCollections(collection1, collection2, joinConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['JoinOperation']);
    const javaConfig = convertToJavaObject(joinConfig);
    const result = await callJavaMethod(
      command,
      'join',
      collection1,
      collection2,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Enrichment] Error joining collections:', error.message);
    throw error;
  }
}

export async function innerJoin(collection1, collection2, joinKey, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['JoinOperation']);
    const result = await callJavaMethod(
      command,
      'innerJoin',
      collection1,
      collection2,
      joinKey
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Enrichment] Error performing inner join:', error.message);
    throw error;
  }
}

export async function leftJoin(collection1, collection2, joinKey, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['JoinOperation']);
    const result = await callJavaMethod(
      command,
      'leftJoin',
      collection1,
      collection2,
      joinKey
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Enrichment] Error performing left join:', error.message);
    throw error;
  }
}

export async function rightJoin(collection1, collection2, joinKey, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['JoinOperation']);
    const result = await callJavaMethod(
      command,
      'rightJoin',
      collection1,
      collection2,
      joinKey
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Enrichment] Error performing right join:', error.message);
    throw error;
  }
}

export async function fullOuterJoin(collection1, collection2, joinKey, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['JoinOperation']);
    const result = await callJavaMethod(
      command,
      'fullOuterJoin',
      collection1,
      collection2,
      joinKey
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Enrichment] Error performing full outer join:', error.message);
    throw error;
  }
}

export async function crossJoin(collection1, collection2, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['JoinOperation']);
    const result = await callJavaMethod(
      command,
      'crossJoin',
      collection1,
      collection2
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Enrichment] Error performing cross join:', error.message);
    throw error;
  }
}

export async function mergeCollections(targetCollection, sourceCollections = [], mergeStrategy = 'upsert', instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['JoinOperation']);
    const javaSources = convertToJavaObject(sourceCollections);
    const result = await callJavaMethod(
      command,
      'merge',
      targetCollection,
      javaSources,
      mergeStrategy
    );
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Enrichment] Error merging collections:', error.message);
    throw error;
  }
}

export async function getJoinStatistics(collection1, collection2, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['JoinOperation']);
    const result = await callJavaMethod(
      command,
      'getStatistics',
      collection1,
      collection2
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Enrichment] Error getting join statistics:', error.message);
    throw error;
  }
}

export default {
  // Data Enrichment
  enrichDocuments,
  enrichWithExternalData,
  addComputedFields,
  enrichWithGeoData,
  enrichWithNLPAnalysis,
  validateEnrichedData,
  rollbackEnrichment,

  // Join Operations
  joinCollections,
  innerJoin,
  leftJoin,
  rightJoin,
  fullOuterJoin,
  crossJoin,
  mergeCollections,
  getJoinStatistics
};
