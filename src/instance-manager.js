/**
 * instance-manager.js - JNI 멀티 인스턴스 관리
 *
 * 여러 Mariner5 AdminServerClient 인스턴스를 관리하는 고수준 관리자
 * - 인스턴스 생성/삭제/조회
 * - 연결 풀 관리
 * - 상태 추적 및 모니터링
 */

import { v4 as uuidv4 } from 'uuid';
import { getAdminServerClient, cleanupJNI as cleanupJNIBridge, logger } from './java-bridge.js';

/**
 * 인스턴스 컨텍스트
 */
class InstanceContext {
  constructor(id, config) {
    this.id = id;
    this.config = config;
    this.adminClient = null;
    this.state = 'CREATED'; // CREATED, CONNECTING, CONNECTED, ERROR, CLOSED
    this.metadata = {
      createdAt: new Date().toISOString(),
      name: config.name || id,
      host: config.host || 'localhost',
      port: config.port || 5555
    };
    this.stats = {
      callCount: 0,
      errorCount: 0,
      lastUsed: null
    };
  }

  isAlive() {
    return this.state === 'CONNECTED' && this.adminClient !== null;
  }

  isBusy() {
    return this.state === 'CONNECTING';
  }

  isAvailable() {
    return this.isAlive() && !this.isBusy();
  }
}

/**
 * 연결 풀
 */
class ConnectionPool {
  constructor(maxConnections = 10) {
    this.maxConnections = maxConnections;
    this.instances = new Map(); // id → InstanceContext
    this.idleInstances = new Set(); // 사용 가능한 인스턴스
    this.activeInstances = new Set(); // 사용 중인 인스턴스
    this.monitorInterval = null;
  }

  add(context) {
    if (this.instances.size >= this.maxConnections) {
      throw new Error(`Connection pool is full (max: ${this.maxConnections})`);
    }
    this.instances.set(context.id, context);
    this.idleInstances.add(context.id);
  }

  remove(id) {
    this.instances.delete(id);
    this.idleInstances.delete(id);
    this.activeInstances.delete(id);
  }

  acquire(id) {
    const context = this.instances.get(id);
    if (!context) {
      throw new Error(`Instance not found: ${id}`);
    }
    if (!context.isAvailable()) {
      throw new Error(`Instance not available: ${id} (state: ${context.state})`);
    }
    this.idleInstances.delete(id);
    this.activeInstances.add(id);
    return context;
  }

  release(id) {
    this.activeInstances.delete(id);
    const context = this.instances.get(id);
    if (context && context.isAlive()) {
      this.idleInstances.add(id);
    }
  }

  getStats() {
    return {
      total: this.instances.size,
      idle: this.idleInstances.size,
      active: this.activeInstances.size,
      maxConnections: this.maxConnections
    };
  }

  getInstanceStats() {
    const stats = [];
    for (const [id, context] of this.instances) {
      stats.push({
        id: context.id,
        name: context.metadata.name,
        state: context.state,
        host: context.metadata.host,
        port: context.metadata.port,
        callCount: context.stats.callCount,
        errorCount: context.stats.errorCount,
        lastUsed: context.stats.lastUsed,
        createdAt: context.metadata.createdAt
      });
    }
    return stats;
  }

  startMonitoring(interval = 30000) {
    if (this.monitorInterval) return;

    this.monitorInterval = setInterval(() => {
      for (const [id, context] of this.instances) {
        if (context.state === 'ERROR' || context.state === 'CLOSED') {
          // 상태가 좋지 않은 인스턴스 정리
          logger.warn(`Cleaning up unhealthy instance: ${id} (state: ${context.state})`);
          this.remove(id);
        }
      }
    }, interval);

    logger.info(`Connection pool monitoring started (interval: ${interval}ms)`);
  }

  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      logger.info('Connection pool monitoring stopped');
    }
  }

  clear() {
    this.instances.clear();
    this.idleInstances.clear();
    this.activeInstances.clear();
  }
}

/**
 * 멀티 인스턴스 관리자
 */
class InstanceManager {
  constructor(maxConnections = 10) {
    this.pool = new ConnectionPool(maxConnections);
    this.defaultInstanceId = null;
    this.javaClassesInitialized = false;
  }

  /**
   * 새 인스턴스 생성
   * @param {object} config - 설정 {host, port, name}
   * @returns {Promise<string>} 인스턴스 ID
   */
  async createInstance(config = {}) {
    const id = uuidv4();
    const context = new InstanceContext(id, config);

    try {
      context.state = 'CONNECTING';
      const adminClient = await getAdminServerClient(
        config.host || 'localhost',
        config.port || 5555
      );

      context.adminClient = adminClient;
      context.state = 'CONNECTED';

      this.pool.add(context);

      // 첫 번째 인스턴스를 기본값으로 설정
      if (!this.defaultInstanceId) {
        this.defaultInstanceId = id;
        logger.info(`Default instance set to: ${id}`);
      }

      logger.info(`Instance created successfully: ${id}`);
      return id;
    } catch (error) {
      context.state = 'ERROR';
      context.stats.errorCount++;
      logger.error(`Failed to create instance: ${id}`, error.message);
      throw error;
    }
  }

