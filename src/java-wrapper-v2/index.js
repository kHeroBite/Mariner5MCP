/**
 * java-wrapper-v2/index.js - 통합 export
 *
 * 모든 관리 기능을 하나의 인터페이스로 제공
 * 약 400+ 메서드 포함
 */

// 기존 java-wrapper.js 기본 기능 import
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
} from '../java-wrapper.js';

// Collection Management (80+)
export * as collection from './collection.js';

// Dictionary Management (100+)
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

// Helpers
export { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

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
  collection,
  dictionary,
  indexing,
  management,
  server,
  monitoring,
  tuning,

  // Helpers
  getAdminClient,
  releaseAdminClient,
  convertToJavaObject
};
