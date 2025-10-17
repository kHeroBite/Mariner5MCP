/**
 * connection-manager.js - 멀티 인스턴스 AdminServerClient 관리자
 *
 * 여러 Mariner5 서버에 대한 AdminServerClient 인스턴스를 관리
 * 각 서버별로 독립적인 연결을 유지하고 상태를 추적
 */

import { getAdminServerClient, getJVMStatus, javaClasses } from './java-bridge.js';

/**
 * 연결 정보 객체
 */
class ServerConnection {
  constructor(name, host, port, description = '') {
    this.name = name;
    this.host = host;
    this.port = port;
    this.description = description;
    this.client = null;
    this.connected = false;
    this.error = null;
    this.lastConnectTime = null;
    this.callCount = 0;
    this.errorCount = 0;
  }
}

/**
 * 멀티 인스턴스 관리자
 */
class ConnectionManager {
  constructor() {
    this.connections = new Map();
    this.defaultServer = 'local';
  }

  /**
   * 서버 등록 및 연결
   * @param {string} name - 서버 이름 (고유키)
   * @param {string} host - 호스트 주소
   * @param {number} port - 포트 번호
   * @param {string} description - 설명
   * @returns {Promise<ServerConnection>}
   */
  async addServer(name, host, port, description = '') {
    try {
      if (this.connections.has(name)) {
        throw new Error(`Server '${name}' already exists`);
      }

      console.error(`[ConnectionMgr] Connecting to server: ${name} (${host}:${port})`);

      const connection = new ServerConnection(name, host, port, description);

      try {
        // AdminServerClient 연결 시도
        connection.client = await getAdminServerClient(host, port);
        connection.connected = true;
        connection.lastConnectTime = new Date().toISOString();
        connection.error = null;

        console.error(`[ConnectionMgr] Connected successfully: ${name}`);
      } catch (error) {
        connection.connected = false;
        connection.error = error.message;
        console.error(`[ConnectionMgr] Connection failed: ${name} - ${error.message}`);
        throw error;
      }

      this.connections.set(name, connection);
      return connection;
    } catch (error) {
      console.error(`[ConnectionMgr] Error adding server '${name}':`, error.message);
      throw error;
    }
  }

  /**
   * 서버별 AdminServerClient 클라이언트 반환
   * @param {string} serverName - 서버 이름 (기본값: default)
   * @returns {object} AdminServerClient 인스턴스
   * @throws {Error} 서버를 찾을 수 없음
   */
  getClient(serverName = null) {
    const name = serverName || this.defaultServer;

    if (!this.connections.has(name)) {
      throw new Error(`Server '${name}' not found. Available servers: ${Array.from(this.connections.keys()).join(', ')}`);
    }

    const connection = this.connections.get(name);

    if (!connection.connected) {
      throw new Error(`Server '${name}' is not connected. Error: ${connection.error}`);
    }

    if (!connection.client) {
      throw new Error(`Server '${name}' has no client instance`);
    }

    connection.callCount++;
    return connection.client;
  }

  /**
   * 특정 서버 연결 제거
   * @param {string} name - 서버 이름
   */
  async removeServer(name) {
    try {
      if (!this.connections.has(name)) {
        throw new Error(`Server '${name}' not found`);
      }

      const connection = this.connections.get(name);

      // 클라이언트 정리
      if (connection.client && typeof connection.client.close === 'function') {
        try {
          connection.client.closeSync();
        } catch (error) {
          console.error(`[ConnectionMgr] Error closing client for '${name}':`, error.message);
        }
      }

      this.connections.delete(name);
      console.error(`[ConnectionMgr] Server removed: ${name}`);
    } catch (error) {
      console.error(`[ConnectionMgr] Error removing server '${name}':`, error.message);
      throw error;
    }
  }

  /**
   * 등록된 모든 서버 목록 반환
   * @returns {string[]} 서버 이름 배열
   */
  listServers() {
    return Array.from(this.connections.keys());
  }

  /**
   * 모든 서버 정보 반환
   * @returns {object[]} 서버 정보 배열
   */
  getAllServers() {
    return Array.from(this.connections.values()).map(conn => ({
      name: conn.name,
      host: conn.host,
      port: conn.port,
      description: conn.description,
      connected: conn.connected,
      error: conn.error,
      lastConnectTime: conn.lastConnectTime,
      callCount: conn.callCount,
      errorCount: conn.errorCount
    }));
  }

