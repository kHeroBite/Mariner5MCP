/**
 * java-wrapper-v2/server.js - 서버 관리 API (30+ 메서드)
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// ==================== 서버 제어 (10+ 메서드) ====================

export async function startServer(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ServerSetting']);
    const result = await callJavaMethod(command, 'start');
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Server] Error starting server:', error.message);
    throw error;
  }
}

export async function stopServer(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ServerSetting']);
    const result = await callJavaMethod(command, 'stop');
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Server] Error stopping server:', error.message);
    throw error;
  }
}

export async function restartServer(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ServerSetting']);
    const result = await callJavaMethod(command, 'restart');
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Server] Error restarting server:', error.message);
    throw error;
  }
}

export async function getServerStatus(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ServerSetting']);
    const status = await callJavaMethod(command, 'getStatus');
    releaseAdminClient(instanceId);
    return javaMapToObject(status);
  } catch (error) {
    console.error('[Server] Error getting server status:', error.message);
    throw error;
  }
}

export async function getServerInfo(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ServerSetting']);
    const info = await callJavaMethod(command, 'getInfo');
    releaseAdminClient(instanceId);
    return javaMapToObject(info);
  } catch (error) {
    console.error('[Server] Error getting server info:', error.message);
    throw error;
  }
}

export async function getServerMetrics(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['GetDashBoardResource']);
    const metrics = await callJavaMethod(command, 'getMetrics');
    releaseAdminClient(instanceId);
    return javaMapToObject(metrics);
  } catch (error) {
    console.error('[Server] Error getting server metrics:', error.message);
    throw error;
  }
}

// ==================== Broker 설정 (12+ 메서드) ====================

export async function addBroker(brokerName, host, port, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['BrokerSetting']);
    const result = await callJavaMethod(command, 'addBroker', brokerName, host, port);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Server] Error adding broker:', error.message);
    throw error;
  }
}

export async function removeBroker(brokerName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['BrokerSetting']);
    const result = await callJavaMethod(command, 'removeBroker', brokerName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Server] Error removing broker:', error.message);
    throw error;
  }
}

export async function listBrokers(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['BrokerSetting']);
    const brokers = await callJavaMethod(command, 'getBrokerList');
    releaseAdminClient(instanceId);
    return await javaListToArray(brokers);
  } catch (error) {
    console.error('[Server] Error listing brokers:', error.message);
    throw error;
  }
}

export async function getBrokerStatus(brokerName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['BrokerSetting']);
    const status = await callJavaMethod(command, 'getBrokerStatus', brokerName);
    releaseAdminClient(instanceId);
    return javaMapToObject(status);
  } catch (error) {
    console.error('[Server] Error getting broker status:', error.message);
    throw error;
  }
}

// ==================== 리소스 모니터링 (8+ 메서드) ====================

export async function getCPUUsage(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['GetDashBoardResource']);
    const usage = await callJavaMethod(command, 'getCPUUsage');
    releaseAdminClient(instanceId);
    return usage;
  } catch (error) {
    console.error('[Server] Error getting CPU usage:', error.message);
    throw error;
  }
}

export async function getMemoryUsage(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['GetDashBoardResource']);
    const usage = await callJavaMethod(command, 'getMemoryUsage');
    releaseAdminClient(instanceId);
    return javaMapToObject(usage);
  } catch (error) {
    console.error('[Server] Error getting memory usage:', error.message);
    throw error;
  }
}

export async function getDiskUsage(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['GetDashBoardResource']);
    const usage = await callJavaMethod(command, 'getDiskUsage');
    releaseAdminClient(instanceId);
    return javaMapToObject(usage);
  } catch (error) {
    console.error('[Server] Error getting disk usage:', error.message);
    throw error;
  }
}

export default {
  startServer,
  stopServer,
  restartServer,
  getServerStatus,
  getServerInfo,
  getServerMetrics,
  addBroker,
  removeBroker,
  listBrokers,
  getBrokerStatus,
  getCPUUsage,
  getMemoryUsage,
  getDiskUsage
};
