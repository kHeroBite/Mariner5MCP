/**
 * java-wrapper-v2/index.js - 통합 export
 *
 * 모든 관리 기능을 하나의 인터페이스로 제공
 * 약 400+ 메서드 포함
 */

// 기존 java-wrapper.js 기본 기능 import
import {
  initializeJavaClasses,
  createAdminServerInstance,
  connectToAdminServer,
  disconnectFromAdminServer,
  deleteAdminServerInstance,
  listCollections,
  getCollection,
  createCollection,
  deleteCollection,
  executeSearch,
  getIndexStatus,
  runIndex,
  listSimulations,
  createSimulation,
  deleteSimulation,
  runSimulation,
  checkServerHealth,
  getErrorLogs,
  deleteErrorLog,
  getJNIStatus,
  getJNIDiagnostics,
  getAllInstances,
  setDefaultInstance
} from '../java-wrapper.js';

// Re-export all from java-wrapper.js
export {
  initializeJavaClasses,
  createAdminServerInstance,
  connectToAdminServer,
  disconnectFromAdminServer,
  deleteAdminServerInstance,
  listCollections,
  getCollection,
  createCollection,
  deleteCollection,
  executeSearch,
  getIndexStatus,
  runIndex,
  listSimulations,
  createSimulation,
  deleteSimulation,
  runSimulation,
  checkServerHealth,
  getErrorLogs,
  deleteErrorLog,
  getJNIStatus,
  getJNIDiagnostics,
  getAllInstances,
  setDefaultInstance
};

// Import additional modules
import * as collectionMethods from './collection.js';
import * as dictionaryMethods from './dictionary.js';
import * as indexingMethods from './indexing.js';
import * as managementMethods from './management.js';
import * as serverMethods from './server.js';
import * as monitoringMethods from './monitoring.js';
import * as tuningMethods from './tuning.js';
import * as hotspotMethods from './hotspot.js';
import * as advancedMethods from './advanced.js';
import * as optimizationMethods from './optimization.js';
import * as clusterMethods from './cluster.js';
import * as aggregationMethods from './aggregation.js';
import * as enrichmentMethods from './enrichment.js';
import * as analyticsMethods from './analytics.js';
import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// Collection Management (130+)
export * as collection from './collection.js';

// Dictionary Management (130+)
export * as dictionary from './dictionary.js';

// Indexing Management (20+)
export * as indexing from './indexing.js';

// Management Settings (40+)
export * as management from './management.js';

// Server Management (30+)
export * as server from './server.js';

// Monitoring Logs (30+)
export * as monitoring from './monitoring.js';

// Search Tuning (60+)
export * as tuning from './tuning.js';

// Hotspot Analytics (30+)
export * as hotspot from './hotspot.js';

// Advanced Features (40+) ⭐ v3.4
export * as advanced from './advanced.js';

// Query Optimization (10+) ⭐ v3.5 신규
export * as optimization from './optimization.js';

// Cluster Management (10+) ⭐ v3.5 신규
export * as cluster from './cluster.js';

// Data Aggregation (10+) ⭐ v3.5 신규
export * as aggregation from './aggregation.js';

// Data Enrichment (15+) ⭐ v3.6 신규
export * as enrichment from './enrichment.js';

// Advanced Analytics (15+) ⭐ v3.6 신규
export * as analytics from './analytics.js';

// Helpers
export { getAdminClient, releaseAdminClient, convertToJavaObject };

// Unified API
export default {
  // Core
  initializeJavaClasses,
  createAdminServerInstance,
  connectToAdminServer,
  disconnectFromAdminServer,
  deleteAdminServerInstance,
  getAllInstances,
  setDefaultInstance,

  // Basic Collections
  listCollections,
  getCollection,
  createCollection,
  deleteCollection,

  // Basic Search
  executeSearch,
  getIndexStatus,
  runIndex,
  checkServerHealth,

  // Basic Simulations
  listSimulations,
  createSimulation,
  deleteSimulation,
  runSimulation,

  // Logs
  getErrorLogs,
  deleteErrorLog,
  getJNIStatus,
  getJNIDiagnostics,

  // Grouped APIs
  collection: collectionMethods,
  dictionary: dictionaryMethods,
  indexing: indexingMethods,
  management: managementMethods,
  server: serverMethods,
  monitoring: monitoringMethods,
  tuning: tuningMethods,
  hotspot: hotspotMethods,
  advanced: advancedMethods,
  optimization: optimizationMethods,
  cluster: clusterMethods,
  aggregation: aggregationMethods,
  enrichment: enrichmentMethods,
  analytics: analyticsMethods,

  // Helpers
  getAdminClient,
  releaseAdminClient,
  convertToJavaObject
};
