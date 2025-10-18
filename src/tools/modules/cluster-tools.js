/**
 * cluster-tools.js - 클러스터 관리 MCP 도구 (10개 도구) ⭐ v3.5 신규
 *
 * - ClusterManagement: 다중 노드 클러스터 관리 (6개)
 * - NodeHealthCheck: 노드 상태 모니터링 (4개)
 */

import { makeValidator, ok, fail } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper-v2/index.js';

const ep = {
  // Cluster Management
  clusterNode: '/cluster/node',
  clusterStatus: '/cluster/status',
  clusterBalance: '/cluster/balance',

  // Node Health
  nodeHealth: '/cluster/health',
  nodeMetrics: '/cluster/metrics'
};

export const cluster = {
  // ==================== Cluster Management (6개) ====================

  'cluster.node.add': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['nodeId', 'nodeAddress'],
        properties: {
          nodeId: { type: 'string' },
          nodeAddress: { type: 'string' },
          nodeConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.cluster.addClusterNode(
          input.nodeId,
          input.nodeAddress,
          input.nodeConfig || {},
          input.instanceId
        );
        return ok(ep.clusterNode, input, result);
      } catch (error) {
        return fail('E_CLUSTER', error.message);
      }
    }
  },

  'cluster.node.remove': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['nodeId'],
        properties: {
          nodeId: { type: 'string' },
          force: { type: 'boolean', default: false },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.cluster.removeClusterNode(
          input.nodeId,
          input.force || false,
          input.instanceId
        );
        return ok(ep.clusterNode, input, { success: result });
      } catch (error) {
        return fail('E_CLUSTER', error.message);
      }
    }
  },

  'cluster.status': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.cluster.getClusterStatus(
          input.instanceId
        );
        return ok(ep.clusterStatus, input, result);
      } catch (error) {
        return fail('E_CLUSTER', error.message);
      }
    }
  },

  'cluster.node.status': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['nodeId'],
        properties: {
          nodeId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.cluster.getNodeStatus(
          input.nodeId,
          input.instanceId
        );
        return ok(ep.clusterNode, input, result);
      } catch (error) {
        return fail('E_CLUSTER', error.message);
      }
    }
  },

  'cluster.nodes.list': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.cluster.listClusterNodes(
          input.instanceId
        );
        return ok(ep.clusterStatus, input, { nodes: result });
      } catch (error) {
        return fail('E_CLUSTER', error.message);
      }
    }
  },

  'cluster.balance': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          strategy: {
            type: 'string',
            enum: ['auto', 'uniform', 'weighted'],
            default: 'auto'
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.cluster.balanceCluster(
          input.strategy || 'auto',
          input.instanceId
        );
        return ok(ep.clusterBalance, input, { success: result });
      } catch (error) {
        return fail('E_CLUSTER', error.message);
      }
    }
  },

  // ==================== Node Health Check (4개) ====================

  'cluster.node.health': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['nodeId'],
        properties: {
          nodeId: { type: 'string' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.cluster.checkNodeHealth(
          input.nodeId,
          input.instanceId
        );
        return ok(ep.nodeHealth, input, result);
      } catch (error) {
        return fail('E_CLUSTER', error.message);
      }
    }
  },

  'cluster.node.metrics': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['nodeId'],
        properties: {
          nodeId: { type: 'string' },
          metricType: {
            type: 'string',
            enum: ['cpu', 'memory', 'disk', 'network', 'all'],
            default: 'all'
          },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.cluster.getNodeMetrics(
          input.nodeId,
          input.metricType || 'all',
          input.instanceId
        );
        return ok(ep.nodeMetrics, input, result);
      } catch (error) {
        return fail('E_CLUSTER', error.message);
      }
    }
  },

  'cluster.metrics': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.cluster.getClusterMetrics(
          input.instanceId
        );
        return ok(ep.nodeMetrics, input, result);
      } catch (error) {
        return fail('E_CLUSTER', error.message);
      }
    }
  },

  'cluster.health.check': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.cluster.checkAllNodesHealth(
          input.instanceId
        );
        return ok(ep.nodeHealth, input, { nodes: result });
      } catch (error) {
        return fail('E_CLUSTER', error.message);
      }
    }
  }
};

export default cluster;
