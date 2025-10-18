/**
 * java-wrapper-v2/sort-config.js - n차 정렬 설정 API ⭐ v3.7 신규
 *
 * - n차 정렬(다중 정렬) 우선순위 명시
 * - 1차/2차/3차 정렬 명확한 제어
 * - 검색 결과 정렬 최적화
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject,
  javaClasses
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// ==================== n차 정렬 관리 (8+ 메서드) ====================

/**
 * 정렬 우선순위 조회
 */
export async function getSortPriority(collectionName, profileId = null, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SortConfig']);
    let result;
    if (profileId) {
      result = await callJavaMethod(command, 'getSortPriority', collectionName, profileId);
    } else {
      result = await callJavaMethod(command, 'getSortPriority', collectionName);
    }
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Sort] Error getting sort priority:', error.message);
    throw error;
  }
}

/**
 * n차 정렬 우선순위 설정
 * @param {string} collectionName - 컬렉션명
 * @param {array} sortChain - 정렬 체인
 *   [{field: 'created_at', order: 'DESC', priority: 1},
 *    {field: 'price', order: 'ASC', priority: 2},
 *    {field: 'view_count', order: 'DESC', priority: 3}]
 */
export async function setSortPriority(collectionName, sortChain = [], profileId = null, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SortConfig']);
    const javaSortChain = convertToJavaObject(sortChain);

    let result;
    if (profileId) {
      result = await callJavaMethod(command, 'setSortPriority', collectionName, profileId, javaSortChain);
    } else {
      result = await callJavaMethod(command, 'setSortPriority', collectionName, javaSortChain);
    }

    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Sort] Error setting sort priority:', error.message);
    throw error;
  }
}

/**
 * 1차 정렬 설정
 */
export async function setPrimarySort(collectionName, field, order = 'DESC', profileId = null, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SortConfig']);

    let result;
    if (profileId) {
      result = await callJavaMethod(command, 'setPrimarySort', collectionName, profileId, field, order);
    } else {
      result = await callJavaMethod(command, 'setPrimarySort', collectionName, field, order);
    }

    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Sort] Error setting primary sort:', error.message);
    throw error;
  }
}

/**
 * 2차 정렬 추가
 */
export async function addSecondarySort(collectionName, field, order = 'ASC', profileId = null, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SortConfig']);

    let result;
    if (profileId) {
      result = await callJavaMethod(command, 'addSecondarySort', collectionName, profileId, field, order);
    } else {
      result = await callJavaMethod(command, 'addSecondarySort', collectionName, field, order);
    }

    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Sort] Error adding secondary sort:', error.message);
    throw error;
  }
}

/**
 * 3차 정렬 추가
 */
export async function addTertiarySort(collectionName, field, order = 'ASC', profileId = null, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SortConfig']);

    let result;
    if (profileId) {
      result = await callJavaMethod(command, 'addTertiarySort', collectionName, profileId, field, order);
    } else {
      result = await callJavaMethod(command, 'addTertiarySort', collectionName, field, order);
    }

    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Sort] Error adding tertiary sort:', error.message);
    throw error;
  }
}

/**
 * 정렬 설정 검증
 */
export async function validateSortConfig(collectionName, profileId = null, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SortConfig']);

    let result;
    if (profileId) {
      result = await callJavaMethod(command, 'validate', collectionName, profileId);
    } else {
      result = await callJavaMethod(command, 'validate', collectionName);
    }

    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Sort] Error validating sort config:', error.message);
    throw error;
  }
}

/**
 * 정렬 결과 미리보기
 */
export async function previewSortResults(collectionName, querySet = {}, profileId = null, limit = 10, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SortConfig']);
    const javaQuerySet = convertToJavaObject(querySet);

    let result;
    if (profileId) {
      result = await callJavaMethod(
        command,
        'previewResults',
        collectionName,
        profileId,
        javaQuerySet,
        limit
      );
    } else {
      result = await callJavaMethod(
        command,
        'previewResults',
        collectionName,
        javaQuerySet,
        limit
      );
    }

    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Sort] Error previewing sort results:', error.message);
    throw error;
  }
}

/**
 * 정렬 설정 초기화
 */
export async function resetSortConfig(collectionName, profileId = null, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['SortConfig']);

    let result;
    if (profileId) {
      result = await callJavaMethod(command, 'reset', collectionName, profileId);
    } else {
      result = await callJavaMethod(command, 'reset', collectionName);
    }

    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Sort] Error resetting sort config:', error.message);
    throw error;
  }
}

export default {
  // n차 정렬 관리
  getSortPriority,
  setSortPriority,
  setPrimarySort,
  addSecondarySort,
  addTertiarySort,
  validateSortConfig,
  previewSortResults,
  resetSortConfig
};
