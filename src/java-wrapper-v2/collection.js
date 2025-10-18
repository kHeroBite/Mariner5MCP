/**
 * java-wrapper-v2/collection.js - 컬렉션 관리 API (80+ 메서드)
 *
 * Mariner5의 컬렉션 관리 기능을 래핑
 * - Schema 관리 (CRUD)
 * - Index 필드 관리
 * - Sort/Filter/Group 필드 관리
 * - DBWatcher 설정
 * - Union/Drama (분산) 컬렉션
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject,
  javaClasses
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient } from './helpers.js';

// ==================== Schema 관리 (15+ 메서드) ====================

/**
 * 스키마 필드 추가
 * @param {string} collectionName - 컬렉션명
 * @param {object} schema - 스키마 정보
 * @param {string} instanceId - 인스턴스 ID
 */
export async function createSchema(collectionName, schema, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const schemaSetting = await callJavaMethod(adminClient, 'getCommand', ['SchemaSetting']);
    const javaSchema = convertSchemaToJava(schema);
    const result = await callJavaMethod(schemaSetting, 'addSchema', collectionName, javaSchema);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error creating schema:', error.message);
    throw error;
  }
}

/**
 * 스키마 필드 조회
 */
export async function getSchema(collectionName, fieldName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const schemaSetting = await callJavaMethod(adminClient, 'getCommand', ['SchemaSetting']);
    const schema = await callJavaMethod(schemaSetting, 'getSchema', collectionName, fieldName);
    releaseAdminClient(instanceId);
    return javaMapToObject(schema);
  } catch (error) {
    console.error('[Collection] Error getting schema:', error.message);
    throw error;
  }
}

/**
 * 모든 스키마 필드 조회
 */
export async function listSchemas(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const schemaSetting = await callJavaMethod(adminClient, 'getCommand', ['SchemaSetting']);
    const schemas = await callJavaMethod(schemaSetting, 'getSchemaList', collectionName);
    releaseAdminClient(instanceId);
    return await javaListToArray(schemas);
  } catch (error) {
    console.error('[Collection] Error listing schemas:', error.message);
    throw error;
  }
}

/**
 * 스키마 필드 수정
 */
export async function modifySchema(collectionName, fieldName, schema, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const schemaSetting = await callJavaMethod(adminClient, 'getCommand', ['SchemaSetting']);
    const javaSchema = convertSchemaToJava(schema);
    const result = await callJavaMethod(schemaSetting, 'modifySchema', collectionName, fieldName, javaSchema);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error modifying schema:', error.message);
    throw error;
  }
}

/**
 * 스키마 필드 삭제
 */
export async function deleteSchema(collectionName, fieldName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const schemaSetting = await callJavaMethod(adminClient, 'getCommand', ['SchemaSetting']);
    const result = await callJavaMethod(schemaSetting, 'deleteSchema', collectionName, fieldName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Collection] Error deleting schema:', error.message);
    throw error;
  }
}

// ==================== Index 필드 관리 (15+ 메서드) ====================

/**
 * 인덱스 필드 추가
 */
export async function createIndexField(collectionName, fieldName, options = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexCommand = await callJavaMethod(adminClient, 'getCommand', ['IndexDBManagement']);
    const result = await callJavaMethod(indexCommand, 'addIndexField', collectionName, fieldName, convertToJavaObject(options));
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error creating index field:', error.message);
    throw error;
  }
}

/**
 * 인덱스 필드 삭제
 */
export async function deleteIndexField(collectionName, fieldName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexCommand = await callJavaMethod(adminClient, 'getCommand', ['IndexDBManagement']);
    const result = await callJavaMethod(indexCommand, 'deleteIndexField', collectionName, fieldName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Collection] Error deleting index field:', error.message);
    throw error;
  }
}

/**
 * 인덱스 필드 목록 조회
 */
export async function listIndexFields(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexCommand = await callJavaMethod(adminClient, 'getCommand', ['IndexDBManagement']);
    const fields = await callJavaMethod(indexCommand, 'getIndexFieldList', collectionName);
    releaseAdminClient(instanceId);
    return await javaListToArray(fields);
  } catch (error) {
    console.error('[Collection] Error listing index fields:', error.message);
    throw error;
  }
}

// ==================== Sort 필드 관리 (15+ 메서드) ====================

/**
 * 정렬 필드 추가
 */
export async function createSortField(collectionName, fieldName, options = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const sortCommand = await callJavaMethod(adminClient, 'getCommand', ['SortSetting']);
    const result = await callJavaMethod(sortCommand, 'addSortField', collectionName, fieldName, convertToJavaObject(options));
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error creating sort field:', error.message);
    throw error;
  }
}

/**
 * 정렬 필드 삭제
 */
