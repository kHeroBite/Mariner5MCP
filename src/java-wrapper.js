/**
 * java-wrapper.js - Mariner5 검색엔진 Java API 래퍼
 *
 * AdminServerClient를 기반으로 Mariner5의 주요 기능을 래핑
 * 각 MCP 도구가 사용할 수 있는 고수준 API 제공
 *
 * 멀티 인스턴스 지원:
 * - instanceId 파라미터를 통해 여러 Mariner5 인스턴스 관리
 * - instanceId 생략 시 기본 인스턴스 사용 (하위 호환성)
 */

import {
  initializeJavaClasses,
  getAdminServerClient,
  disconnectAdminServerClient,
  callJavaMethod,
  callJavaMethodSequential,
  javaListToArray,
  javaMapToObject,
  javaClasses,
  cleanupJNI,
  getJVMStatus,
  getDiagnostics
} from './java-bridge.js';

import {
  getInstanceManager
} from './instance-manager.js';

/**
 * AdminServerClient 초기화 및 연결 (InstanceManager 사용)
 * @param {object} config - 연결 설정 {host, port, name}
 * @returns {Promise<string>} 인스턴스 ID
 */
export async function createAdminServerInstance(config = {}) {
  try {
    const manager = getInstanceManager();
    const instanceId = await manager.createInstance(config);
    console.error(`[Java-Wrapper] Created instance: ${instanceId} at ${config.host || 'localhost'}:${config.port || 5555}`);
    return instanceId;
  } catch (error) {
    console.error('[Java-Wrapper] Failed to create instance:', error.message);
    throw error;
  }
}

/**
 * AdminServerClient 인스턴스 조회
 * @param {string} instanceId - 인스턴스 ID (선택사항, 생략 시 기본값)
 * @returns {object} AdminServerClient 인스턴스
 */
function getAdminClient(instanceId = null) {
  try {
    const manager = getInstanceManager();
    const context = manager.getInstance(instanceId);
    return context.adminClient;
  } catch (error) {
    throw new Error(`Failed to get admin client: ${error.message}`);
  }
}

/**
 * AdminServerClient 인스턴스 반환
 * @param {string} instanceId - 인스턴스 ID
 */
function releaseAdminClient(instanceId) {
  try {
    const manager = getInstanceManager();
    manager.releaseInstance(instanceId);
  } catch (error) {
    console.error('[Java-Wrapper] Error releasing admin client:', error.message);
  }
}

/**
 * 기존 코드 호환성: 단일 인스턴스 모드 (deprecated)
 * @param {string} host - 서버 호스트
 * @param {number} port - 서버 포트
 * @returns {Promise<void>}
 * @deprecated 대신 createAdminServerInstance 사용
 */
export async function connectToAdminServer(host = 'localhost', port = 5555) {
  try {
    await createAdminServerInstance({ host, port });
    console.error(`[Java-Wrapper] Connected to AdminServer at ${host}:${port}`);
  } catch (error) {
    console.error('[Java-Wrapper] Failed to connect to AdminServer:', error.message);
    throw error;
  }
}

/**
 * 컬렉션 목록 조회
 * @param {string} instanceId - 인스턴스 ID (선택사항)
 * @returns {Promise<Array>} 컬렉션 정보 배열
 */
export async function listCollections(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const collectionInfoServer = await callJavaMethod(adminClient, 'getCommandCollectionInfoServer', []);
    const collections = await callJavaMethod(collectionInfoServer, 'getAllCollectionInfoList', []);
    releaseAdminClient(instanceId);
    return await javaListToArray(collections);
  } catch (error) {
    console.error('[Java-Wrapper] Error listing collections:', error.message);
    throw error;
  }
}

/**
 * 특정 컬렉션 정보 조회
 * @param {string} collectionName - 컬렉션명
 * @param {string} instanceId - 인스턴스 ID (선택사항)
 * @returns {Promise<object>} 컬렉션 정보
 */
export async function getCollection(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const collectionInfoServer = await callJavaMethod(adminClient, 'getCommandCollectionInfoServer');
    const info = await callJavaMethod(collectionInfoServer, 'getCollectionInfo', collectionName);
    releaseAdminClient(instanceId);
    return javaMapToObject(info);
  } catch (error) {
    console.error(`[Java-Wrapper] Error getting collection:`, error.message);
    throw error;
  }
}

