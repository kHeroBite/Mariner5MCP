/**
 * java-wrapper-v2/aggregation.js - 데이터 집계 및 분석 API (10+ 메서드) ⭐ v3.5 신규
 *
 * - DataAggregation: 다중 컬렉션 데이터 집계 및 분석
 * - GroupOperation: 데이터 그룹화 및 통계
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject,
  javaClasses
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// ==================== Data Aggregation (5+ 메서드) ====================

export async function aggregateDocuments(collectionNames = [], aggregationConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DataAggregation']);
    const javaCollections = convertToJavaObject(collectionNames);
    const javaConfig = convertToJavaObject(aggregationConfig);
    const result = await callJavaMethod(
      command,
      'aggregateDocuments',
      javaCollections,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Aggregation] Error aggregating documents:', error.message);
    throw error;
  }
}

export async function groupByField(collectionNames = [], groupField, aggregateFunctions = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DataAggregation']);
    const javaCollections = convertToJavaObject(collectionNames);
    const javaFunctions = convertToJavaObject(aggregateFunctions);
    const result = await callJavaMethod(
      command,
      'groupByField',
      javaCollections,
      groupField,
      javaFunctions
    );
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Aggregation] Error grouping by field:', error.message);
    throw error;
  }
}

export async function calculateMetrics(collectionNames = [], metricsConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DataAggregation']);
    const javaCollections = convertToJavaObject(collectionNames);
    const javaConfig = convertToJavaObject(metricsConfig);
    const result = await callJavaMethod(
      command,
      'calculateMetrics',
      javaCollections,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Aggregation] Error calculating metrics:', error.message);
    throw error;
  }
}

export async function performUnionAggregation(collectionNames = [], unionConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DataAggregation']);
    const javaCollections = convertToJavaObject(collectionNames);
    const javaConfig = convertToJavaObject(unionConfig);
    const result = await callJavaMethod(
      command,
      'unionAggregation',
      javaCollections,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Aggregation] Error performing union aggregation:', error.message);
    throw error;
  }
}

export async function getAggregationStatistics(collectionNames = [], instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DataAggregation']);
    const javaCollections = convertToJavaObject(collectionNames);
    const result = await callJavaMethod(
      command,
      'getStatistics',
      javaCollections
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Aggregation] Error getting aggregation statistics:', error.message);
    throw error;
  }
}

// ==================== Group Operations (5+ 메서드) ====================

export async function groupAndSort(collectionNames = [], groupConfig = {}, sortConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['GroupOperation']);
    const javaCollections = convertToJavaObject(collectionNames);
    const javaGroupConfig = convertToJavaObject(groupConfig);
    const javaSortConfig = convertToJavaObject(sortConfig);
    const result = await callJavaMethod(
      command,
      'groupAndSort',
      javaCollections,
      javaGroupConfig,
      javaSortConfig
    );
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Aggregation] Error grouping and sorting:', error.message);
    throw error;
  }
}

export async function calculateGroupStatistics(collectionNames = [], groupField, statisticsFunctions = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['GroupOperation']);
    const javaCollections = convertToJavaObject(collectionNames);
    const javaFunctions = convertToJavaObject(statisticsFunctions);
    const result = await callJavaMethod(
      command,
      'calculateGroupStats',
      javaCollections,
      groupField,
      javaFunctions
    );
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Aggregation] Error calculating group statistics:', error.message);
    throw error;
  }
}

export async function performPivotTable(collectionNames = [], pivotConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['GroupOperation']);
    const javaCollections = convertToJavaObject(collectionNames);
    const javaConfig = convertToJavaObject(pivotConfig);
    const result = await callJavaMethod(
      command,
      'createPivotTable',
      javaCollections,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Aggregation] Error performing pivot table:', error.message);
    throw error;
  }
}

export async function rollupData(collectionNames = [], rollupConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['GroupOperation']);
    const javaCollections = convertToJavaObject(collectionNames);
    const javaConfig = convertToJavaObject(rollupConfig);
    const result = await callJavaMethod(
      command,
      'rollup',
      javaCollections,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Aggregation] Error rolling up data:', error.message);
    throw error;
  }
}

export async function getDrillDownData(collectionNames = [], drillDownConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['GroupOperation']);
    const javaCollections = convertToJavaObject(collectionNames);
    const javaConfig = convertToJavaObject(drillDownConfig);
    const result = await callJavaMethod(
      command,
      'drillDown',
      javaCollections,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Aggregation] Error drilling down data:', error.message);
    throw error;
  }
}

export default {
  // Data Aggregation
  aggregateDocuments,
  groupByField,
  calculateMetrics,
  performUnionAggregation,
  getAggregationStatistics,

  // Group Operations
  groupAndSort,
  calculateGroupStatistics,
  performPivotTable,
  rollupData,
  getDrillDownData
};
