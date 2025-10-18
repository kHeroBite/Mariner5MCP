/**
 * java-wrapper-v2/cluster.js - 클러스터 관리 및 분산 처리 API (10+ 메서드) ⭐ v3.5 신규
 *
 * - ClusterManagement: 다중 노드 클러스터 관리
 * - NodeHealthCheck: 노드 상태 모니터링
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject,
  javaClasses
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// ==================== Cluster Management (6+ 메서드) ====================

export async function addClusterNode(nodeId, nodeAddress, nodeConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ClusterManagement']);
    const javaConfig = convertToJavaObject(nodeConfig);
    const result = await callJavaMethod(
      command,
      'addNode',
      nodeId,
      nodeAddress,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Cluster] Error adding cluster node:', error.message);
    throw error;
  }
}

export async function removeClusterNode(nodeId, force = false, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ClusterManagement']);
    const result = await callJavaMethod(command, 'removeNode', nodeId, force);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Cluster] Error removing cluster node:', error.message);
    throw error;
  }
}

export async function getClusterStatus(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ClusterManagement']);
    const result = await callJavaMethod(command, 'getClusterStatus');
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Cluster] Error getting cluster status:', error.message);
    throw error;
  }
}

export async function getNodeStatus(nodeId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ClusterManagement']);
    const result = await callJavaMethod(command, 'getNodeStatus', nodeId);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Cluster] Error getting node status:', error.message);
    throw error;
  }
}

export async function listClusterNodes(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ClusterManagement']);
    const result = await callJavaMethod(command, 'listNodes');
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Cluster] Error listing cluster nodes:', error.message);
    throw error;
  }
}

export async function balanceCluster(strategy = 'auto', instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['ClusterManagement']);
    const result = await callJavaMethod(command, 'balanceCluster', strategy);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Cluster] Error balancing cluster:', error.message);
    throw error;
  }
}

// ==================== Node Health Check (4+ 메서드) ====================

export async function checkNodeHealth(nodeId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['NodeHealthCheck']);
    const result = await callJavaMethod(command, 'checkHealth', nodeId);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Cluster] Error checking node health:', error.message);
    throw error;
  }
}

export async function getNodeMetrics(nodeId, metricType = 'all', instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['NodeHealthCheck']);
    const result = await callJavaMethod(command, 'getMetrics', nodeId, metricType);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Cluster] Error getting node metrics:', error.message);
    throw error;
  }
}

export async function getClusterMetrics(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['NodeHealthCheck']);
    const result = await callJavaMethod(command, 'getClusterMetrics');
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Cluster] Error getting cluster metrics:', error.message);
    throw error;
  }
}

export async function checkAllNodesHealth(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['NodeHealthCheck']);
    const result = await callJavaMethod(command, 'checkAllHealth');
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Cluster] Error checking all nodes health:', error.message);
    throw error;
  }
}

export default {
  // Cluster Management
  addClusterNode,
  removeClusterNode,
  getClusterStatus,
  getNodeStatus,
  listClusterNodes,
  balanceCluster,

  // Node Health Check
  checkNodeHealth,
  getNodeMetrics,
  getClusterMetrics,
  checkAllNodesHealth
};
