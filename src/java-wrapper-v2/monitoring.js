/**
 * java-wrapper-v2/monitoring.js - 모니터링 로그 관리 API (30+ 메서드)
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// ==================== 검색 로그 (8+ 메서드) ====================

export async function getSearchLogs(options = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Report']);
    const logs = await callJavaMethod(command, 'getSearchLogs', convertToJavaObject(options));
    releaseAdminClient(instanceId);
    return await javaListToArray(logs);
  } catch (error) {
    console.error('[Monitoring] Error getting search logs:', error.message);
    throw error;
  }
}

export async function getSearchLogStats(startDate, endDate, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Report']);
    const stats = await callJavaMethod(command, 'getSearchLogStats', startDate, endDate);
    releaseAdminClient(instanceId);
    return javaMapToObject(stats);
  } catch (error) {
    console.error('[Monitoring] Error getting search log stats:', error.message);
    throw error;
  }
}

export async function downloadSearchLogs(options = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Report']);
    const result = await callJavaMethod(command, 'downloadSearchLogs', convertToJavaObject(options));
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Monitoring] Error downloading search logs:', error.message);
    throw error;
  }
}

export async function setSearchLogRetention(days, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Report']);
    const result = await callJavaMethod(command, 'setSearchLogRetention', days);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Monitoring] Error setting search log retention:', error.message);
    throw error;
  }
}

// ==================== 색인 로그 (8+ 메서드) ====================

export async function getIndexLogs(options = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Report']);
    const logs = await callJavaMethod(command, 'getIndexLogs', convertToJavaObject(options));
    releaseAdminClient(instanceId);
    return await javaListToArray(logs);
  } catch (error) {
    console.error('[Monitoring] Error getting index logs:', error.message);
    throw error;
  }
}

export async function getIndexLogStats(startDate, endDate, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Report']);
    const stats = await callJavaMethod(command, 'getIndexLogStats', startDate, endDate);
    releaseAdminClient(instanceId);
    return javaMapToObject(stats);
  } catch (error) {
    console.error('[Monitoring] Error getting index log stats:', error.message);
    throw error;
  }
}

export async function setIndexLogRetention(days, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Report']);
    const result = await callJavaMethod(command, 'setIndexLogRetention', days);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Monitoring] Error setting index log retention:', error.message);
    throw error;
  }
}

// ==================== 에러 로그 (8+ 메서드) ====================

export async function getErrorLogs(options = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Report']);
    const logs = await callJavaMethod(command, 'getErrorLogs', convertToJavaObject(options));
    releaseAdminClient(instanceId);
    return await javaListToArray(logs);
  } catch (error) {
    console.error('[Monitoring] Error getting error logs:', error.message);
    throw error;
  }
}

export async function getErrorLogDetail(logId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Report']);
    const detail = await callJavaMethod(command, 'getErrorLogDetail', logId);
    releaseAdminClient(instanceId);
    return javaMapToObject(detail);
  } catch (error) {
    console.error('[Monitoring] Error getting error log detail:', error.message);
    throw error;
  }
}

export async function deleteErrorLog(logId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Report']);
    const result = await callJavaMethod(command, 'deleteErrorLog', logId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Monitoring] Error deleting error log:', error.message);
    throw error;
  }
}

export async function setErrorLogRetention(days, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Report']);
    const result = await callJavaMethod(command, 'setErrorLogRetention', days);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Monitoring] Error setting error log retention:', error.message);
    throw error;
  }
}

// ==================== 모니터 알람 로그 (6+ 메서드) ====================

export async function getMonitorAlarmLogs(options = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Report']);
    const logs = await callJavaMethod(command, 'getMonitorAlarmLogs', convertToJavaObject(options));
    releaseAdminClient(instanceId);
    return await javaListToArray(logs);
  } catch (error) {
    console.error('[Monitoring] Error getting monitor alarm logs:', error.message);
    throw error;
  }
}

export async function deleteMonitorAlarmLog(logId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Report']);
    const result = await callJavaMethod(command, 'deleteMonitorAlarmLog', logId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Monitoring] Error deleting monitor alarm log:', error.message);
    throw error;
  }
}

export async function setMonitorAlarmLogRetention(days, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Report']);
    const result = await callJavaMethod(command, 'setMonitorAlarmLogRetention', days);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Monitoring] Error setting monitor alarm log retention:', error.message);
    throw error;
  }
}

export default {
  getSearchLogs,
  getSearchLogStats,
  downloadSearchLogs,
  setSearchLogRetention,
  getIndexLogs,
  getIndexLogStats,
  setIndexLogRetention,
  getErrorLogs,
  getErrorLogDetail,
  deleteErrorLog,
  setErrorLogRetention,
  getMonitorAlarmLogs,
  deleteMonitorAlarmLog,
  setMonitorAlarmLogRetention
};
