/**
 * java-wrapper-v2/optimization.js - 쿼리 최적화 및 성능 분석 API (10+ 메서드) ⭐ v3.5 신규
 *
 * - QueryOptimization: 쿼리 실행 계획 분석 및 최적화
 * - QueryAnalytics: 쿼리 성능 분석
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject,
  javaClasses
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// ==================== Query Optimization (5+ 메서드) ====================

export async function generateExecutionPlan(querySet, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['QueryOptimization']);
    const javaQuerySet = convertToJavaObject(querySet);
    const result = await callJavaMethod(command, 'generateExecutionPlan', javaQuerySet);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Optimization] Error generating execution plan:', error.message);
    throw error;
  }
}

export async function analyzeQueryPerformance(querySet, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['QueryOptimization']);
    const javaQuerySet = convertToJavaObject(querySet);
    const result = await callJavaMethod(command, 'analyzePerformance', javaQuerySet);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Optimization] Error analyzing query performance:', error.message);
    throw error;
  }
}

export async function optimizeQuerySet(querySet, optimizationLevel = 'auto', instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['QueryOptimization']);
    const javaQuerySet = convertToJavaObject(querySet);
    const result = await callJavaMethod(
      command,
      'optimizeQuery',
      javaQuerySet,
      optimizationLevel
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Optimization] Error optimizing query set:', error.message);
    throw error;
  }
}

export async function getQueryStatistics(querySet, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['QueryOptimization']);
    const javaQuerySet = convertToJavaObject(querySet);
    const result = await callJavaMethod(command, 'getQueryStatistics', javaQuerySet);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Optimization] Error getting query statistics:', error.message);
    throw error;
  }
}

export async function suggestIndexes(querySet, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['QueryOptimization']);
    const javaQuerySet = convertToJavaObject(querySet);
    const result = await callJavaMethod(command, 'suggestIndexes', javaQuerySet);
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Optimization] Error suggesting indexes:', error.message);
    throw error;
  }
}

// ==================== Query Cache Management (5+ 메서드) ====================

export async function enableQueryCache(cacheConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['QueryOptimization']);
    const javaConfig = convertToJavaObject(cacheConfig);
    const result = await callJavaMethod(command, 'enableCache', javaConfig);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Optimization] Error enabling query cache:', error.message);
    throw error;
  }
}

export async function disableQueryCache(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['QueryOptimization']);
    const result = await callJavaMethod(command, 'disableCache');
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Optimization] Error disabling query cache:', error.message);
    throw error;
  }
}

export async function getCacheStatistics(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['QueryOptimization']);
    const result = await callJavaMethod(command, 'getCacheStats');
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Optimization] Error getting cache statistics:', error.message);
    throw error;
  }
}

export async function clearQueryCache(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['QueryOptimization']);
    const result = await callJavaMethod(command, 'clearCache');
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Optimization] Error clearing query cache:', error.message);
    throw error;
  }
}

export async function getCachedQueries(limit = 100, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['QueryOptimization']);
    const result = await callJavaMethod(command, 'getCachedQueries', limit);
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Optimization] Error getting cached queries:', error.message);
    throw error;
  }
}

export default {
  // Query Optimization
  generateExecutionPlan,
  analyzeQueryPerformance,
  optimizeQuerySet,
  getQueryStatistics,
  suggestIndexes,

  // Query Cache
  enableQueryCache,
  disableQueryCache,
  getCacheStatistics,
  clearQueryCache,
  getCachedQueries
};
