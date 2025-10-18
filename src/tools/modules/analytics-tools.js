/**
 * analytics-tools.js - 고급 분석 MCP 도구 (15개 도구) ⭐ v3.6 신규
 *
 * - AdvancedAnalytics: 분석 및 시각화 (8개)
 * - SearchBehaviorAnalytics: 검색 행동 분석 (7개)
 */

import { makeValidator, ok, fail } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper-v2/index.js';

const ep = {
  // Advanced Analytics
  report: '/analytics/report',
  pivot: '/analytics/pivot',
  timeSeries: '/analytics/time-series',
  regression: '/analytics/regression',
  correlation: '/analytics/correlation',
  clustering: '/analytics/clustering',
  anomaly: '/analytics/anomaly',
  export: '/analytics/export',

  // Search Behavior
  behavior: '/analytics/behavior',
  patterns: '/analytics/patterns',
  segmentation: '/analytics/segmentation',
  trends: '/analytics/trends',
  sessions: '/analytics/sessions',
  insights: '/analytics/insights',
  recommendations: '/analytics/recommendations'
};

export const analytics = {
  // ==================== Advanced Analytics (8개) ====================

  'analytics.report': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          reportConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.generateAnalyticsReport(
          input.collectionName,
          input.reportConfig || {},
          input.instanceId
        );
        return ok(ep.report, input, result);
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  },

  'analytics.pivot': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          pivotConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.createPivotTable(
          input.collectionName,
          input.pivotConfig || {},
          input.instanceId
        );
        return ok(ep.pivot, input, result);
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  },

  'analytics.timeSeries': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          timeSeriesConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.buildTimeSeries(
          input.collectionName,
          input.timeSeriesConfig || {},
          input.instanceId
        );
        return ok(ep.timeSeries, input, { data: result });
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  },

  'analytics.regression': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          regressionConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.performRegressionAnalysis(
          input.collectionName,
          input.regressionConfig || {},
          input.instanceId
        );
        return ok(ep.regression, input, result);
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  },

  'analytics.correlation': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          correlationConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.performCorrelationAnalysis(
          input.collectionName,
          input.correlationConfig || {},
          input.instanceId
        );
        return ok(ep.correlation, input, result);
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  },

  'analytics.clustering': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          clusteringConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.performClusteringAnalysis(
          input.collectionName,
          input.clusteringConfig || {},
          input.instanceId
        );
        return ok(ep.clustering, input, result);
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  },

  'analytics.anomaly': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          anomalyConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.performAnomalyDetection(
          input.collectionName,
          input.anomalyConfig || {},
          input.instanceId
        );
        return ok(ep.anomaly, input, { anomalies: result });
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  },

  'analytics.export': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          exportConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.exportAnalyticsData(
          input.collectionName,
          input.exportConfig || {},
          input.instanceId
        );
        return ok(ep.export, input, result);
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  },

  // ==================== Search Behavior Analytics (7개) ====================

  'analytics.trackBehavior': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          behaviorTrackingConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.trackUserSearchBehavior(
          input.collectionName,
          input.behaviorTrackingConfig || {},
          input.instanceId
        );
        return ok(ep.behavior, input, { success: result });
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  },

  'analytics.patterns': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          analysisConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.analyzeSearchPatterns(
          input.collectionName,
          input.analysisConfig || {},
          input.instanceId
        );
        return ok(ep.patterns, input, result);
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  },

  'analytics.segmentation': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          segmentationConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.getUserSegmentation(
          input.collectionName,
          input.segmentationConfig || {},
          input.instanceId
        );
        return ok(ep.segmentation, input, { segments: result });
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  },

  'analytics.trends': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          predictionConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.predictSearchTrends(
          input.collectionName,
          input.predictionConfig || {},
          input.instanceId
        );
        return ok(ep.trends, input, { trends: result });
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  },

  'analytics.sessions': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          sessionConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.getSearchSessionAnalytics(
          input.collectionName,
          input.sessionConfig || {},
          input.instanceId
        );
        return ok(ep.sessions, input, result);
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  },

  'analytics.insights': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          insightConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.generateBehaviorInsights(
          input.collectionName,
          input.insightConfig || {},
          input.instanceId
        );
        return ok(ep.insights, input, result);
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  },

  'analytics.recommendations': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['collectionName'],
        properties: {
          collectionName: { type: 'string' },
          recommendationConfig: { type: 'object' },
          instanceId: { type: 'string' }
        }
      };
      makeValidator(schema)(input);
      try {
        const result = await javaWrapper.analytics.getRecommendationInsights(
          input.collectionName,
          input.recommendationConfig || {},
          input.instanceId
        );
        return ok(ep.recommendations, input, { recommendations: result });
      } catch (error) {
        return fail('E_ANALYTICS', error.message);
      }
    }
  }
};

export default analytics;