/**
 * 새 컬렉션 생성
 * @param {string} collectionName - 컬렉션명
 * @param {object} options - 옵션 (shards, replicas 등)
 * @param {string} instanceId - 인스턴스 ID (선택사항)
 * @returns {Promise<object>} 생성 결과
 */
export async function createCollection(collectionName, options = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const collectionInfoServer = await callJavaMethod(adminClient, 'getCommandCollectionInfoServer');

    const optionsMap = new javaClasses.HashMap();
    for (const [key, value] of Object.entries(options)) {
      optionsMap.putSync(key, value);
    }

    const result = await callJavaMethod(collectionInfoServer, 'createCollection', collectionName, optionsMap);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error(`[Java-Wrapper] Error creating collection:`, error.message);
    throw error;
  }
}

/**
 * 컬렉션 삭제
 * @param {string} collectionName - 컬렉션명
 * @param {string} instanceId - 인스턴스 ID (선택사항)
 * @returns {Promise<boolean>} 성공 여부
 */
export async function deleteCollection(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const collectionInfoServer = await callJavaMethod(adminClient, 'getCommandCollectionInfoServer');
    const result = await callJavaMethod(collectionInfoServer, 'deleteCollection', collectionName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error(`[Java-Wrapper] Error deleting collection:`, error.message);
    throw error;
  }
}

/**
 * 검색 실행
 * @param {object} querySet - 검색 쿼리 설정
 * @param {string} instanceId - 인스턴스 ID (선택사항)
 * @returns {Promise<object>} 검색 결과
 */
export async function executeSearch(querySet, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const searchCommand = await callJavaMethod(adminClient, 'getCommandSearchRequest');
    const javaQuerySet = convertToJavaObject(querySet);
    const result = await callJavaMethod(searchCommand, 'executeQuery', javaQuerySet);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Java-Wrapper] Error executing search:', error.message);
    throw error;
  }
}

/**
 * 색인 상태 조회
 * @param {string} collectionName - 컬렉션명
 * @param {string} instanceId - 인스턴스 ID (선택사항)
 * @returns {Promise<object>} 색인 상태 정보
 */
export async function getIndexStatus(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexTaskServer = await callJavaMethod(adminClient, 'getCommandIndexTaskServer');
    const status = await callJavaMethod(indexTaskServer, 'getIndexStatus', collectionName);
    releaseAdminClient(instanceId);
    return javaMapToObject(status);
  } catch (error) {
    console.error(`[Java-Wrapper] Error getting index status:`, error.message);
    throw error;
  }
}

/**
 * 색인 실행
 * @param {string} collectionName - 컬렉션명
 * @param {string} indexType - 색인 타입
 * @param {string} instanceId - 인스턴스 ID (선택사항)
 * @returns {Promise<object>} 실행 결과
 */
export async function runIndex(collectionName, indexType = 'full', instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexTaskServer = await callJavaMethod(adminClient, 'getCommandIndexTaskServer');
    const result = await callJavaMethod(indexTaskServer, 'runIndex', collectionName, indexType);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error(`[Java-Wrapper] Error running index:`, error.message);
    throw error;
  }
}

/**
 * 시뮬레이션 목록 조회
 * @param {string} instanceId - 인스턴스 ID (선택사항)
 * @returns {Promise<Array>} 시뮬레이션 정보 배열
 */
export async function listSimulations(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const simCommand = await callJavaMethod(adminClient, 'getCommandSimulationQueryManagement');
    const simulations = await callJavaMethod(simCommand, 'getSimulationList');
    releaseAdminClient(instanceId);
    return await javaListToArray(simulations);
  } catch (error) {
    console.error('[Java-Wrapper] Error listing simulations:', error.message);
    throw error;
  }
}

/**
 * 시뮬레이션 생성
 * @param {string} simName - 시뮬레이션명
 * @param {object} config - 시뮬레이션 설정
 * @param {string} instanceId - 인스턴스 ID (선택사항)
 * @returns {Promise<object>} 생성 결과
 */
export async function createSimulation(simName, config, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const simCommand = await callJavaMethod(adminClient, 'getCommandSimulationQueryManagement');
    const javaConfig = convertToJavaObject(config);
    const result = await callJavaMethod(simCommand, 'createSimulation', simName, javaConfig);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error(`[Java-Wrapper] Error creating simulation:`, error.message);
    throw error;
  }
}

