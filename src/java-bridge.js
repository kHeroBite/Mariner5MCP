/**
 * java-bridge.js - Java JNI 브릿지 레이어 (개선된 버전)
 *
 * Node.js와 Java(Mariner5 검색엔진)를 연결하는 JNI 브릿지
 * node-java 라이브러리를 사용하여 Java 메서드 호출 지원
 *
 * 개선사항:
 * 1. 강화된 에러 처리 (상세한 에러 분류)
 * 2. 자동 재시도 로직 (타임아웃/일시적 오류)
 * 3. 메모리 누수 방지 (명시적 정리)
 * 4. 크로스플랫폼 호환성 (Windows/macOS/Linux)
 * 5. 상세 로깅 및 성능 모니터링
 */

import java from 'java';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MARINER5_HOME = process.env.MARINER5_HOME || process.env.IR5_HOME || 'C:\\DATA\\Project\\mariner5';

// ==================== 설정 상수 ====================
const CONFIG = {
  // 타임아웃 설정 (밀리초)
  JNI_CALL_TIMEOUT: parseInt(process.env.JNI_CALL_TIMEOUT || '30000', 10),
  ADMIN_CLIENT_TIMEOUT: parseInt(process.env.ADMIN_CLIENT_TIMEOUT || '60000', 10),

  // 재시도 설정
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES || '3', 10),
  RETRY_DELAY: parseInt(process.env.RETRY_DELAY || '500', 10),

  // 메모리 관리
  ENABLE_GC: process.env.ENABLE_GC !== 'false',
  GC_INTERVAL: parseInt(process.env.GC_INTERVAL || '60000', 10), // 1분

  // 로깅
  DEBUG_MODE: process.env.DEBUG_MODE === 'true',
  LOG_JNI_CALLS: process.env.LOG_JNI_CALLS === 'true'
};

// Java 시스템 프로퍼티 설정
java.options.push('-Dfile.encoding=UTF-8');
java.options.push(`-Djava.library.path=${path.join(MARINER5_HOME, 'lib')}`);
java.options.push(`-DIR5_HOME=${MARINER5_HOME}`);

// 메모리 설정 (환경변수로 오버라이드 가능)
if (process.env.JAVA_HEAP_SIZE) {
  java.options.push(`-Xmx${process.env.JAVA_HEAP_SIZE}`);
}

// ==================== 상태 추적 ====================
const jvmState = {
  initialized: false,
  adminClientReady: false,
  errorCount: 0,
  lastError: null,
  callCount: 0,
  startTime: null
};

// ==================== 로깅 유틸리티 ====================
const logger = {
  debug: (msg, data) => {
    if (CONFIG.DEBUG_MODE) console.error(`[JNI-DEBUG] ${msg}`, data || '');
  },
  info: (msg, data) => console.error(`[JNI-INFO] ${msg}`, data || ''),
  warn: (msg, data) => console.error(`[JNI-WARN] ${msg}`, data || ''),
  error: (msg, data) => console.error(`[JNI-ERROR] ${msg}`, data || '')
};