  /**
   * 인스턴스 획득
   * @param {string} instanceId - 인스턴스 ID (선택사항, 생략 시 기본값)
   * @returns {object} InstanceContext
   */
  getInstance(instanceId = null) {
    const id = instanceId || this.defaultInstanceId;

    if (!id) {
      throw new Error('No instance available. Create an instance first.');
    }

    return this.pool.acquire(id);
  }

  /**
   * 인스턴스 사용 완료
   * @param {string} instanceId - 인스턴스 ID
   */
  releaseInstance(instanceId) {
    this.pool.release(instanceId);
  }

  /**
   * 인스턴스 삭제
   * @param {string} instanceId - 인스턴스 ID
   * @returns {Promise<void>}
   */
  async deleteInstance(instanceId) {
    const context = this.pool.instances.get(instanceId);
    if (!context) {
      throw new Error(`Instance not found: ${instanceId}`);
    }

    try {
      if (context.adminClient && typeof context.adminClient.closeSync === 'function') {
        context.adminClient.closeSync();
      }
      context.state = 'CLOSED';
      this.pool.remove(instanceId);

      // 기본 인스턴스가 삭제되면 다른 인스턴스로 변경
      if (this.defaultInstanceId === instanceId) {
        const remainingIds = Array.from(this.pool.instances.keys());
        this.defaultInstanceId = remainingIds.length > 0 ? remainingIds[0] : null;
        if (this.defaultInstanceId) {
          logger.info(`Default instance changed to: ${this.defaultInstanceId}`);
        }
      }

      logger.info(`Instance deleted: ${instanceId}`);
    } catch (error) {
      logger.error(`Error deleting instance: ${instanceId}`, error.message);
      throw error;
    }
  }

  /**
   * 모든 인스턴스 조회
   * @returns {Array} 인스턴스 정보 배열
   */
  listInstances() {
    return this.pool.getInstanceStats();
  }

  /**
   * 기본 인스턴스 ID 설정
   * @param {string} instanceId - 인스턴스 ID
   */
  setDefaultInstance(instanceId) {
    const context = this.pool.instances.get(instanceId);
    if (!context) {
      throw new Error(`Instance not found: ${instanceId}`);
    }
    this.defaultInstanceId = instanceId;
    logger.info(`Default instance set to: ${instanceId}`);
  }

  /**
   * 기본 인스턴스 ID 조회
   * @returns {string|null} 기본 인스턴스 ID
   */
  getDefaultInstanceId() {
    return this.defaultInstanceId;
  }

  /**
   * 풀 상태 조회
   * @returns {object} 풀 통계
   */
  getPoolStats() {
    return {
      pool: this.pool.getStats(),
      instances: this.pool.getInstanceStats(),
      defaultInstanceId: this.defaultInstanceId
    };
  }

  /**
   * 풀 모니터링 시작
   * @param {number} interval - 모니터링 간격 (ms)
   */
  startMonitoring(interval = 30000) {
    this.pool.startMonitoring(interval);
  }

  /**
   * 풀 모니터링 중지
   */
  stopMonitoring() {
    this.pool.stopMonitoring();
  }

  /**
   * 모든 인스턴스 정리 및 종료
   * @returns {Promise<void>}
   */
  async cleanup() {
    try {
      logger.info('Cleaning up all instances...');

      this.stopMonitoring();

      const instanceIds = Array.from(this.pool.instances.keys());
      for (const id of instanceIds) {
        try {
          await this.deleteInstance(id);
        } catch (error) {
          logger.warn(`Error deleting instance during cleanup: ${id}`, error.message);
        }
      }

      await cleanupJNIBridge();
      this.pool.clear();
      this.defaultInstanceId = null;

      logger.info('All instances cleaned up successfully');
    } catch (error) {
      logger.error('Error during cleanup', error.message);
      throw error;
    }
  }
}

// 전역 인스턴스 관리자 (싱글톤)
let globalManager = null;

/**
 * 글로벌 인스턴스 관리자 획득
 * @param {number} maxConnections - 최대 연결 수
 * @returns {InstanceManager}
 */
export function getInstanceManager(maxConnections = 10) {
  if (!globalManager) {
    globalManager = new InstanceManager(maxConnections);
  }
  return globalManager;
}

/**
 * 인스턴스 관리자 리셋 (테스트용)
 */
export function resetInstanceManager() {
  globalManager = null;
}

export {
  InstanceManager,
  InstanceContext,
  ConnectionPool
};

export default {
  getInstanceManager,
  resetInstanceManager,
  InstanceManager,
  InstanceContext,
  ConnectionPool
};
