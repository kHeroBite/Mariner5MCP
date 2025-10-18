/**
 * java-wrapper-v2/tuning.js - 검색 튜닝 API (60+ 메서드)
 *
 * - 검색 프로파일
 * - QuerySet 관리
 * - 랭킹 모델
 * - 필터/정렬/그룹 설정
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// ==================== 검색 프로파일 (15+ 메서드) ====================

export async function createSearchProfile(collectionId, profileName, config = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const result = await callJavaMethod(command, 'createProfile', collectionId, profileName, convertToJavaObject(config));
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Tuning] Error creating search profile:', error.message);
    throw error;
  }
}

export async function getSearchProfile(collectionId, profileId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const profile = await callJavaMethod(command, 'getProfile', collectionId, profileId);
    releaseAdminClient(instanceId);
    return javaMapToObject(profile);
  } catch (error) {
    console.error('[Tuning] Error getting search profile:', error.message);
    throw error;
  }
}

export async function listSearchProfiles(collectionId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const profiles = await callJavaMethod(command, 'getProfileList', collectionId);
    releaseAdminClient(instanceId);
    return await javaListToArray(profiles);
  } catch (error) {
    console.error('[Tuning] Error listing search profiles:', error.message);
    throw error;
  }
}

export async function modifySearchProfile(collectionId, profileId, config = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const result = await callJavaMethod(command, 'modifyProfile', collectionId, profileId, convertToJavaObject(config));
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Tuning] Error modifying search profile:', error.message);
    throw error;
  }
}

export async function deleteSearchProfile(collectionId, profileId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const result = await callJavaMethod(command, 'deleteProfile', collectionId, profileId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Tuning] Error deleting search profile:', error.message);
    throw error;
  }
}

// ==================== QuerySet 관리 (20+ 메서드) ====================

export async function createQuerySet(collectionId, profileId, querySetName, config = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const result = await callJavaMethod(command, 'createQuerySet', collectionId, profileId, querySetName, convertToJavaObject(config));
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Tuning] Error creating query set:', error.message);
    throw error;
  }
}

export async function getQuerySet(collectionId, profileId, querySetId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const querySet = await callJavaMethod(command, 'getQuerySet', collectionId, profileId, querySetId);
    releaseAdminClient(instanceId);
    return javaMapToObject(querySet);
  } catch (error) {
    console.error('[Tuning] Error getting query set:', error.message);
    throw error;
  }
}

export async function listQuerySets(collectionId, profileId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const querySets = await callJavaMethod(command, 'getQuerySetList', collectionId, profileId);
    releaseAdminClient(instanceId);
    return await javaListToArray(querySets);
  } catch (error) {
    console.error('[Tuning] Error listing query sets:', error.message);
    throw error;
  }
}

export async function modifyQuerySet(collectionId, profileId, querySetId, config = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const result = await callJavaMethod(command, 'modifyQuerySet', collectionId, profileId, querySetId, convertToJavaObject(config));
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Tuning] Error modifying query set:', error.message);
    throw error;
  }
}

export async function deleteQuerySet(collectionId, profileId, querySetId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const result = await callJavaMethod(command, 'deleteQuerySet', collectionId, profileId, querySetId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Tuning] Error deleting query set:', error.message);
    throw error;
  }
}

export async function copyQuerySet(collectionId, profileId, querySetId, newQuerySetName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const result = await callJavaMethod(command, 'copyQuerySet', collectionId, profileId, querySetId, newQuerySetName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Tuning] Error copying query set:', error.message);
    throw error;
  }
}

// ==================== 필터/정렬/그룹 설정 (15+ 메서드) ====================

export async function setFilterFields(collectionId, profileId, querySetId, fields = [], instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const result = await callJavaMethod(command, 'setFilterFields', collectionId, profileId, querySetId, convertToJavaObject(fields));
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Tuning] Error setting filter fields:', error.message);
    throw error;
  }
}

export async function setSortFields(collectionId, profileId, querySetId, fields = [], instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const result = await callJavaMethod(command, 'setSortFields', collectionId, profileId, querySetId, convertToJavaObject(fields));
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Tuning] Error setting sort fields:', error.message);
    throw error;
  }
}

export async function setGroupByField(collectionId, profileId, querySetId, field, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const result = await callJavaMethod(command, 'setGroupByField', collectionId, profileId, querySetId, field);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Tuning] Error setting group by field:', error.message);
    throw error;
  }
}

export async function setSearchFields(collectionId, profileId, querySetId, fields = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const result = await callJavaMethod(command, 'setSearchFields', collectionId, profileId, querySetId, convertToJavaObject(fields));
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Tuning] Error setting search fields:', error.message);
    throw error;
  }
}

// ==================== 랭킹 모델 (10+ 메서드) ====================

export async function setRankingModel(collectionId, profileId, querySetId, modelName, config = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const result = await callJavaMethod(command, 'setRankingModel', collectionId, profileId, querySetId, modelName, convertToJavaObject(config));
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Tuning] Error setting ranking model:', error.message);
    throw error;
  }
}

export async function getRankingModel(collectionId, profileId, querySetId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const model = await callJavaMethod(command, 'getRankingModel', collectionId, profileId, querySetId);
    releaseAdminClient(instanceId);
    return javaMapToObject(model);
  } catch (error) {
    console.error('[Tuning] Error getting ranking model:', error.message);
    throw error;
  }
}

export async function setRankingWeight(collectionId, profileId, querySetId, fieldName, weight, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Profile']);
    const result = await callJavaMethod(command, 'setRankingWeight', collectionId, profileId, querySetId, fieldName, weight);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Tuning] Error setting ranking weight:', error.message);
    throw error;
  }
}

export default {
  // Search Profile
  createSearchProfile,
  getSearchProfile,
  listSearchProfiles,
  modifySearchProfile,
  deleteSearchProfile,

  // QuerySet
  createQuerySet,
  getQuerySet,
  listQuerySets,
  modifyQuerySet,
  deleteQuerySet,
  copyQuerySet,

  // Filter/Sort/Group
  setFilterFields,
  setSortFields,
  setGroupByField,
  setSearchFields,

  // Ranking
  setRankingModel,
  getRankingModel,
  setRankingWeight
};
