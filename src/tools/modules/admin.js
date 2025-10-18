/**
 * admin.js - 관리 설정 MCP 도구 (40 도구)
 *
 * 계정, 스케줄 작업, 접속 설정, 로그 설정 관리
 */

import { makeValidator, ok, fail } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper-v2/index.js';

// ==================== 엔드포인트 ====================
const ep = {
  // Accounts
  createAccount: '/admin/accounts/create',
  getAccount: '/admin/accounts/get',
  listAccounts: '/admin/accounts/list',
  modifyAccount: '/admin/accounts/modify',
  deleteAccount: '/admin/accounts/delete',
  changePassword: '/admin/accounts/password',

  // Schedule Tasks
  createTask: '/admin/tasks/create',
  getTask: '/admin/tasks/get',
  listTasks: '/admin/tasks/list',
  modifyTask: '/admin/tasks/modify',
  deleteTask: '/admin/tasks/delete',
  listTaskExecutions: '/admin/tasks/executions',

  // Connection Settings
  addIP: '/admin/connection/ip/add',
  removeIP: '/admin/connection/ip/remove',
  listIPs: '/admin/connection/ip/list',

  // Log Settings
  getLogSettings: '/admin/logs/settings',
  saveLogSettings: '/admin/logs/settings/save',
  setLogLevel: '/admin/logs/level'
};

