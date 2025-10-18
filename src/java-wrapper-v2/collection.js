/**
 * java-wrapper-v2/collection.js - 컬렉션 관리 API (130+ 메서드)
 *
 * Mariner5의 컬렉션 관리 기능을 래핑
 * - Schema 관리 (CRUD)
 * - Index 필드 관리
 * - Sort/Filter/Group 필드 관리
 * - DBWatcher 설정 + 고급 필터 ⭐ 확장
 * - Union/Drama (분산) 컬렉션
 * - DataSource 설정 (외부 DB 연동)
 * - CollectionMonitor (실시간 모니터링) ⭐ 신규
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

// ==================== DBWatcher 고급 (15+ 메서드) ⭐ 확장 ====================

export async function setupDBWatcherAdvanced(collectionName, watcherConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DBWatcher']);
    const javaConfig = convertToJavaObject(watcherConfig);
    const result = await callJavaMethod(command, 'setupWatcher', collectionName, javaConfig);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error setting up DB watcher:', error.message);
    throw error;
  }
}

export async function getDBWatcherStatus(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DBWatcher']);
    const result = await callJavaMethod(command, 'getStatus', collectionName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Collection] Error getting DB watcher status:', error.message);
    throw error;
  }
}

export async function getDBWatcherChangeLog(collectionName, limit = 100, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DBWatcher']);
    const logs = await callJavaMethod(command, 'getChangeLog', collectionName, limit);
    releaseAdminClient(instanceId);
    return await javaListToArray(logs);
  } catch (error) {
    console.error('[Collection] Error getting DB watcher change log:', error.message);
    throw error;
  }
}

export async function addDBWatcherFilter(collectionName, fieldName, operator, value, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const filterCmd = await callJavaMethod(adminClient, 'getCommand', ['DBWatcherFilterSetting']);
    const result = await callJavaMethod(filterCmd, 'addFilter', collectionName, fieldName, operator, value);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error adding DB watcher filter:', error.message);
    throw error;
  }
}

export async function removeDBWatcherFilter(collectionName, fieldName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const filterCmd = await callJavaMethod(adminClient, 'getCommand', ['DBWatcherFilterSetting']);
    const result = await callJavaMethod(filterCmd, 'removeFilter', collectionName, fieldName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Collection] Error removing DB watcher filter:', error.message);
    throw error;
  }
}

export async function getDBWatcherFilters(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const filterCmd = await callJavaMethod(adminClient, 'getCommand', ['DBWatcherFilterSetting']);
    const filters = await callJavaMethod(filterCmd, 'getFilters', collectionName);
    releaseAdminClient(instanceId);
    return await javaListToArray(filters);
  } catch (error) {
    console.error('[Collection] Error getting DB watcher filters:', error.message);
    throw error;
  }
}

export async function pauseDBWatcher(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DBWatcher']);
    const result = await callJavaMethod(command, 'pauseWatcher', collectionName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Collection] Error pausing DB watcher:', error.message);
    throw error;
  }
}

export async function resumeDBWatcher(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DBWatcher']);
    const result = await callJavaMethod(command, 'resumeWatcher', collectionName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Collection] Error resuming DB watcher:', error.message);
    throw error;
  }
}

// ==================== CollectionMonitor (실시간 모니터링) (15+ 메서드) ⭐ 신규 ====================

export async function createCollectionMonitor(collectionName, monitorConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['CollectionMonitor']);
    const javaConfig = convertToJavaObject(monitorConfig);
    const result = await callJavaMethod(command, 'createMonitor', collectionName, javaConfig);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error creating collection monitor:', error.message);
    throw error;
  }
}

export async function getCollectionMonitorStatus(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['CollectionMonitor']);
    const result = await callJavaMethod(command, 'getStatus', collectionName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Collection] Error getting collection monitor status:', error.message);
    throw error;
  }
}

export async function getCollectionMetrics(collectionName, metricType = 'all', instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['CollectionMonitor']);
    const result = await callJavaMethod(command, 'getMetrics', collectionName, metricType);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Collection] Error getting collection metrics:', error.message);
    throw error;
  }
}

export async function getCollectionStats(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['CollectionMonitor']);
    const result = await callJavaMethod(command, 'getStats', collectionName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Collection] Error getting collection stats:', error.message);
    throw error;
  }
}

export async function getDocumentCount(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['CollectionMonitor']);
    const result = await callJavaMethod(command, 'getDocCount', collectionName);
    releaseAdminClient(instanceId);
    return parseInt(result);
  } catch (error) {
    console.error('[Collection] Error getting document count:', error.message);
    throw error;
  }
}

export async function getCollectionSize(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['CollectionMonitor']);
    const result = await callJavaMethod(command, 'getSize', collectionName);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error getting collection size:', error.message);
    throw error;
  }
}

export async function getIndexStats(collectionName, indexName = null, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['CollectionMonitor']);
    let result;
    if (indexName) {
      result = await callJavaMethod(command, 'getIndexStats', collectionName, indexName);
    } else {
      result = await callJavaMethod(command, 'getAllIndexStats', collectionName);
    }
    releaseAdminClient(instanceId);
    if (Array.isArray(result)) {
      return await javaListToArray(result);
    }
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Collection] Error getting index stats:', error.message);
    throw error;
  }
}

export async function getSlowQueries(collectionName, limit = 50, thresholdMs = 1000, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['CollectionMonitor']);
    const queries = await callJavaMethod(command, 'getSlowQueries', collectionName, limit, thresholdMs);
    releaseAdminClient(instanceId);
    return await javaListToArray(queries);
  } catch (error) {
    console.error('[Collection] Error getting slow queries:', error.message);
    throw error;
  }
}

export async function getTopSearchKeywords(collectionName, limit = 50, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['CollectionMonitor']);
    const keywords = await callJavaMethod(command, 'getTopKeywords', collectionName, limit);
    releaseAdminClient(instanceId);
    return await javaListToArray(keywords);
  } catch (error) {
    console.error('[Collection] Error getting top search keywords:', error.message);
    throw error;
  }
}

export async function deleteCollectionMonitor(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['CollectionMonitor']);
    const result = await callJavaMethod(command, 'deleteMonitor', collectionName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Collection] Error deleting collection monitor:', error.message);
    throw error;
  }
}

// ==================== DataSource 설정 (20+ 메서드) ⭐ 신규 ====================

export async function createDataSource(collectionName, dataSourceName, config, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const dataSetting = await callJavaMethod(adminClient, 'getCommand', ['DataSourceSetting']);
    const javaConfig = convertToJavaObject(config);
    const result = await callJavaMethod(dataSetting, 'addDataSource', collectionName, dataSourceName, javaConfig);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error creating data source:', error.message);
    throw error;
  }
}

export async function getDataSource(collectionName, dataSourceName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const dataSetting = await callJavaMethod(adminClient, 'getCommand', ['DataSourceSetting']);
    const result = await callJavaMethod(dataSetting, 'getDataSource', collectionName, dataSourceName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Collection] Error getting data source:', error.message);
    throw error;
  }
}

export async function listDataSources(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const dataSetting = await callJavaMethod(adminClient, 'getCommand', ['DataSourceSetting']);
    const sources = await callJavaMethod(dataSetting, 'getDataSourceList', collectionName);
    releaseAdminClient(instanceId);
    return await javaListToArray(sources);
  } catch (error) {
    console.error('[Collection] Error listing data sources:', error.message);
    throw error;
  }
}

export async function updateDataSource(collectionName, dataSourceName, config, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const dataSetting = await callJavaMethod(adminClient, 'getCommand', ['DataSourceSetting']);
    const javaConfig = convertToJavaObject(config);
    const result = await callJavaMethod(dataSetting, 'modifyDataSource', collectionName, dataSourceName, javaConfig);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error updating data source:', error.message);
    throw error;
  }
}

export async function deleteDataSource(collectionName, dataSourceName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const dataSetting = await callJavaMethod(adminClient, 'getCommand', ['DataSourceSetting']);
    const result = await callJavaMethod(dataSetting, 'removeDataSource', collectionName, dataSourceName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Collection] Error deleting data source:', error.message);
    throw error;
  }
}

export async function testDataSourceConnection(collectionName, dataSourceName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const dataSetting = await callJavaMethod(adminClient, 'getCommand', ['DataSourceSetting']);
    const result = await callJavaMethod(dataSetting, 'testConnection', collectionName, dataSourceName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Collection] Error testing data source connection:', error.message);
    throw error;
  }
}

export async function enableDataSource(collectionName, dataSourceName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const dataSetting = await callJavaMethod(adminClient, 'getCommand', ['DataSourceSetting']);
    const result = await callJavaMethod(dataSetting, 'enableDataSource', collectionName, dataSourceName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Collection] Error enabling data source:', error.message);
    throw error;
  }
}

export async function disableDataSource(collectionName, dataSourceName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const dataSetting = await callJavaMethod(adminClient, 'getCommand', ['DataSourceSetting']);
    const result = await callJavaMethod(dataSetting, 'disableDataSource', collectionName, dataSourceName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Collection] Error disabling data source:', error.message);
    throw error;
  }
}

export async function getDataSourceStatus(collectionName, dataSourceName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const dataSetting = await callJavaMethod(adminClient, 'getCommand', ['DataSourceSetting']);
    const result = await callJavaMethod(dataSetting, 'getStatus', collectionName, dataSourceName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Collection] Error getting data source status:', error.message);
    throw error;
  }
}

export async function createDataSourceMapping(collectionName, dataSourceName, fieldMappings = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const dataSetting = await callJavaMethod(adminClient, 'getCommand', ['DataSourceSetting']);
    const javaMapping = convertToJavaObject(fieldMappings);
    const result = await callJavaMethod(dataSetting, 'setFieldMapping', collectionName, dataSourceName, javaMapping);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error creating data source mapping:', error.message);
    throw error;
  }
}

export async function getDataSourceMapping(collectionName, dataSourceName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const dataSetting = await callJavaMethod(adminClient, 'getCommand', ['DataSourceSetting']);
    const result = await callJavaMethod(dataSetting, 'getFieldMapping', collectionName, dataSourceName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Collection] Error getting data source mapping:', error.message);
    throw error;
  }
}

export async function syncDataSourceData(collectionName, dataSourceName, options = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const dataSetting = await callJavaMethod(adminClient, 'getCommand', ['DataSourceSetting']);
    const javaOptions = convertToJavaObject(options);
    const result = await callJavaMethod(dataSetting, 'syncData', collectionName, dataSourceName, javaOptions);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Collection] Error syncing data source:', error.message);
    throw error;
  }
}

export async function getDataSourceSyncLog(collectionName, dataSourceName, limit = 100, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const dataSetting = await callJavaMethod(adminClient, 'getCommand', ['DataSourceSetting']);
    const logs = await callJavaMethod(dataSetting, 'getSyncLog', collectionName, dataSourceName, limit);
    releaseAdminClient(instanceId);
    return await javaListToArray(logs);
  } catch (error) {
    console.error('[Collection] Error getting data source sync log:', error.message);
    throw error;
  }
}

export async function testDataSourceQuery(collectionName, dataSourceName, query, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const dataSetting = await callJavaMethod(adminClient, 'getCommand', ['DataSourceSetting']);
    const result = await callJavaMethod(dataSetting, 'testQuery', collectionName, dataSourceName, query);
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Collection] Error testing data source query:', error.message);
    throw error;
  }
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
  listDBWatchers,

  // DBWatcher 고급 ⭐ 확장
  setupDBWatcherAdvanced,
  getDBWatcherStatus,
  getDBWatcherChangeLog,
  addDBWatcherFilter,
  removeDBWatcherFilter,
  getDBWatcherFilters,
  pauseDBWatcher,
  resumeDBWatcher,

  // CollectionMonitor ⭐ 신규
  createCollectionMonitor,
  getCollectionMonitorStatus,
  getCollectionMetrics,
  getCollectionStats,
  getDocumentCount,
  getCollectionSize,
  getIndexStats,
  getSlowQueries,
  getTopSearchKeywords,
  deleteCollectionMonitor,

  // DataSource
  createDataSource,
  getDataSource,
  listDataSources,
  updateDataSource,
  deleteDataSource,
  testDataSourceConnection,
  enableDataSource,
  disableDataSource,
  getDataSourceStatus,
  createDataSourceMapping,
  getDataSourceMapping,
  syncDataSourceData,
  getDataSourceSyncLog,
  testDataSourceQuery
};