  /**
   * 특정 서버 상태 조회
   * @param {string} serverName - 서버 이름 (기본값: default)
   * @returns {object} 서버 상태 정보
   */
  getServerStatus(serverName = null) {
    const name = serverName || this.defaultServer;

    if (!this.connections.has(name)) {
      return { error: `Server '${name}' not found` };
    }

    const connection = this.connections.get(name);

    return {
      name: connection.name,
      host: connection.host,
      port: connection.port,
      description: connection.description,
      connected: connection.connected,
      error: connection.error,
      lastConnectTime: connection.lastConnectTime,
      callCount: connection.callCount,
      errorCount: connection.errorCount,
      jvmStatus: connection.connected ? getJVMStatus() : null
    };
  }

  /**
   * 특정 서버 재연결
   * @param {string} serverName - 서버 이름
   * @returns {Promise<ServerConnection>}
   */
  async reconnect(serverName = null) {
    const name = serverName || this.defaultServer;

    if (!this.connections.has(name)) {
      throw new Error(`Server '${name}' not found`);
    }

    const connection = this.connections.get(name);

    try {
      console.error(`[ConnectionMgr] Reconnecting to server: ${name}`);

      // 기존 연결 정리
      if (connection.client && typeof connection.client.close === 'function') {
        try {
          connection.client.closeSync();
        } catch (error) {
          // 무시
        }
      }

      // 새로 연결
      connection.client = await getAdminServerClient(connection.host, connection.port);
      connection.connected = true;
      connection.lastConnectTime = new Date().toISOString();
      connection.error = null;

      console.error(`[ConnectionMgr] Reconnected successfully: ${name}`);
      return connection;
    } catch (error) {
      connection.connected = false;
      connection.error = error.message;
      connection.errorCount++;

      console.error(`[ConnectionMgr] Reconnection failed: ${name} - ${error.message}`);
      throw error;
    }
  }

  /**
   * 기본 서버 설정
   * @param {string} serverName - 서버 이름
   */
  setDefaultServer(serverName) {
    if (!this.connections.has(serverName)) {
      throw new Error(`Server '${serverName}' not found`);
    }

    this.defaultServer = serverName;
    console.error(`[ConnectionMgr] Default server set to: ${serverName}`);
  }

  /**
   * 기본 서버명 반환
   * @returns {string} 기본 서버 이름
   */
  getDefaultServer() {
    return this.defaultServer;
  }

  /**
   * 모든 서버 연결 종료
   * @returns {Promise<void>}
   */
  async closeAll() {
    try {
      console.error('[ConnectionMgr] Closing all connections...');

      for (const [name, connection] of this.connections.entries()) {
        if (connection.client && typeof connection.client.close === 'function') {
          try {
            connection.client.closeSync();
            console.error(`[ConnectionMgr] Closed: ${name}`);
          } catch (error) {
            console.error(`[ConnectionMgr] Error closing '${name}':`, error.message);
          }
        }
      }

      this.connections.clear();
      console.error('[ConnectionMgr] All connections closed');
    } catch (error) {
      console.error('[ConnectionMgr] Error closing all connections:', error.message);
      throw error;
    }
  }

  /**
   * 연결 통계
   * @returns {object} 통계 정보
   */
  getStatistics() {
    let totalCalls = 0;
    let totalErrors = 0;
    let connectedCount = 0;

    for (const conn of this.connections.values()) {
      totalCalls += conn.callCount;
      totalErrors += conn.errorCount;
      if (conn.connected) connectedCount++;
    }

    return {
      totalServers: this.connections.size,
      connectedServers: connectedCount,
      disconnectedServers: this.connections.size - connectedCount,
      totalCalls,
      totalErrors,
      errorRate: this.connections.size > 0 ? ((totalErrors / (totalCalls + totalErrors)) * 100).toFixed(2) + '%' : 'N/A'
    };
  }
}

// 싱글톤 인스턴스
export const connectionManager = new ConnectionManager();

export default {
  connectionManager,
  ServerConnection
};
