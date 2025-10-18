/**
 * java-wrapper-v2/hotspot.js - 핫스팟 관리 API (30+ 메서드) ⭐ 신규
 *
 * Mariner5의 고급 검색 기능 래핑
 * - Topicker: 상위 키워드 추출/트렌드 분석
 * - IntegratedInfo: 서버 통합 정보 조회
 * - SearchRequest: 고급 검색 요청 처리
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject,
  javaClasses
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// ==================== Topicker (상위 키워드/트렌드) (10+ 메서드) ====================

export async function getTopPickerConfig(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Topicker']);
    const result = await callJavaMethod(command, 'getConfig', collectionName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Hotspot] Error getting Topicker config:', error.message);
    throw error;
  }
}

export async function setTopPickerConfig(collectionName, config = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Topicker']);
    const javaConfig = convertToJavaObject(config);
    const result = await callJavaMethod(command, 'setConfig', collectionName, javaConfig);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Hotspot] Error setting Topicker config:', error.message);
    throw error;
  }
}

export async function getTopKeywords(collectionName, limit = 50, timeWindow = 'daily', instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Topicker']);
    const result = await callJavaMethod(command, 'getTopKeywords', collectionName, limit, timeWindow);
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Hotspot] Error getting top keywords:', error.message);
    throw error;
  }
}

export async function getTrendingKeywords(collectionName, limit = 30, timeWindow = 'hourly', instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Topicker']);
    const result = await callJavaMethod(command, 'getTrending', collectionName, limit, timeWindow);
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Hotspot] Error getting trending keywords:', error.message);
    throw error;
  }
}

export async function getKeywordStats(collectionName, keyword, timeWindow = 'daily', instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Topicker']);
    const result = await callJavaMethod(command, 'getStats', collectionName, keyword, timeWindow);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Hotspot] Error getting keyword stats:', error.message);
    throw error;
  }
}

export async function getKeywordTrend(collectionName, keyword, days = 30, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Topicker']);
    const result = await callJavaMethod(command, 'getTrend', collectionName, keyword, days);
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Hotspot] Error getting keyword trend:', error.message);
    throw error;
  }
}

export async function buildTopPickerIndex(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Topicker']);
    const result = await callJavaMethod(command, 'buildIndex', collectionName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Hotspot] Error building Topicker index:', error.message);
    throw error;
  }
}

export async function exportTopPickerData(collectionName, format = 'json', instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Topicker']);
    const result = await callJavaMethod(command, 'exportData', collectionName, format);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Hotspot] Error exporting Topicker data:', error.message);
    throw error;
  }
}

// ==================== IntegratedInfo (서버 통합 정보) (10+ 메서드) ====================

export async function getServerIntegratedInfo(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['IntegratedInfo']);
    const result = await callJavaMethod(command, 'getInfo');
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Hotspot] Error getting server integrated info:', error.message);
    throw error;
  }
}

export async function getServerHealth(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['IntegratedInfo']);
    const result = await callJavaMethod(command, 'getHealth');
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Hotspot] Error getting server health:', error.message);
    throw error;
  }
}

export async function getSystemResources(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['IntegratedInfo']);
    const result = await callJavaMethod(command, 'getResources');
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Hotspot] Error getting system resources:', error.message);
    throw error;
  }
}

export async function getCollectionsSummary(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['IntegratedInfo']);
    const result = await callJavaMethod(command, 'getCollectionsSummary');
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Hotspot] Error getting collections summary:', error.message);
    throw error;
  }
}

export async function getPerformanceMetrics(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['IntegratedInfo']);
    const result = await callJavaMethod(command, 'getPerformance');
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Hotspot] Error getting performance metrics:', error.message);
    throw error;
  }
}

export async function getRecentActivities(limit = 100, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['IntegratedInfo']);
    const result = await callJavaMethod(command, 'getActivities', limit);
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Hotspot] Error getting recent activities:', error.message);
    throw error;
  }
}

export async function getDashboard(dashboardType = 'overview', instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['IntegratedInfo']);
    const result = await callJavaMethod(command, 'getDashboard', dashboardType);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Hotspot] Error getting dashboard:', error.message);
    throw error;
  }
}

// ==================== SearchRequest (고급 검색) (10+ 메서드) ====================

export async function executeAdvancedSearch(querySet, options = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchRequest']);
    const javaQuerySet = convertToJavaObject(querySet);
    const javaOptions = convertToJavaObject(options);
    const result = await callJavaMethod(command, 'search', javaQuerySet, javaOptions);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Hotspot] Error executing advanced search:', error.message);
    throw error;
  }
}

export async function searchWithFacets(querySet, facetFields = [], instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchRequest']);
    const javaQuerySet = convertToJavaObject(querySet);
    const javaFacets = convertToJavaObject(facetFields);
    const result = await callJavaMethod(command, 'searchWithFacets', javaQuerySet, javaFacets);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Hotspot] Error searching with facets:', error.message);
    throw error;
  }
}

export async function searchWithSpellCheck(keyword, collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchRequest']);
    const result = await callJavaMethod(command, 'spellCheck', keyword, collectionName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Hotspot] Error searching with spell check:', error.message);
    throw error;
  }
}

export async function getSearchSuggestions(keyword, collectionName, limit = 10, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchRequest']);
    const result = await callJavaMethod(command, 'getSuggestions', keyword, collectionName, limit);
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Hotspot] Error getting search suggestions:', error.message);
    throw error;
  }
}

export async function getSearchRecommendations(keyword, collectionName, limit = 10, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchRequest']);
    const result = await callJavaMethod(command, 'getRecommendations', keyword, collectionName, limit);
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Hotspot] Error getting search recommendations:', error.message);
    throw error;
  }
}

export async function searchWithBoost(querySet, boostConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchRequest']);
    const javaQuerySet = convertToJavaObject(querySet);
    const javaBoost = convertToJavaObject(boostConfig);
    const result = await callJavaMethod(command, 'searchWithBoost', javaQuerySet, javaBoost);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Hotspot] Error searching with boost:', error.message);
    throw error;
  }
}

export async function searchWithFilters(querySet, filters = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchRequest']);
    const javaQuerySet = convertToJavaObject(querySet);
    const javaFilters = convertToJavaObject(filters);
    const result = await callJavaMethod(command, 'searchWithFilters', javaQuerySet, javaFilters);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Hotspot] Error searching with filters:', error.message);
    throw error;
  }
}

export async function analyzeSearchQuery(querySet, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchRequest']);
    const javaQuerySet = convertToJavaObject(querySet);
    const result = await callJavaMethod(command, 'analyze', javaQuerySet);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Hotspot] Error analyzing search query:', error.message);
    throw error;
  }
}

export default {
  // Topicker
  getTopPickerConfig,
  setTopPickerConfig,
  getTopKeywords,
  getTrendingKeywords,
  getKeywordStats,
  getKeywordTrend,
  buildTopPickerIndex,
  exportTopPickerData,

  // IntegratedInfo
  getServerIntegratedInfo,
  getServerHealth,
  getSystemResources,
  getCollectionsSummary,
  getPerformanceMetrics,
  getRecentActivities,
  getDashboard,

  // SearchRequest
  executeAdvancedSearch,
  searchWithFacets,
  searchWithSpellCheck,
  getSearchSuggestions,
  getSearchRecommendations,
  searchWithBoost,
  searchWithFilters,
  analyzeSearchQuery
};