// ==================== 에러 분류 시스템 ====================
class JNIError extends Error {
  constructor(type, message, originalError = null, retryable = false) {
    super(message);
    this.name = 'JNIError';
    this.type = type;
    this.originalError = originalError;
    this.retryable = retryable;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Java 에러를 분류하고 재시도 가능 여부 판단
 */
function classifyError(error) {
  const message = error.message || error.toString();

  // 타임아웃 관련
  if (message.includes('timeout') || message.includes('TimeoutException')) {
    return { type: 'TIMEOUT', retryable: true };
  }

  // 연결 관련
  if (message.includes('Connection') || message.includes('RDBMS') || message.includes('connection refused')) {
    return { type: 'CONNECTION', retryable: true };
  }

  // 메모리 관련
  if (message.includes('OutOfMemory') || message.includes('heap')) {
    return { type: 'OUT_OF_MEMORY', retryable: false };
  }

  // 클래스 로드 실패
  if (message.includes('ClassNotFound') || message.includes('NoClassDef')) {
    return { type: 'CLASS_NOT_FOUND', retryable: false };
  }

  // 잘못된 인자
  if (message.includes('IllegalArgument') || message.includes('NullPointerException')) {
    return { type: 'INVALID_ARGUMENT', retryable: false };
  }

  // 기타 Java 예외
  if (message.includes('Exception') || message.includes('Error')) {
    return { type: 'JAVA_EXCEPTION', retryable: false };
  }

  // 기타
  return { type: 'UNKNOWN', retryable: false };
}

// ==================== 메모리 관리 ====================
let gcTimer = null;

/**
 * 주기적인 가비지 컬렉션 시작
 */
function startGarbageCollection() {
  if (!CONFIG.ENABLE_GC || gcTimer) return;

  gcTimer = setInterval(() => {
    try {
      if (global.gc) {
        global.gc();
        logger.debug('Garbage collection triggered');
      }
    } catch (error) {
      logger.warn('GC error:', error.message);
    }
  }, CONFIG.GC_INTERVAL);

  logger.info(`GC started (interval: ${CONFIG.GC_INTERVAL}ms)`);
}

/**
 * 가비지 컬렉션 중지 및 정리
 */
function stopGarbageCollection() {
  if (gcTimer) {
    clearInterval(gcTimer);
    gcTimer = null;
    logger.info('GC stopped');
  }
}

/**
 * JVM 상태 정보 반환
 */
export function getJVMStatus() {
  const uptime = jvmState.startTime ? Date.now() - jvmState.startTime : 0;
  return {
    initialized: jvmState.initialized,
    adminClientReady: jvmState.adminClientReady,
    callCount: jvmState.callCount,
    errorCount: jvmState.errorCount,
    lastError: jvmState.lastError,
    uptime: `${Math.floor(uptime / 1000)}s`,
    timestamp: new Date().toISOString()
  };
}

/**
 * Java 클래스 프리페치
 * node-java의 클래스 로딩 최적화를 위해 사용할 클래스 사전 등록
 */
export const javaClasses = {
  // ==================== AdminServer 핵심 클래스 ====================
  AdminServerClient: null,

  // ==================== Command 클래스 (컬렉션 관리) ====================
  CommandCollection: null,
  CommandSchemaSetting: null,
  CommandSortSetting: null,
  CommandAdvancedSetting: null,
  CommandIndexDBManagement: null,
  CommandDBWatcher: null,
  CommandDataSourceSetting: null,
  CommandDBWatcherFilterSetting: null,
  CommandIndexKeyList: null,
  CommandDrama: null,
  CommandTopicker: null,
  CommandVectorSearchConfig: null,
  CommandUnion: null,
  CommandCollectionMonitor: null,

  // ==================== Command 클래스 (사전 관리) ====================
  CommandUserDic: null,
  CommandUserCnDic: null,
  CommandUserSwDic: null,
  CommandUserPreMorph: null,
  CommandBannedWord: null,
  CommandStopword: null,
  CommandRedirect: null,
  CommandRecommend: null,
  CommandThesaurus: null,
  CommandCategoryRanking: null,
  CommandDocumentRanking: null,
  CommandKeywordProfile: null,

  // ==================== Command 클래스 (검색 튜닝/프로파일) ====================
  CommandProfile: null,
  CommandSearchSimulation: null,
  CommandSearchRequest: null,
  CommandIntegratedInfo: null,

  // ==================== Command 클래스 (시스템 관리) ====================
  CommandScheduleTask: null,
  CommandServerSetting: null,
  CommandBrokerSetting: null,
  CommandLogSetting: null,
  CommandSystemManagement: null,
  CommandReport: null,
  CommandStatus: null,
  CommandGetDashBoardResource: null,

  // ==================== Command 클래스 (기존) ====================
  CommandCollectionInfoServer: null,
  CommandIndexTaskServer: null,
  CommandSimulationQueryManagement: null,

  // ==================== DB Handler 클래스 (핵심 관리) ====================
  AuthorityDB: null,
  ScheduleTaskDB: null,
  AccountManagementDB: null,
  WebManagerPropertiesDB: null,
  IndexLogDB: null,
  IndexingJobDB: null,

  // ==================== DB Handler 클래스 (사전 관리) ====================
  UserDicDB: null,
  ThesaurusDB: null,
  BannedWordDB: null,
  StopwordDB: null,
  RedirectDB: null,
  RecommendDB: null,
  CategoryRankingDB: null,
  DocumentRankingDB: null,
  KeywordProfileDB: null,
  CategoryUpdateSettingDB: null,

  // ==================== DB Handler 클래스 (컬렉션/모니터링) ====================
  CollectionGroupDB: null,
  TrendsSettingDB: null,
  TrendsDeleteDB: null,
  RecommendUpdateSettingDB: null,

  // ==================== DB Handler 클래스 (로그/분석) ====================
  FullQueryLogDB: null,
  TimeoutQueryLogDB: null,
  PopularQueryLogDB: null,
  ZeitgeistQueryLogDB: null,
  FailQueryLogDB: null,
  JobLogDB: null,
  ErrorLogDB: null,
  NoticeLogDB: null,
  MonitorAlarmLogDB: null,
  QueryLogGroupDB: null,
  RapidFreqIndexKeywordDB: null,

  // ==================== Entity 클래스 ====================
  Member: null,
  ScheduleTask: null,
  CollectionMonitor: null,
  CollectionAuthoritySet: null,
  CollectionInfo: null,
  CollectionSetting: null,
  CollectionType: null,
  SchemaSetting: null,
  DefaultProfileInfo: null,
  MonitorAlarmLog: null,

  // ==================== Utility 클래스 ====================
  JSonBuilder: null,
  RequestHandler: null,
  JobDescription: null,
  ConnectionFactory: null,
  RdbmsProperties: null,

  // ==================== 기본 Java 클래스 ====================
  ArrayList: null,
  HashMap: null,
  String: null,

  // ==================== 검색 관련 클래스 ====================
  SearchRequest: null,
  SearchResult: null,
  QuerySet: null,

  // ==================== 컬렉션 관리 클래스 ====================
  CollectionManager: null,
  IndexInfo: null,
  IndexManager: null
};

/**
 * Java 클래스 로더 초기화
 * Mariner5 라이브러리를 클래스패스에 추가하고 필요한 클래스 로드
 */
export async function initializeJavaClasses() {
  if (jvmState.initialized) {
    logger.warn('Java classes already initialized');
    return true;
  }

  try {
    jvmState.startTime = Date.now();
    logger.info('Initializing Java environment...');

    // 환경 정보 로깅
    logger.debug(`Platform: ${os.platform()}`);
    logger.debug(`MARINER5_HOME: ${MARINER5_HOME}`);
    logger.debug(`JAVA_HOME: ${process.env.JAVA_HOME || 'Not set'}`);

    // Mariner5 JAR 파일들을 클래스패스에 추가
    const libDir = path.join(MARINER5_HOME, 'lib');
    const jarFiles = [
      'commons.jar',
      'dqdic-1.2.0.jar',
      'jwsdp.jar',
      'm5_mgr.jar',
      'm5_client.jar',
      'm5_server.jar',
      'm5_common.jar',
      'm5_util.jar',
      'm5_core.jar',
      'm5_framework.jar',
      'm5_extension.jar',
      'gson-2.9.1.jar',
      'logback-classic-1.2.13.jar',
      'logback-core-1.2.13.jar',
      'lucene-core-9.10.0.jar',
      'jdom.jar'
    ];

    let loadedCount = 0;
    for (const jar of jarFiles) {
      try {
        java.classpath.push(path.join(libDir, jar));
        loadedCount++;
      } catch (error) {
        logger.warn(`Failed to load JAR: ${jar}`, error.message);
      }
    }
    logger.debug(`Loaded ${loadedCount}/${jarFiles.length} JAR files`);

    // 주요 클래스 로드 (재시도 로직 포함)
    const classesToLoad = [
      // AdminServer
      { name: 'AdminServerClient', class: 'com.diquest.ir5.client.command.AdminServerClient' },

      // Command - 컬렉션 관리 (15개)
      { name: 'CommandCollection', class: 'com.diquest.ir5.client.command.collection.CommandCollection' },
      { name: 'CommandSchemaSetting', class: 'com.diquest.ir5.client.command.collection.CommandSchemaSetting' },
      { name: 'CommandSortSetting', class: 'com.diquest.ir5.client.command.collection.CommandSortSetting' },
      { name: 'CommandAdvancedSetting', class: 'com.diquest.ir5.client.command.collection.CommandAdvancedSetting' },
      { name: 'CommandIndexDBManagement', class: 'com.diquest.ir5.client.command.collection.CommandIndexDBManagement' },
      { name: 'CommandDBWatcher', class: 'com.diquest.ir5.client.command.collection.CommandDBWatcher' },
      { name: 'CommandDataSourceSetting', class: 'com.diquest.ir5.client.command.collection.CommandDataSourceSetting' },
      { name: 'CommandDBWatcherFilterSetting', class: 'com.diquest.ir5.client.command.collection.CommandDBWatcherFilterSetting' },
      { name: 'CommandIndexKeyList', class: 'com.diquest.ir5.client.command.collection.CommandIndexKeyList' },
      { name: 'CommandDrama', class: 'com.diquest.ir5.client.command.collection.CommandDrama' },
      { name: 'CommandTopicker', class: 'com.diquest.ir5.client.command.collection.CommandTopicker' },
      { name: 'CommandVectorSearchConfig', class: 'com.diquest.ir5.client.command.collection.CommandVectorSearchConfig' },
      { name: 'CommandUnion', class: 'com.diquest.ir5.client.command.collection.CommandUnion' },
      { name: 'CommandCollectionMonitor', class: 'com.diquest.ir5.client.command.collection.CommandCollectionMonitor' },

      // Command - 사전 관리 (12개)
      { name: 'CommandUserDic', class: 'com.diquest.ir5.client.command.dictionary.CommandUserDic' },
      { name: 'CommandUserCnDic', class: 'com.diquest.ir5.client.command.dictionary.CommandUserCnDic' },
      { name: 'CommandUserSwDic', class: 'com.diquest.ir5.client.command.dictionary.CommandUserSwDic' },
      { name: 'CommandUserPreMorph', class: 'com.diquest.ir5.client.command.dictionary.CommandUserPreMorph' },
      { name: 'CommandBannedWord', class: 'com.diquest.ir5.client.command.dictionary.CommandBannedWord' },
      { name: 'CommandStopword', class: 'com.diquest.ir5.client.command.dictionary.CommandStopword' },
      { name: 'CommandRedirect', class: 'com.diquest.ir5.client.command.dictionary.CommandRedirect' },
      { name: 'CommandRecommend', class: 'com.diquest.ir5.client.command.dictionary.CommandRecommend' },
      { name: 'CommandThesaurus', class: 'com.diquest.ir5.client.command.dictionary.CommandThesaurus' },
      { name: 'CommandCategoryRanking', class: 'com.diquest.ir5.client.command.dictionary.CommandCategoryRanking' },
      { name: 'CommandDocumentRanking', class: 'com.diquest.ir5.client.command.dictionary.CommandDocumentRanking' },
      { name: 'CommandKeywordProfile', class: 'com.diquest.ir5.client.command.dictionary.CommandKeywordProfile' },

      // Command - 검색 튜닝/프로파일 (4개)
      { name: 'CommandProfile', class: 'com.diquest.ir5.client.command.profile.CommandProfile' },
      { name: 'CommandSearchSimulation', class: 'com.diquest.ir5.client.command.CommandSearchSimulation' },
      { name: 'CommandSearchRequest', class: 'com.diquest.ir5.client.command.CommandSearchRequest' },
      { name: 'CommandIntegratedInfo', class: 'com.diquest.ir5.client.command.CommandIntegratedInfo' },

      // Command - 시스템 관리 (8개)
      { name: 'CommandScheduleTask', class: 'com.diquest.ir5.client.command.CommandScheduleTask' },
      { name: 'CommandServerSetting', class: 'com.diquest.ir5.client.command.CommandServerSetting' },
      { name: 'CommandBrokerSetting', class: 'com.diquest.ir5.client.command.CommandBrokerSetting' },
      { name: 'CommandLogSetting', class: 'com.diquest.ir5.client.command.CommandLogSetting' },
      { name: 'CommandSystemManagement', class: 'com.diquest.ir5.client.command.CommandSystemManagement' },
      { name: 'CommandReport', class: 'com.diquest.ir5.client.command.CommandReport' },
      { name: 'CommandStatus', class: 'com.diquest.ir5.client.command.CommandStatus' },
      { name: 'CommandGetDashBoardResource', class: 'com.diquest.ir5.client.command.CommandGetDashBoardResource' },

      // Command - 기존 (3개)
      { name: 'CommandCollectionInfoServer', class: 'com.diquest.ir5.client.command.CommandCollectionInfoServer' },
      { name: 'CommandIndexTaskServer', class: 'com.diquest.ir5.client.command.CommandIndexTaskServer' },
      { name: 'CommandSimulationQueryManagement', class: 'com.diquest.ir5.client.command.CommandSimulationQueryManagement' },

      // DB Handlers - 핵심 (6개)
      { name: 'AuthorityDB', class: 'com.diquest.ir5.common.database.handler.AuthorityDB' },
      { name: 'ScheduleTaskDB', class: 'com.diquest.ir5.common.database.handler.ScheduleTaskDB' },
      { name: 'AccountManagementDB', class: 'com.diquest.ir5.common.database.handler.AccountManagementDB' },
      { name: 'WebManagerPropertiesDB', class: 'com.diquest.ir5.common.database.handler.WebManagerPropertiesDB' },
      { name: 'IndexLogDB', class: 'com.diquest.ir5.common.database.handler.IndexLogDB' },
      { name: 'IndexingJobDB', class: 'com.diquest.ir5.common.database.handler.IndexingJobDB' },

      // DB Handlers - 사전 (10개)
      { name: 'UserDicDB', class: 'com.diquest.ir5.common.database.handler.UserDicDB' },
      { name: 'ThesaurusDB', class: 'com.diquest.ir5.common.database.handler.ThesaurusDB' },
      { name: 'BannedWordDB', class: 'com.diquest.ir5.common.database.handler.BannedWordDB' },
      { name: 'StopwordDB', class: 'com.diquest.ir5.common.database.handler.StopwordDB' },
      { name: 'RedirectDB', class: 'com.diquest.ir5.common.database.handler.RedirectDB' },
      { name: 'RecommendDB', class: 'com.diquest.ir5.common.database.handler.RecommendDB' },
      { name: 'CategoryRankingDB', class: 'com.diquest.ir5.common.database.handler.CategoryRankingDB' },
      { name: 'DocumentRankingDB', class: 'com.diquest.ir5.common.database.handler.DocumentRankingDB' },
      { name: 'KeywordProfileDB', class: 'com.diquest.ir5.common.database.handler.KeywordProfileDB' },
      { name: 'CategoryUpdateSettingDB', class: 'com.diquest.ir5.common.database.handler.CategoryUpdateSettingDB' },

      // DB Handlers - 컬렉션/모니터링 (4개)
      { name: 'CollectionGroupDB', class: 'com.diquest.ir5.common.database.handler.CollectionGroupDB' },
      { name: 'TrendsSettingDB', class: 'com.diquest.ir5.common.database.handler.TrendsSettingDB' },
      { name: 'TrendsDeleteDB', class: 'com.diquest.ir5.common.database.handler.TrendsDeleteDB' },
      { name: 'RecommendUpdateSettingDB', class: 'com.diquest.ir5.common.database.handler.RecommendUpdateSettingDB' },

      // DB Handlers - 로그/분석 (11개)
      { name: 'FullQueryLogDB', class: 'com.diquest.ir5.common.database.handler.FullQueryLogDB' },
      { name: 'TimeoutQueryLogDB', class: 'com.diquest.ir5.common.database.handler.TimeoutQueryLogDB' },
      { name: 'PopularQueryLogDB', class: 'com.diquest.ir5.common.database.handler.PopularQueryLogDB' },
      { name: 'ZeitgeistQueryLogDB', class: 'com.diquest.ir5.common.database.handler.ZeitgeistQueryLogDB' },
      { name: 'FailQueryLogDB', class: 'com.diquest.ir5.common.database.handler.FailQueryLogDB' },
      { name: 'JobLogDB', class: 'com.diquest.ir5.common.database.handler.JobLogDB' },
      { name: 'ErrorLogDB', class: 'com.diquest.ir5.common.database.handler.ErrorLogDB' },
      { name: 'NoticeLogDB', class: 'com.diquest.ir5.common.database.handler.NoticeLogDB' },
      { name: 'MonitorAlarmLogDB', class: 'com.diquest.ir5.common.database.handler.MonitorAlarmLogDB' },
      { name: 'QueryLogGroupDB', class: 'com.diquest.ir5.common.database.handler.QueryLogGroupDB' },
      { name: 'RapidFreqIndexKeywordDB', class: 'com.diquest.ir5.common.database.handler.RapidFreqIndexKeywordDB' },

      // Utility 클래스 (5개)
      { name: 'JSonBuilder', class: 'com.diquest.ir5.util.common.JSonBuilder' },
      { name: 'RequestHandler', class: 'com.diquest.ir5.client.util.RequestHandler' },
      { name: 'JobDescription', class: 'com.diquest.ir5.client.util.JobDescription' },
      { name: 'ConnectionFactory', class: 'com.diquest.ir5.common.database.factory.ConnectionFactory' },
      { name: 'RdbmsProperties', class: 'com.diquest.ir5.common.database.config.RdbmsProperties' }
    ];

    for (const { name, class: className } of classesToLoad) {
      try {
        javaClasses[name] = java.import(className);
        logger.debug(`Loaded class: ${name}`);
      } catch (error) {
        const { type, retryable } = classifyError(error);
        logger.error(`Failed to load class ${name}`, `Type: ${type}, Retryable: ${retryable}`);
        throw new JNIError('CLASS_LOAD_FAILED', `Failed to load ${name}: ${error.message}`, error, retryable);
      }
    }

    // 기본 Java 클래스
    javaClasses.ArrayList = java.import('java.util.ArrayList');
    javaClasses.HashMap = java.import('java.util.HashMap');
    javaClasses.String = java.import('java.lang.String');

    // GC 시작
    startGarbageCollection();

    jvmState.initialized = true;
    logger.info('Java classes loaded successfully');
    return true;
  } catch (error) {
    jvmState.errorCount++;
    jvmState.lastError = {
      message: error.message,
      type: error.type || 'UNKNOWN',
      timestamp: new Date().toISOString()
    };
    logger.error('Failed to initialize Java classes:', error.message);
    throw error;
  }
}

/**
 * AdminServer 클라이언트 인스턴스 맵 (다중 인스턴스 지원)
 * key: "${host}:${port}", value: AdminServerClient 인스턴스
 */
const adminServerClientInstances = new Map();

/**
 * AdminServer 클라이언트 인스턴스 획득 (재시도 로직 포함)
 * @param {string} host - 서버 호스트 (기본: localhost)
 * @param {number} port - 서버 포트 (기본: 5555)
 * @param {number} retries - 재시도 횟수
 * @returns {Promise<object>} AdminServerClient 인스턴스
 */
export async function getAdminServerClient(host = 'localhost', port = 5555, retries = CONFIG.MAX_RETRIES) {
  const clientKey = `${host}:${port}`;
  const existingClient = adminServerClientInstances.get(clientKey);

  if (existingClient && jvmState.initialized) {
    logger.debug(`Using cached AdminServerClient: ${clientKey}`);
    return existingClient;
  }

  return withRetry(async () => {
    try {
      logger.info(`Connecting to AdminServerClient: ${host}:${port}`);
      const newClient = new javaClasses.AdminServerClient(host, port);
      adminServerClientInstances.set(clientKey, newClient);
      jvmState.callCount++;
      logger.info(`AdminServerClient connected successfully: ${clientKey}`);
      return newClient;
    } catch (error) {
      adminServerClientInstances.delete(clientKey);
      const { type, retryable } = classifyError(error);
      throw new JNIError('ADMIN_CLIENT_FAILED', `Failed to connect AdminServerClient: ${error.message}`, error, retryable);
    }
  }, retries, 'getAdminServerClient');
}

/**
 * AdminServer 클라이언트 연결 해제
 * @param {string} host - 서버 호스트
 * @param {number} port - 서버 포트
 */
export async function disconnectAdminServerClient(host = 'localhost', port = 5555) {
  const clientKey = `${host}:${port}`;
  const client = adminServerClientInstances.get(clientKey);

  if (client) {
    try {
      if (typeof client.closeSync === 'function') {
        client.closeSync();
      }
      adminServerClientInstances.delete(clientKey);
      logger.info(`AdminServerClient disconnected: ${clientKey}`);
    } catch (error) {
      logger.warn(`Error disconnecting AdminServerClient: ${clientKey}`, error.message);
    }
  }
}

/**
 * 재시도 로직 헬퍼 함수
 * @param {Function} fn - 실행할 함수
 * @param {number} retries - 재시도 횟수
 * @param {string} operationName - 작업 이름 (로깅용)
 * @returns {Promise<any>} 함수 실행 결과
 */
async function withRetry(fn, retries = CONFIG.MAX_RETRIES, operationName = 'operation') {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.debug(`${operationName}: Attempt ${attempt}/${retries}`);
      return await fn();
    } catch (error) {
      lastError = error;
      const { type, retryable } = classifyError(error);

      if (!retryable || attempt === retries) {
        logger.error(`${operationName}: Failed after ${attempt} attempts (Type: ${type})`, error.message);
        throw error;
      }

      const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
      logger.warn(`${operationName}: Attempt ${attempt} failed, retrying in ${delay}ms (Type: ${type})`, error.message);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * 타임아웃을 포함한 Promise 래핑
 * @param {Promise} promise - Promise 객체
 * @param {number} timeoutMs - 타임아웃 (밀리초)
 * @param {string} operationName - 작업 이름
 * @returns {Promise<any>} 제한된 Promise
 */
function withTimeout(promise, timeoutMs = CONFIG.JNI_CALL_TIMEOUT, operationName = 'operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => {
        reject(new JNIError('TIMEOUT', `${operationName} timed out after ${timeoutMs}ms`, null, true));
      }, timeoutMs)
    )
  ]);
}

