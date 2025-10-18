/**
 * java-wrapper-v2/analytics.js - 고급 분석 및 인사이트 API (15+ 메서드) ⭐ v3.6 신규
 *
 * - AdvancedAnalytics: 고급 분석 및 시각화 준비
 * - SearchBehaviorAnalytics: 검색 행동 분석 및 트렌드
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject,
  javaClasses
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// ==================== Advanced Analytics (8+ 메서드) ====================

export async function generateAnalyticsReport(collectionName, reportConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AdvancedAnalytics']);
    const javaConfig = convertToJavaObject(reportConfig);
    const result = await callJavaMethod(
      command,
      'generateReport',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Analytics] Error generating analytics report:', error.message);
    throw error;
  }
}

export async function createPivotTable(collectionName, pivotConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AdvancedAnalytics']);
    const javaConfig = convertToJavaObject(pivotConfig);
    const result = await callJavaMethod(
      command,
      'createPivot',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Analytics] Error creating pivot table:', error.message);
    throw error;
  }
}

export async function buildTimeSeries(collectionName, timeSeriesConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AdvancedAnalytics']);
    const javaConfig = convertToJavaObject(timeSeriesConfig);
    const result = await callJavaMethod(
      command,
      'buildTimeSeries',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Analytics] Error building time series:', error.message);
    throw error;
  }
}

export async function performRegressionAnalysis(collectionName, regressionConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AdvancedAnalytics']);
    const javaConfig = convertToJavaObject(regressionConfig);
    const result = await callJavaMethod(
      command,
      'regression',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Analytics] Error performing regression analysis:', error.message);
    throw error;
  }
}

export async function performCorrelationAnalysis(collectionName, correlationConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AdvancedAnalytics']);
    const javaConfig = convertToJavaObject(correlationConfig);
    const result = await callJavaMethod(
      command,
      'correlation',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Analytics] Error performing correlation analysis:', error.message);
    throw error;
  }
}

export async function performClusteringAnalysis(collectionName, clusteringConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AdvancedAnalytics']);
    const javaConfig = convertToJavaObject(clusteringConfig);
    const result = await callJavaMethod(
      command,
      'clustering',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Analytics] Error performing clustering analysis:', error.message);
    throw error;
  }
}

export async function performAnomalyDetection(collectionName, anomalyConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AdvancedAnalytics']);
    const javaConfig = convertToJavaObject(anomalyConfig);
    const result = await callJavaMethod(
      command,
      'anomalyDetection',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Analytics] Error performing anomaly detection:', error.message);
    throw error;
  }
}

export async function exportAnalyticsData(collectionName, exportConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AdvancedAnalytics']);
    const javaConfig = convertToJavaObject(exportConfig);
    const result = await callJavaMethod(
      command,
      'export',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Analytics] Error exporting analytics data:', error.message);
    throw error;
  }
}

// ==================== Search Behavior Analytics (7+ 메서드) ====================

export async function trackUserSearchBehavior(collectionName, behaviorTrackingConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchBehaviorAnalytics']);
    const javaConfig = convertToJavaObject(behaviorTrackingConfig);
    const result = await callJavaMethod(
      command,
      'trackBehavior',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Analytics] Error tracking user search behavior:', error.message);
    throw error;
  }
}

export async function analyzeSearchPatterns(collectionName, analysisConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchBehaviorAnalytics']);
    const javaConfig = convertToJavaObject(analysisConfig);
    const result = await callJavaMethod(
      command,
      'analyzePatterns',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Analytics] Error analyzing search patterns:', error.message);
    throw error;
  }
}

export async function getUserSegmentation(collectionName, segmentationConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchBehaviorAnalytics']);
    const javaConfig = convertToJavaObject(segmentationConfig);
    const result = await callJavaMethod(
      command,
      'segmentUsers',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Analytics] Error getting user segmentation:', error.message);
    throw error;
  }
}

export async function predictSearchTrends(collectionName, predictionConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchBehaviorAnalytics']);
    const javaConfig = convertToJavaObject(predictionConfig);
    const result = await callJavaMethod(
      command,
      'predictTrends',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Analytics] Error predicting search trends:', error.message);
    throw error;
  }
}

export async function getSearchSessionAnalytics(collectionName, sessionConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchBehaviorAnalytics']);
    const javaConfig = convertToJavaObject(sessionConfig);
    const result = await callJavaMethod(
      command,
      'getSessionAnalytics',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Analytics] Error getting search session analytics:', error.message);
    throw error;
  }
}

export async function generateBehaviorInsights(collectionName, insightConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchBehaviorAnalytics']);
    const javaConfig = convertToJavaObject(insightConfig);
    const result = await callJavaMethod(
      command,
      'generateInsights',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Analytics] Error generating behavior insights:', error.message);
    throw error;
  }
}

export async function getRecommendationInsights(collectionName, recommendationConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SearchBehaviorAnalytics']);
    const javaConfig = convertToJavaObject(recommendationConfig);
    const result = await callJavaMethod(
      command,
      'getRecommendations',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Analytics] Error getting recommendation insights:', error.message);
    throw error;
  }
}

export default {
  // Advanced Analytics
  generateAnalyticsReport,
  createPivotTable,
  buildTimeSeries,
  performRegressionAnalysis,
  performCorrelationAnalysis,
  performClusteringAnalysis,
  performAnomalyDetection,
  exportAnalyticsData,

  // Search Behavior Analytics
  trackUserSearchBehavior,
  analyzeSearchPatterns,
  getUserSegmentation,
  predictSearchTrends,
  getSearchSessionAnalytics,
  generateBehaviorInsights,
  getRecommendationInsights
};