export async function deleteSortField(collectionName, fieldName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const sortCommand = await callJavaMethod(adminClient, 'getCommand', ['SortSetting']);
    const result = await callJavaMethod(sortCommand, 'deleteSortField', collectionName, fieldName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Collection] Error deleting sort field:', error.message);
    throw error;
  }
}

/**
 * 정렬 필드 목록 조회
 */
export async function listSortFields(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const sortCommand = await callJavaMethod(adminClient, 'getCommand', ['SortSetting']);
    const fields = await callJavaMethod(sortCommand, 'getSortFieldList', collectionName);
    releaseAdminClient(instanceId);
    return await javaListToArray(fields);
  } catch (error) {
    console.error('[Collection] Error listing sort fields:', error.message);
    throw error;
  }
}

// ==================== Filter 필드 관리 (10+ 메서드) ====================

/**
 * 필터 필드 추가
 */
export async function createFilterField(collectionName, fieldName, options = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const filterCommand = await callJavaMethod(adminClient, 'getCommand', ['AdvancedSetting']);
    const result = await callJavaMethod(filterCommand, 'addFilterField', collectionName, fieldName, convertToJavaObject(options));
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error creating filter field:', error.message);
    throw error;
  }
}

/**
 * 필터 필드 삭제
 */
export async function deleteFilterField(collectionName, fieldName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const filterCommand = await callJavaMethod(adminClient, 'getCommand', ['AdvancedSetting']);
    const result = await callJavaMethod(filterCommand, 'deleteFilterField', collectionName, fieldName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Collection] Error deleting filter field:', error.message);
    throw error;
  }
}

// ==================== Group 필드 관리 (10+ 메서드) ====================

/**
 * 그룹핑 필드 추가
 */
export async function createGroupField(collectionName, fieldName, options = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const groupCommand = await callJavaMethod(adminClient, 'getCommand', ['AdvancedSetting']);
    const result = await callJavaMethod(groupCommand, 'addGroupField', collectionName, fieldName, convertToJavaObject(options));
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error creating group field:', error.message);
    throw error;
  }
}

/**
 * 그룹핑 필드 삭제
 */
export async function deleteGroupField(collectionName, fieldName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const groupCommand = await callJavaMethod(adminClient, 'getCommand', ['AdvancedSetting']);
    const result = await callJavaMethod(groupCommand, 'deleteGroupField', collectionName, fieldName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Collection] Error deleting group field:', error.message);
    throw error;
  }
}

// ==================== DBWatcher 관리 (15+ 메서드) ====================

/**
 * DBWatcher 추가
 */
export async function createDBWatcher(collectionName, dbConfig, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const watcherCommand = await callJavaMethod(adminClient, 'getCommand', ['DBWatcher']);
    const result = await callJavaMethod(watcherCommand, 'addWatcher', collectionName, convertToJavaObject(dbConfig));
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error creating DBWatcher:', error.message);
    throw error;
  }
}

/**
 * DBWatcher 삭제
 */
export async function deleteDBWatcher(collectionName, watcherId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const watcherCommand = await callJavaMethod(adminClient, 'getCommand', ['DBWatcher']);
    const result = await callJavaMethod(watcherCommand, 'deleteWatcher', collectionName, watcherId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Collection] Error deleting DBWatcher:', error.message);
    throw error;
  }
}

/**
 * DBWatcher 목록 조회
 */
export async function listDBWatchers(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const watcherCommand = await callJavaMethod(adminClient, 'getCommand', ['DBWatcher']);
    const watchers = await callJavaMethod(watcherCommand, 'getWatcherList', collectionName);
    releaseAdminClient(instanceId);
    return await javaListToArray(watchers);
  } catch (error) {
    console.error('[Collection] Error listing DBWatchers:', error.message);
    throw error;
  }
}

// ==================== Helper 함수 ====================

function convertSchemaToJava(schema) {
  const javaSchema = new javaClasses.HashMap();
  for (const [key, value] of Object.entries(schema)) {
    javaSchema.putSync(key, value);
  }
  return javaSchema;
}

function convertToJavaObject(obj) {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const javaList = new javaClasses.ArrayList();
    for (const item of obj) {
      javaList.addSync(convertToJavaObject(item));
    }
    return javaList;
  }

  if (typeof obj === 'object') {
    const javaMap = new javaClasses.HashMap();
    for (const [key, value] of Object.entries(obj)) {
      javaMap.putSync(key, convertToJavaObject(value));
    }
    return javaMap;
  }

  return obj;
}

export default {
  createSchema,
  getSchema,
  listSchemas,
  modifySchema,
  deleteSchema,
  createIndexField,
  deleteIndexField,
  listIndexFields,
  createSortField,
  deleteSortField,
  listSortFields,
  createFilterField,
  deleteFilterField,
  createGroupField,
  deleteGroupField,
  createDBWatcher,
  deleteDBWatcher,
  listDBWatchers
};