/**
 * Java 메서드 호출을 Promise로 래핑 (타임아웃/재시도 포함)
 * node-java의 콜백 기반 비동기를 Promise로 변환
 *
 * @param {object} javaObject - Java 객체
 * @param {string} methodName - 메서드명
 * @param {any[]} args - 메서드 인자
 * @param {number} retries - 재시도 횟수
 * @returns {Promise<any>} 메서드 실행 결과
 */
export function callJavaMethod(javaObject, methodName, args = [], retries = CONFIG.MAX_RETRIES) {
  return withRetry(async () => {
    return withTimeout(
      new Promise((resolve, reject) => {
        try {
          const method = javaObject[methodName];
          if (typeof method !== 'function') {
            reject(new JNIError('METHOD_NOT_FOUND', `Method ${methodName} not found on Java object`, null, false));
            return;
          }

          if (CONFIG.LOG_JNI_CALLS) {
            logger.debug(`Calling ${methodName} with ${args.length} arguments`);
          }

          method.call(javaObject, ...args, (err, result) => {
            if (err) {
              const { type, retryable } = classifyError(err);
              reject(new JNIError(type, `Method ${methodName} failed: ${err.message}`, err, retryable));
            } else {
              if (CONFIG.LOG_JNI_CALLS) {
                logger.debug(`${methodName} completed successfully`);
              }
              resolve(result);
            }
          });
        } catch (error) {
          const { type, retryable } = classifyError(error);
          reject(new JNIError(type, `Failed to call ${methodName}: ${error.message}`, error, retryable));
        }
      }),
      CONFIG.JNI_CALL_TIMEOUT,
      methodName
    );
  }, retries, methodName);
}

