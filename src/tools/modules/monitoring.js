/**
 * monitoring.js - 모니터링 MCP 도구 (30 도구)
 *
 * 검색/색인/에러/알람 로그, 로그 설정, 리소스 모니터링
 */

import { makeValidator, ok, fail } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper-v2/index.js';

// ==================== 엔드포인트 ====================
const ep = {
  // Search Logs
  getSearchLogs: '/monitoring/search/logs',
  getSearchLogStats: '/monitoring/search/stats',
  downloadSearchLogs: '/monitoring/search/logs/download',
  setSearchLogRetention: '/monitoring/search/logs/retention',

  // Index Logs
  getIndexLogs: '/monitoring/index/logs',
  getIndexLogStats: '/monitoring/index/stats',
  setIndexLogRetention: '/monitoring/index/logs/retention',

  // Error Logs
  getErrorLogs: '/monitoring/error/logs',
  getErrorLogDetail: '/monitoring/error/logs/detail',
  deleteErrorLog: '/monitoring/error/logs/delete',
  setErrorLogRetention: '/monitoring/error/logs/retention',

  // Alarm Logs
  getMonitorAlarmLogs: '/monitoring/alarm/logs',
  deleteMonitorAlarmLog: '/monitoring/alarm/logs/delete',
  setMonitorAlarmLogRetention: '/monitoring/alarm/logs/retention',

  // Resource Monitoring
  getCPUUsage: '/monitoring/resource/cpu',
  getMemoryUsage: '/monitoring/resource/memory',
  getDiskUsage: '/monitoring/resource/disk',
  getServerMetrics: '/monitoring/server/metrics',

  // Log Settings
  getLogSettings: '/monitoring/logs/settings',
  saveLogSettings: '/monitoring/logs/settings/save',
  setLogLevel: '/monitoring/logs/level',
  clearLogs: '/monitoring/logs/clear',

  // Alert Configuration
  createAlert: '/monitoring/alerts/create',
  listAlerts: '/monitoring/alerts/list',
  updateAlert: '/monitoring/alerts/update',
  deleteAlert: '/monitoring/alerts/delete'
};

export const monitoring = {
  // ==================== 검색 로그 ====================

  'monitoring.search.logs': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 100 },
          offset: { type: 'number', default: 0 },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.getSearchLogs(
          {
            limit: input.limit || 100,
            offset: input.offset || 0,
            startDate: input.startDate,
            endDate: input.endDate
          },
          input.server
        );
        return ok(ep.getSearchLogs, input, result);
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  'monitoring.search.stats': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['startDate', 'endDate'],
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.getSearchLogStats(
          input.startDate,
          input.endDate,
          input.server
        );
        return ok(ep.getSearchLogStats, input, result);
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  'monitoring.search.download': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          format: { type: 'string', default: 'csv' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.downloadSearchLogs(
          {
            startDate: input.startDate,
            endDate: input.endDate,
            format: input.format || 'csv'
          },
          input.server
        );
        return ok(ep.downloadSearchLogs, input, result);
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  'monitoring.search.retention': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['days'],
        properties: {
          days: { type: 'number' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.setSearchLogRetention(
          input.days,
          input.server
        );
        return ok(ep.setSearchLogRetention, input, { success: result });
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  // ==================== 색인 로그 ====================

  'monitoring.index.logs': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 100 },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.getIndexLogs(
          {
            limit: input.limit || 100,
            startDate: input.startDate,
            endDate: input.endDate
          },
          input.server
        );
        return ok(ep.getIndexLogs, input, result);
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  'monitoring.index.stats': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['startDate', 'endDate'],
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.getIndexLogStats(
          input.startDate,
          input.endDate,
          input.server
        );
        return ok(ep.getIndexLogStats, input, result);
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  'monitoring.index.retention': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['days'],
        properties: {
          days: { type: 'number' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.setIndexLogRetention(
          input.days,
          input.server
        );
        return ok(ep.setIndexLogRetention, input, { success: result });
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  // ==================== 에러 로그 ====================

  'monitoring.error.logs': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 100 },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.getErrorLogs(
          {
            limit: input.limit || 100,
            startDate: input.startDate,
            endDate: input.endDate
          },
          input.server
        );
        return ok(ep.getErrorLogs, input, result);
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  'monitoring.error.detail': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['logId'],
        properties: {
          logId: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.getErrorLogDetail(
          input.logId,
          input.server
        );
        return ok(ep.getErrorLogDetail, input, result);
      } catch (error) {
        return fail('E_MONITORING', error.message, { logId: input.logId });
      }
    }
  },

  'monitoring.error.delete': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['logId'],
        properties: {
          logId: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.deleteErrorLog(
          input.logId,
          input.server
        );
        return ok(ep.deleteErrorLog, input, { success: result });
      } catch (error) {
        return fail('E_MONITORING', error.message, { logId: input.logId });
      }
    }
  },

  'monitoring.error.retention': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['days'],
        properties: {
          days: { type: 'number' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.setErrorLogRetention(
          input.days,
          input.server
        );
        return ok(ep.setErrorLogRetention, input, { success: result });
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  // ==================== 알람 로그 ====================

  'monitoring.alarm.logs': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 100 },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.getMonitorAlarmLogs(
          {
            limit: input.limit || 100,
            startDate: input.startDate,
            endDate: input.endDate
          },
          input.server
        );
        return ok(ep.getMonitorAlarmLogs, input, result);
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  'monitoring.alarm.delete': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['logId'],
        properties: {
          logId: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.deleteMonitorAlarmLog(
          input.logId,
          input.server
        );
        return ok(ep.deleteMonitorAlarmLog, input, { success: result });
      } catch (error) {
        return fail('E_MONITORING', error.message, { logId: input.logId });
      }
    }
  },

  'monitoring.alarm.retention': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['days'],
        properties: {
          days: { type: 'number' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.setMonitorAlarmLogRetention(
          input.days,
          input.server
        );
        return ok(ep.deleteMonitorAlarmLog, input, { success: result });
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  // ==================== 리소스 모니터링 ====================

  'monitoring.cpu': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.server.getCPUUsage(input.server);
        return ok(ep.getCPUUsage, input, result);
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  'monitoring.memory': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.server.getMemoryUsage(input.server);
        return ok(ep.getMemoryUsage, input, result);
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  'monitoring.disk': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.server.getDiskUsage(input.server);
        return ok(ep.getDiskUsage, input, result);
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  'monitoring.metrics': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.server.getServerMetrics(input.server);
        return ok(ep.getServerMetrics, input, result);
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  // ==================== 로그 설정 ====================

  'monitoring.logs.settings': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.getLogSettings(input.server);
        return ok(ep.getLogSettings, input, result);
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  'monitoring.logs.settings.save': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['settings'],
        properties: {
          settings: { type: 'object' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.saveLogSettings(
          input.settings,
          input.server
        );
        return ok(ep.saveLogSettings, input, { success: result });
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  'monitoring.logs.level': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['loggerName', 'level'],
        properties: {
          loggerName: { type: 'string' },
          level: { type: 'string' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.setLogLevel(
          input.loggerName,
          input.level,
          input.server
        );
        return ok(ep.setLogLevel, input, { success: result });
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  },

  'monitoring.logs.clear': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['logType'],
        properties: {
          logType: { type: 'string' },
          olderThanDays: { type: 'number' },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.monitoring.deleteErrorLog(
          input.logType,
          input.server
        );
        return ok(ep.clearLogs, input, { success: result });
      } catch (error) {
        return fail('E_MONITORING', error.message);
      }
    }
  }
};

export default monitoring;