/**
 * 시뮬레이션 삭제
 * @param {string} simId - 시뮬레이션 ID
 * @param {string} instanceId - 인스턴스 ID (선택사항)
 * @returns {Promise<boolean>} 성공 여부
 */
export async function deleteSimulation(simId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const simCommand = await callJavaMethod(adminClient, 'getCommandSimulationQueryManagement');
    const result = await callJavaMethod(simCommand, 'deleteSimulation', simId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error(`[Java-Wrapper] Error deleting simulation:`, error.message);
    throw error;
  }
}

/**
 * 시뮬레이션 실행
 * @param {string} simId - 시뮬레이션 ID
 * @param {string} instanceId - 인스턴스 ID (선택사항)
 * @returns {Promise<object>} 실행 결과
 */
export async function runSimulation(simId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const simCommand = await callJavaMethod(adminClient, 'getCommandSearchSimulation');
    const result = await callJavaMethod(simCommand, 'runSimulation', simId);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Java-Wrapper] Error running simulation:', error.message);
    throw error;
  }
}

/**
 * 서버 헬스 체크
 * @param {string} instanceId - 인스턴스 ID (선택사항)
 * @returns {Promise<object>} 서버 상태 정보
 */
export async function checkServerHealth(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const result = await callJavaMethod(adminClient, 'getServerStatus');
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Java-Wrapper] Error checking server health:', error.message);
    throw error;
  }
}

/**
 * 에러 로그 조회
 * @param {object} options - 조회 옵션
 * @param {string} instanceId - 인스턴스 ID (선택사항)
 * @returns {Promise<Array>} 에러 로그 배열
 */
export async function getErrorLogs(options = {}, instanceId = null) {
  try {
    releaseAdminClient(instanceId);
    return [];
  } catch (error) {
    console.error('[Java-Wrapper] Error getting error logs:', error.message);
    throw error;
  }
}

/**
 * 에러 로그 삭제
 * @param {string} logId - 로그 ID
 * @param {string} instanceId - 인스턴스 ID (선택사항)
 * @returns {Promise<boolean>} 성공 여부
 */
export async function deleteErrorLog(logId, instanceId = null) {
  try {
    releaseAdminClient(instanceId);
    return true;
  } catch (error) {
    console.error(`[Java-Wrapper] Error deleting error log:`, error.message);
    throw error;
  }
}

/**
 * JavaScript 객체를 Java 객체로 변환
 * @param {any} obj - JavaScript 객체
 * @returns {object} Java 객체
 */
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

/**
 * JNI 상태 조회
 * @returns {object} JVM 및 JNI 상태 정보
 */
export function getJNIStatus() {
  return getJVMStatus();
}

/**
 * JNI 진단 정보 반환
 * @returns {object} 상세 진단 정보
 */
export function getJNIDiagnostics() {
  return getDiagnostics();
}

/**
 * AdminServer 연결 종료 및 정리
 * @returns {Promise<void>}
 */
export async function disconnectFromAdminServer() {
  try {
    console.error('[Java-Wrapper] Disconnecting from AdminServer...');
    await cleanupJNI();
    console.error('[Java-Wrapper] Disconnected successfully');
  } catch (error) {
    console.error('[Java-Wrapper] Error disconnecting:', error.message);
    throw error;
  }
}

/**
 * 모든 인스턴스 조회
 * @returns {object} 인스턴스 관리자 통계
 */
export function getAllInstances() {
  try {
    const manager = getInstanceManager();
    return manager.getPoolStats();
  } catch (error) {
    console.error('[Java-Wrapper] Error getting instances:', error.message);
    throw error;
  }
}

/**
 * 기본 인스턴스 ID 설정
 * @param {string} instanceId - 인스턴스 ID
 */
export function setDefaultInstance(instanceId) {
  try {
    const manager = getInstanceManager();
    manager.setDefaultInstance(instanceId);
  } catch (error) {
    console.error('[Java-Wrapper] Error setting default instance:', error.message);
    throw error;
  }
}

/**
 * 인스턴스 삭제
 * @param {string} instanceId - 인스턴스 ID
 * @returns {Promise<void>}
 */
export async function deleteAdminServerInstance(instanceId) {
  try {
    const manager = getInstanceManager();
    await manager.deleteInstance(instanceId);
  } catch (error) {
    console.error('[Java-Wrapper] Error deleting instance:', error.message);
    throw error;
  }
}

// Re-export initializeJavaClasses for server.js
export { initializeJavaClasses };

export default {
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