/**
 * 여러 Java 메서드를 순차 호출
 * @param {object} javaObject - Java 객체
 * @param {Array<{method: string, args: any[]}>} calls - 호출할 메서드 목록
 * @returns {Promise<any[]>} 모든 결과 배열
 */
export async function callJavaMethodSequential(javaObject, calls) {
  const results = [];

  for (const { method, args = [] } of calls) {
    try {
      const result = await callJavaMethod(javaObject, method, args);
      results.push(result);
    } catch (error) {
      logger.error(`Sequential call failed at ${method}`, error.message);
      throw error;
    }
  }

  return results;
}

/**
 * Java 컬렉션을 JavaScript 배열로 변환
 * @param {object} javaList - Java List 객체
 * @returns {Promise<any[]>} JavaScript 배열
 */
export async function javaListToArray(javaList) {
  return new Promise((resolve, reject) => {
    try {
      const size = javaList.sizeSync();
      const result = [];

      for (let i = 0; i < size; i++) {
        const item = javaList.getSync(i);
        result.push(convertJavaObject(item));
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Java 맵을 JavaScript 객체로 변환
 * @param {object} javaMap - Java Map 객체
 * @returns {object} JavaScript 객체
 */
export function javaMapToObject(javaMap) {
  try {
    const keySet = javaMap.keySetSync();
    const keys = [];
    const keyIter = keySet.iteratorSync();

    while (keyIter.hasNextSync()) {
      keys.push(String(keyIter.nextSync()));
    }

    const result = {};
    for (const key of keys) {
      const value = javaMap.getSync(key);
      result[key] = convertJavaObject(value);
    }

    return result;
  } catch (error) {
    console.error('[Java-Bridge] Error converting Java Map:', error.message);
    return {};
  }
}

/**
 * Java 객체를 JavaScript 객체로 재귀 변환
 * @param {any} javaObject - Java 객체
 * @returns {any} JavaScript 객체
 */
function convertJavaObject(javaObject) {
  if (javaObject === null || javaObject === undefined) {
    return null;
  }

  // 기본 타입
  if (typeof javaObject === 'string' || typeof javaObject === 'number' || typeof javaObject === 'boolean') {
    return javaObject;
  }

  try {
    const className = javaObject.getClassSync().getNameSync();

    // List 타입
    if (className.includes('List') || className.includes('ArrayList')) {
      const result = [];
      const size = javaObject.sizeSync ? javaObject.sizeSync() : 0;
      for (let i = 0; i < size; i++) {
        result.push(convertJavaObject(javaObject.getSync(i)));
      }
      return result;
    }

    // Map 타입
    if (className.includes('Map') || className.includes('HashMap')) {
      return javaMapToObject(javaObject);
    }

    // String 타입
    if (className === 'java.lang.String' || className === 'String') {
      return String(javaObject);
    }

    // 그 외 객체
    return String(javaObject);
  } catch (error) {
    return String(javaObject);
  }
}

/**
 * JNI 정리 및 종료
 * 모든 JVM 자원 정리, GC 중지 등
 */
export async function cleanupJNI() {
  try {
    logger.info('Cleaning up JNI resources...');

    // GC 중지
    stopGarbageCollection();

    // 모든 AdminServer 클라이언트 정리
    for (const [clientKey, client] of adminServerClientInstances) {
      try {
        logger.debug(`Closing AdminServerClient: ${clientKey}`);
        if (typeof client.closeSync === 'function') {
          client.closeSync();
        }
      } catch (error) {
        logger.warn(`Error closing AdminServerClient: ${clientKey}`, error.message);
      }
    }
    adminServerClientInstances.clear();

    // 상태 리셋
    jvmState.initialized = false;
    jvmState.adminClientReady = false;

    logger.info('JNI cleanup completed');
  } catch (error) {
    logger.error('Error during JNI cleanup:', error.message);
  }
}

/**
 * JNI 상태 진단 정보 반환
 */
export function getDiagnostics() {
  return {
    status: getJVMStatus(),
    config: {
      timeout: CONFIG.JNI_CALL_TIMEOUT,
      maxRetries: CONFIG.MAX_RETRIES,
      retryDelay: CONFIG.RETRY_DELAY,
      gcEnabled: CONFIG.ENABLE_GC,
      debugMode: CONFIG.DEBUG_MODE
    },
    classpath: {
      mariner5Home: MARINER5_HOME,
      platform: os.platform(),
      nodeVersion: process.version
    }
  };
}

export {
  logger,
  JNIError
};

export default {
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
  getDiagnostics,
  JNIError,
  withRetry,
  logger
};