export const admin = {
  // ==================== 계정 관리 ====================

  'admin.account.create': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['accountId', 'accountName', 'password'],
        properties: {
          accountId: { type: 'string' },
          accountName: { type: 'string' },
          password: { type: 'string' },
          isAdmin: { type: 'boolean', default: false },
          server: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.createAccount(
          input.accountId,
          input.accountName,
          input.password,
          input.isAdmin || false,
          input.server
        );
        return ok(ep.createAccount, input, { success: result });
      } catch (error) {
        return fail('E_ADMIN', error.message, { accountId: input.accountId });
      }
    }
  },

  'admin.account.get': {
    handler: async (input) => {
      const schema = { type: 'object', required: ['accountId'], properties: { accountId: { type: 'string' }, server: { type: 'string' } } };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.getAccount(input.accountId, input.server);
        return ok(ep.getAccount, input, result);
      } catch (error) {
        return fail('E_ADMIN', error.message, { accountId: input.accountId });
      }
    }
  },

  'admin.account.list': {
    handler: async (input) => {
      makeValidator({ type: 'object', properties: { server: { type: 'string' } } })(input);
      try {
        const result = await javaWrapper.management.listAccounts(input?.server);
        return ok(ep.listAccounts, input, result);
      } catch (error) {
        return fail('E_ADMIN', error.message);
      }
    }
  },

  'admin.account.modify': {
    handler: async (input) => {
      const schema = { type: 'object', required: ['accountId', 'accountName'], properties: { accountId: { type: 'string' }, accountName: { type: 'string' }, server: { type: 'string' } } };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.modifyAccount(input.accountId, input.accountName, input.server);
        return ok(ep.modifyAccount, input, { success: result });
      } catch (error) {
        return fail('E_ADMIN', error.message, { accountId: input.accountId });
      }
    }
  },

  'admin.account.delete': {
    handler: async (input) => {
      const schema = { type: 'object', required: ['accountId'], properties: { accountId: { type: 'string' }, server: { type: 'string' } } };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.deleteAccount(input.accountId, input.server);
        return ok(ep.deleteAccount, input, { success: result });
      } catch (error) {
        return fail('E_ADMIN', error.message, { accountId: input.accountId });
      }
    }
  },

  'admin.account.password': {
    handler: async (input) => {
      const schema = { type: 'object', required: ['accountId', 'oldPassword', 'newPassword'], properties: { accountId: { type: 'string' }, oldPassword: { type: 'string' }, newPassword: { type: 'string' }, server: { type: 'string' } } };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.changePassword(input.accountId, input.oldPassword, input.newPassword, input.server);
        return ok(ep.changePassword, input, { success: result });
      } catch (error) {
        return fail('E_ADMIN', error.message, { accountId: input.accountId });
      }
    }
  },

  // ==================== 스케줄 작업 ====================

  'admin.task.create': {
    handler: async (input) => {
      const schema = { type: 'object', required: ['taskName', 'taskCommand', 'schedule'], properties: { taskName: { type: 'string' }, taskCommand: { type: 'string' }, schedule: { type: 'object' }, enabled: { type: 'boolean', default: true }, server: { type: 'string' } } };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.createScheduleTask(input.taskName, input.taskCommand, input.schedule, input.enabled !== false, input.server);
        return ok(ep.createTask, input, { success: result });
      } catch (error) {
        return fail('E_ADMIN', error.message, { taskName: input.taskName });
      }
    }
  },

  'admin.task.get': {
    handler: async (input) => {
      const schema = { type: 'object', required: ['taskName'], properties: { taskName: { type: 'string' }, server: { type: 'string' } } };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.getScheduleTask(input.taskName, input.server);
        return ok(ep.getTask, input, result);
      } catch (error) {
        return fail('E_ADMIN', error.message, { taskName: input.taskName });
      }
    }
  },

  'admin.task.list': {
    handler: async (input) => {
      makeValidator({ type: 'object', properties: { server: { type: 'string' } } })(input);
      try {
        const result = await javaWrapper.management.listScheduleTasks(input?.server);
        return ok(ep.listTasks, input, result);
      } catch (error) {
        return fail('E_ADMIN', error.message);
      }
    }
  },

  'admin.task.modify': {
    handler: async (input) => {
      const schema = { type: 'object', required: ['taskName', 'taskCommand', 'schedule'], properties: { taskName: { type: 'string' }, taskCommand: { type: 'string' }, schedule: { type: 'object' }, enabled: { type: 'boolean' }, server: { type: 'string' } } };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.modifyScheduleTask(input.taskName, input.taskCommand, input.schedule, input.enabled !== false, input.server);
        return ok(ep.modifyTask, input, { success: result });
      } catch (error) {
        return fail('E_ADMIN', error.message, { taskName: input.taskName });
      }
    }
  },

  'admin.task.delete': {
    handler: async (input) => {
      const schema = { type: 'object', required: ['taskName'], properties: { taskName: { type: 'string' }, server: { type: 'string' } } };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.deleteScheduleTask(input.taskName, input.server);
        return ok(ep.deleteTask, input, { success: result });
      } catch (error) {
        return fail('E_ADMIN', error.message, { taskName: input.taskName });
      }
    }
  },

  'admin.task.executions': {
    handler: async (input) => {
      const schema = { type: 'object', required: ['taskName'], properties: { taskName: { type: 'string' }, server: { type: 'string' } } };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.listScheduleTaskExecutions(input.taskName, input.server);
        return ok(ep.listTaskExecutions, input, result);
      } catch (error) {
        return fail('E_ADMIN', error.message, { taskName: input.taskName });
      }
    }
  },

  // ==================== 접속 설정 ====================

  'admin.connection.ip.add': {
    handler: async (input) => {
      const schema = { type: 'object', required: ['ipAddress'], properties: { ipAddress: { type: 'string' }, description: { type: 'string' }, server: { type: 'string' } } };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.addAllowedIP(input.ipAddress, input.description || '', input.server);
        return ok(ep.addIP, input, { success: result });
      } catch (error) {
        return fail('E_ADMIN', error.message, { ipAddress: input.ipAddress });
      }
    }
  },

  'admin.connection.ip.remove': {
    handler: async (input) => {
      const schema = { type: 'object', required: ['ipAddress'], properties: { ipAddress: { type: 'string' }, server: { type: 'string' } } };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.removeAllowedIP(input.ipAddress, input.server);
        return ok(ep.removeIP, input, { success: result });
      } catch (error) {
        return fail('E_ADMIN', error.message, { ipAddress: input.ipAddress });
      }
    }
  },

  'admin.connection.ip.list': {
    handler: async (input) => {
      makeValidator({ type: 'object', properties: { server: { type: 'string' } } })(input);
      try {
        const result = await javaWrapper.management.listAllowedIPs(input?.server);
        return ok(ep.listIPs, input, result);
      } catch (error) {
        return fail('E_ADMIN', error.message);
      }
    }
  },

  // ==================== 로그 설정 ====================

  'admin.logs.settings': {
    handler: async (input) => {
      makeValidator({ type: 'object', properties: { server: { type: 'string' } } })(input);
      try {
        const result = await javaWrapper.management.getLogSettings(input?.server);
        return ok(ep.getLogSettings, input, result);
      } catch (error) {
        return fail('E_ADMIN', error.message);
      }
    }
  },

  'admin.logs.settings.save': {
    handler: async (input) => {
      const schema = { type: 'object', required: ['settings'], properties: { settings: { type: 'object' }, server: { type: 'string' } } };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.saveLogSettings(input.settings, input.server);
        return ok(ep.saveLogSettings, input, { success: result });
      } catch (error) {
        return fail('E_ADMIN', error.message);
      }
    }
  },

  'admin.logs.level': {
    handler: async (input) => {
      const schema = { type: 'object', required: ['loggerName', 'level'], properties: { loggerName: { type: 'string' }, level: { type: 'string' }, server: { type: 'string' } } };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.management.setLogLevel(input.loggerName, input.level, input.server);
        return ok(ep.setLogLevel, input, { success: result });
      } catch (error) {
        return fail('E_ADMIN', error.message);
      }
    }
  }
};

export default admin;
