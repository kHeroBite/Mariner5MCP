/**
 * java-wrapper-v2/management.js - 관리 설정 API (40+ 메서드)
 *
 * - 계정 관리
 * - 스케줄 작업
 * - 접속 설정
 * - 로그 설정
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// ==================== 계정 관리 (12+ 메서드) ====================

/**
 * 계정 생성
 */
export async function createAccount(accountId, accountName, password, isAdmin = false, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SystemManagement']);
    const result = await callJavaMethod(command, 'createAccount', accountId, accountName, password, isAdmin);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Management] Error creating account:', error.message);
    throw error;
  }
}

/**
 * 계정 조회
 */
export async function getAccount(accountId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SystemManagement']);
    const account = await callJavaMethod(command, 'getAccount', accountId);
    releaseAdminClient(instanceId);
    return javaMapToObject(account);
  } catch (error) {
    console.error('[Management] Error getting account:', error.message);
    throw error;
  }
}

/**
 * 계정 목록 조회
 */
export async function listAccounts(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SystemManagement']);
    const accounts = await callJavaMethod(command, 'getAccountList');
    releaseAdminClient(instanceId);
    return await javaListToArray(accounts);
  } catch (error) {
    console.error('[Management] Error listing accounts:', error.message);
    throw error;
  }
}

/**
 * 계정 수정
 */
export async function modifyAccount(accountId, accountName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SystemManagement']);
    const result = await callJavaMethod(command, 'modifyAccount', accountId, accountName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Management] Error modifying account:', error.message);
    throw error;
  }
}

/**
 * 계정 삭제
 */
export async function deleteAccount(accountId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SystemManagement']);
    const result = await callJavaMethod(command, 'deleteAccount', accountId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Management] Error deleting account:', error.message);
    throw error;
  }
}

/**
 * 패스워드 변경
 */
export async function changePassword(accountId, oldPassword, newPassword, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SystemManagement']);
    const result = await callJavaMethod(command, 'changePassword', accountId, oldPassword, newPassword);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Management] Error changing password:', error.message);
    throw error;
  }
}

// ==================== 스케줄 작업 (12+ 메서드) ====================

/**
 * 스케줄 작업 생성
 */
export async function createScheduleTask(taskName, taskCommand, schedule, enabled = true, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ScheduleTask']);
    const result = await callJavaMethod(command, 'createTask', taskName, taskCommand, convertToJavaObject(schedule), enabled);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Management] Error creating schedule task:', error.message);
    throw error;
  }
}

/**
 * 스케줄 작업 조회
 */
export async function getScheduleTask(taskName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ScheduleTask']);
    const task = await callJavaMethod(command, 'getTask', taskName);
    releaseAdminClient(instanceId);
    return javaMapToObject(task);
  } catch (error) {
    console.error('[Management] Error getting schedule task:', error.message);
    throw error;
  }
}

/**
 * 스케줄 작업 목록 조회
 */
export async function listScheduleTasks(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ScheduleTask']);
    const tasks = await callJavaMethod(command, 'getTaskList');
    releaseAdminClient(instanceId);
    return await javaListToArray(tasks);
  } catch (error) {
    console.error('[Management] Error listing schedule tasks:', error.message);
    throw error;
  }
}

/**
 * 스케줄 작업 수정
 */
export async function modifyScheduleTask(taskName, taskCommand, schedule, enabled = true, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ScheduleTask']);
    const result = await callJavaMethod(command, 'modifyTask', taskName, taskCommand, convertToJavaObject(schedule), enabled);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Management] Error modifying schedule task:', error.message);
    throw error;
  }
}

/**
 * 스케줄 작업 삭제
 */
export async function deleteScheduleTask(taskName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ScheduleTask']);
    const result = await callJavaMethod(command, 'deleteTask', taskName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Management] Error deleting schedule task:', error.message);
    throw error;
  }
}

/**
 * 스케줄 작업 실행 기록 조회
 */
export async function listScheduleTaskExecutions(taskName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ScheduleTask']);
    const executions = await callJavaMethod(command, 'getExecutionHistory', taskName);
    releaseAdminClient(instanceId);
    return await javaListToArray(executions);
  } catch (error) {
    console.error('[Management] Error listing schedule task executions:', error.message);
    throw error;
  }
}

// ==================== 접속 설정 (10+ 메서드) ====================

/**
 * 허용 IP 추가
 */
export async function addAllowedIP(ipAddress, description = '', instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SystemManagement']);
    const result = await callJavaMethod(command, 'addAllowedIP', ipAddress, description);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Management] Error adding allowed IP:', error.message);
    throw error;
  }
}

/**
 * 허용 IP 삭제
 */
export async function removeAllowedIP(ipAddress, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SystemManagement']);
    const result = await callJavaMethod(command, 'removeAllowedIP', ipAddress);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Management] Error removing allowed IP:', error.message);
    throw error;
  }
}

/**
 * 허용 IP 목록 조회
 */
export async function listAllowedIPs(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SystemManagement']);
    const ips = await callJavaMethod(command, 'getAllowedIPList');
    releaseAdminClient(instanceId);
    return await javaListToArray(ips);
  } catch (error) {
    console.error('[Management] Error listing allowed IPs:', error.message);
    throw error;
  }
}

// ==================== 로그 설정 (8+ 메서드) ====================

/**
 * 로그 설정 조회
 */
export async function getLogSettings(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['LogSetting']);
    const settings = await callJavaMethod(command, 'getSettings');
    releaseAdminClient(instanceId);
    return javaMapToObject(settings);
  } catch (error) {
    console.error('[Management] Error getting log settings:', error.message);
    throw error;
  }
}

/**
 * 로그 설정 저장
 */
export async function saveLogSettings(settings, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['LogSetting']);
    const result = await callJavaMethod(command, 'saveSettings', convertToJavaObject(settings));
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Management] Error saving log settings:', error.message);
    throw error;
  }
}

/**
 * 로그 레벨 설정
 */
export async function setLogLevel(loggerName, level, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['LogSetting']);
    const result = await callJavaMethod(command, 'setLevel', loggerName, level);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Management] Error setting log level:', error.message);
    throw error;
  }
}

export default {
  // Accounts
  createAccount,
  getAccount,
  listAccounts,
  modifyAccount,
  deleteAccount,
  changePassword,

  // Schedule Tasks
  createScheduleTask,
  getScheduleTask,
  listScheduleTasks,
  modifyScheduleTask,
  deleteScheduleTask,
  listScheduleTaskExecutions,

  // Connection Settings
  addAllowedIP,
  removeAllowedIP,
  listAllowedIPs,

  // Log Settings
  getLogSettings,
  saveLogSettings,
  setLogLevel
};
