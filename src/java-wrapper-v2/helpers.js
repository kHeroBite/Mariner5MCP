/**
 * java-wrapper-v2/helpers.js - 공통 헬퍼 함수
 */

import { getInstanceManager } from '../instance-manager.js';
import { javaClasses } from '../java-bridge.js';

/**
 * AdminServerClient 인스턴스 조회
 */
export function getAdminClient(instanceId = null) {
  try {
    const manager = getInstanceManager();
    const context = manager.getInstance(instanceId);
    return context.adminClient;
  } catch (error) {
    throw new Error(`Failed to get admin client: ${error.message}`);
  }
}

/**
 * AdminServerClient 인스턴스 반환
 */
export function releaseAdminClient(instanceId) {
  try {
    const manager = getInstanceManager();
    manager.releaseInstance(instanceId);
  } catch (error) {
    console.error('[Helpers] Error releasing admin client:', error.message);
  }
}

/**
 * JavaScript 객체를 Java 객체로 변환
 */
export function convertToJavaObject(obj) {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const javaList = new javaClasses.ArrayList();
    for (const item of obj) {
      javaList.addSync(convertToJavaObject(item));
    }
    return javaList;
  }

  if (typeof obj === 'object') {
    const javaMap = new javaClasses.HashMap();
    for (const [key, value] of Object.entries(obj)) {
      javaMap.putSync(key, convertToJavaObject(value));
    }
    return javaMap;
  }

  return obj;
}

export default {
  getAdminClient,
  releaseAdminClient,
  convertToJavaObject
};
