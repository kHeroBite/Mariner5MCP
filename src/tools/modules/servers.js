/**
 * servers.js - 멀티 인스턴스 서버 관리 도구
 *
 * ConnectionManager를 통해 등록된 Mariner5 서버들을 관리하고 상태를 조회하는 도구들
 */

import { ok, fail, makeValidator } from '../../utils.js';
import { connectionManager } from '../../connection-manager.js';

export const servers = {
  /**
   * 등록된 모든 서버 목록 조회
   */
  'servers.list': {
    schema: {
      type: 'object',
      properties: {}
    },
    handler: async (input) => {
      try {
        const serverList = connectionManager.getAllServers();
        return ok('/servers', input, {
          servers: serverList,
          totalCount: serverList.length,
          defaultServer: connectionManager.getDefaultServer()
        });
      } catch (error) {
        return fail('E_TOOL', 'Failed to list servers', { error: error.message });
      }
    }
  },

  /**
   * 특정 서버 상태 조회
   */
  'servers.status': {
    schema: {
      type: 'object',
      properties: {
        server: { type: 'string', description: '서버 이름' }
      }
    },
    handler: async (input) => {
      try {
        const serverName = input.server;
        const status = connectionManager.getServerStatus(serverName);

        if (status.error) {
          return fail('E_TOOL', `Server '${serverName}' not found`, status);
        }

        return ok('/servers/status', input, status);
      } catch (error) {
        return fail('E_TOOL', 'Failed to get server status', { error: error.message });
      }
    }
  },

  /**
   * 런타임 서버 추가
   */
  'servers.add': {
    schema: {
      type: 'object',
      required: ['name', 'host', 'port'],
      properties: {
        name: { type: 'string', description: '서버 이름' },
        host: { type: 'string', description: '호스트 주소 (IP 또는 도메인)' },
        port: { type: 'integer', description: '포트 번호' },
        description: { type: 'string', description: '설명 (선택사항)' }
      }
    },
    handler: async (input) => {
      try {
        makeValidator({
          type: 'object',
          required: ['name', 'host', 'port'],
          properties: {
            name: { type: 'string' },
            host: { type: 'string' },
            port: { type: 'integer', minimum: 1, maximum: 65535 },
            description: { type: 'string' }
          }
        })(input);

        const connection = await connectionManager.addServer(
          input.name,
          input.host,
          input.port,
          input.description || ''
        );

        return ok('/servers', input, {
          message: `Server '${input.name}' added successfully`,
          server: {
            name: connection.name,
            host: connection.host,
            port: connection.port,
            description: connection.description,
            connected: connection.connected
          }
        });
      } catch (error) {
        return fail('E_TOOL', 'Failed to add server', { error: error.message });
      }
    }
  },

  /**
   * 서버 제거
   */
  'servers.remove': {
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', description: '서버 이름' }
      }
    },
    handler: async (input) => {
      try {
        makeValidator({
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' }
          }
        })(input);

        await connectionManager.removeServer(input.name);

        return ok('/servers', input, {
          message: `Server '${input.name}' removed successfully`
        });
      } catch (error) {
        return fail('E_TOOL', 'Failed to remove server', { error: error.message });
      }
    }
  },

  /**
   * 서버 재연결
   */
  'servers.reconnect': {
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', description: '서버 이름' }
      }
    },
    handler: async (input) => {
      try {
        makeValidator({
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' }
          }
        })(input);

        const connection = await connectionManager.reconnect(input.name);

        return ok('/servers/reconnect', input, {
          message: `Server '${input.name}' reconnected successfully`,
          server: {
            name: connection.name,
            host: connection.host,
            port: connection.port,
            connected: connection.connected,
            lastConnectTime: connection.lastConnectTime
          }
        });
      } catch (error) {
        return fail('E_TOOL', 'Failed to reconnect server', { error: error.message });
      }
    }
  },

  /**
   * 기본 서버 설정
   */
  'servers.setDefault': {
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', description: '서버 이름' }
      }
    },
    handler: async (input) => {
      try {
        makeValidator({
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' }
          }
        })(input);

        connectionManager.setDefaultServer(input.name);

        return ok('/servers/default', input, {
          message: `Default server set to '${input.name}'`,
          defaultServer: input.name
        });
      } catch (error) {
        return fail('E_TOOL', 'Failed to set default server', { error: error.message });
      }
    }
  },

  /**
   * 모든 서버 통계
   */
  'servers.statistics': {
    schema: {
      type: 'object',
      properties: {}
    },
    handler: async (input) => {
      try {
        const stats = connectionManager.getStatistics();
        const servers = connectionManager.getAllServers();

        return ok('/servers/statistics', input, {
          summary: stats,
          servers: servers.map(s => ({
            name: s.name,
            connected: s.connected,
            callCount: s.callCount,
            errorCount: s.errorCount,
            lastConnectTime: s.lastConnectTime
          }))
        });
      } catch (error) {
        return fail('E_TOOL', 'Failed to get statistics', { error: error.message });
      }
    }
  }
};

export default servers;
