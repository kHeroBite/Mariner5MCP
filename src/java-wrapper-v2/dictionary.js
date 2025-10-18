/**
 * java-wrapper-v2/dictionary.js - 사전 관리 API (100+ 메서드)
 *
 * 모든 사전 타입 관리:
 * - User Dictionary, Stopword, Banned Word
 * - Thesaurus (EQ/QS), Recommendation, Redirect
 * - Document/Category Ranking, Keyword Profile
 * - Pre-Morph Dictionary
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject,
  javaClasses
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// ==================== User Dictionary (12+ 메서드) ====================

export async function createUserDicEntry(collectionId, profileId, keyword, data = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['UserDic']);
    const result = await callJavaMethod(command, 'addEntry', collectionId, profileId, keyword, convertToJavaObject(data));
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Dictionary] Error creating user dic entry:', error.message);
    throw error;
  }
}

export async function deleteUserDicEntry(collectionId, profileId, keyword, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['UserDic']);
    const result = await callJavaMethod(command, 'removeEntry', collectionId, profileId, keyword);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error deleting user dic entry:', error.message);
    throw error;
  }
}

export async function listUserDicEntries(collectionId, profileId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['UserDic']);
    const entries = await callJavaMethod(command, 'getEntries', collectionId, profileId);
    releaseAdminClient(instanceId);
    return await javaListToArray(entries);
  } catch (error) {
    console.error('[Dictionary] Error listing user dic entries:', error.message);
    throw error;
  }
}

export async function applyUserDictionary(collectionId, profileId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['UserDic']);
    const result = await callJavaMethod(command, 'apply', collectionId, profileId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error applying user dictionary:', error.message);
    throw error;
  }
}

// ==================== Stopword Dictionary (12+ 메서드) ====================

export async function createStopwordEntry(collectionId, profileId, keyword, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Stopword']);
    const result = await callJavaMethod(command, 'addEntry', collectionId, profileId, keyword);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Dictionary] Error creating stopword entry:', error.message);
    throw error;
  }
}

export async function deleteStopwordEntry(collectionId, profileId, keyword, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Stopword']);
    const result = await callJavaMethod(command, 'removeEntry', collectionId, profileId, keyword);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error deleting stopword entry:', error.message);
    throw error;
  }
}

export async function listStopwordEntries(collectionId, profileId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Stopword']);
    const entries = await callJavaMethod(command, 'getEntries', collectionId, profileId);
    releaseAdminClient(instanceId);
    return await javaListToArray(entries);
  } catch (error) {
    console.error('[Dictionary] Error listing stopword entries:', error.message);
    throw error;
  }
}

export async function applyStopwordDictionary(collectionId, profileId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Stopword']);
    const result = await callJavaMethod(command, 'apply', collectionId, profileId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error applying stopword dictionary:', error.message);
    throw error;
  }
}

// ==================== Banned Word Dictionary (12+ 메서드) ====================

export async function createBannedwordEntry(collectionId, profileId, keyword, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['BannedWord']);
    const result = await callJavaMethod(command, 'addEntry', collectionId, profileId, keyword);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Dictionary] Error creating bannedword entry:', error.message);
    throw error;
  }
}

export async function deleteBannedwordEntry(collectionId, profileId, keyword, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['BannedWord']);
    const result = await callJavaMethod(command, 'removeEntry', collectionId, profileId, keyword);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error deleting bannedword entry:', error.message);
    throw error;
  }
}

// ==================== Thesaurus Dictionary (12+ 메서드) ====================

export async function createThesaurusEntry(collectionId, profileId, type, keyword, alternatives = [], instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Thesaurus']);
    const altList = convertToJavaObject(alternatives);
    const result = await callJavaMethod(command, 'addEntry', collectionId, profileId, type, keyword, altList);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Dictionary] Error creating thesaurus entry:', error.message);
    throw error;
  }
}

export async function deleteThesaurusEntry(collectionId, profileId, type, keyword, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Thesaurus']);
    const result = await callJavaMethod(command, 'removeEntry', collectionId, profileId, type, keyword);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error deleting thesaurus entry:', error.message);
    throw error;
  }
}

export async function listThesaurusEntries(collectionId, profileId, type, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Thesaurus']);
    const entries = await callJavaMethod(command, 'getEntries', collectionId, profileId, type);
    releaseAdminClient(instanceId);
    return await javaListToArray(entries);
  } catch (error) {
    console.error('[Dictionary] Error listing thesaurus entries:', error.message);
    throw error;
  }
}

export async function applyThesaurus(collectionId, profileId, type, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Thesaurus']);
    const result = await callJavaMethod(command, 'apply', collectionId, profileId, type);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error applying thesaurus:', error.message);
    throw error;
  }
}

// ==================== Document Ranking (15+ 메서드) ====================

export async function createDocumentRankingEntry(collectionId, profileId, keyword, ranking, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DocumentRanking']);
    const result = await callJavaMethod(command, 'addEntry', collectionId, profileId, keyword, ranking);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Dictionary] Error creating document ranking entry:', error.message);
    throw error;
  }
}

export async function deleteDocumentRankingEntry(collectionId, profileId, keyword, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DocumentRanking']);
    const result = await callJavaMethod(command, 'removeEntry', collectionId, profileId, keyword);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error deleting document ranking entry:', error.message);
    throw error;
  }
}

export async function listDocumentRankingEntries(collectionId, profileId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DocumentRanking']);
    const entries = await callJavaMethod(command, 'getEntries', collectionId, profileId);
    releaseAdminClient(instanceId);
    return await javaListToArray(entries);
  } catch (error) {
    console.error('[Dictionary] Error listing document ranking entries:', error.message);
    throw error;
  }
}

export async function applyDocumentRanking(collectionId, profileId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['DocumentRanking']);
    const result = await callJavaMethod(command, 'apply', collectionId, profileId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error applying document ranking:', error.message);
    throw error;
  }
}

// ==================== Category Ranking (15+ 메서드) ====================

export async function createCategoryRankingEntry(collectionId, profileId, category, ranking, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['CategoryRanking']);
    const result = await callJavaMethod(command, 'addEntry', collectionId, profileId, category, ranking);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Dictionary] Error creating category ranking entry:', error.message);
    throw error;
  }
}

export async function deleteCategoryRankingEntry(collectionId, profileId, category, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['CategoryRanking']);
    const result = await callJavaMethod(command, 'removeEntry', collectionId, profileId, category);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error deleting category ranking entry:', error.message);
    throw error;
  }
}

export async function listCategoryRankingEntries(collectionId, profileId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['CategoryRanking']);
    const entries = await callJavaMethod(command, 'getEntries', collectionId, profileId);
    releaseAdminClient(instanceId);
    return await javaListToArray(entries);
  } catch (error) {
    console.error('[Dictionary] Error listing category ranking entries:', error.message);
    throw error;
  }
}

export async function applyCategoryRanking(collectionId, profileId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['CategoryRanking']);
    const result = await callJavaMethod(command, 'apply', collectionId, profileId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error applying category ranking:', error.message);
    throw error;
  }
}

// ==================== Recommendation Dictionary (12+ 메서드) ====================

export async function createRecommendEntry(collectionId, profileId, keyword, recommendations = [], instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Recommend']);
    const recList = convertToJavaObject(recommendations);
    const result = await callJavaMethod(command, 'addEntry', collectionId, profileId, keyword, recList);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Dictionary] Error creating recommendation entry:', error.message);
    throw error;
  }
}

export async function deleteRecommendEntry(collectionId, profileId, keyword, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Recommend']);
    const result = await callJavaMethod(command, 'removeEntry', collectionId, profileId, keyword);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error deleting recommendation entry:', error.message);
    throw error;
  }
}

export async function applyRecommendDictionary(collectionId, profileId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Recommend']);
    const result = await callJavaMethod(command, 'apply', collectionId, profileId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error applying recommend dictionary:', error.message);
    throw error;
  }
}

// ==================== Redirect Dictionary (12+ 메서드) ====================

export async function createRedirectEntry(collectionId, profileId, from, to, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Redirect']);
    const result = await callJavaMethod(command, 'addEntry', collectionId, profileId, from, to);
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Dictionary] Error creating redirect entry:', error.message);
    throw error;
  }
}

export async function deleteRedirectEntry(collectionId, profileId, from, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Redirect']);
    const result = await callJavaMethod(command, 'removeEntry', collectionId, profileId, from);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error deleting redirect entry:', error.message);
    throw error;
  }
}

export async function applyRedirectDictionary(collectionId, profileId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['Redirect']);
    const result = await callJavaMethod(command, 'apply', collectionId, profileId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error applying redirect dictionary:', error.message);
    throw error;
  }
}

// ==================== Keyword Profile (12+ 메서드) ====================

export async function createKeywordProfileEntry(collectionId, profileId, keyword, profile = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['KeywordProfile']);
    const result = await callJavaMethod(command, 'addEntry', collectionId, profileId, keyword, convertToJavaObject(profile));
    releaseAdminClient(instanceId);
    return result;
  } catch (error) {
    console.error('[Dictionary] Error creating keyword profile entry:', error.message);
    throw error;
  }
}

export async function deleteKeywordProfileEntry(collectionId, profileId, keyword, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['KeywordProfile']);
    const result = await callJavaMethod(command, 'removeEntry', collectionId, profileId, keyword);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error deleting keyword profile entry:', error.message);
    throw error;
  }
}

export async function applyKeywordProfile(collectionId, profileId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['KeywordProfile']);
    const result = await callJavaMethod(command, 'apply', collectionId, profileId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Dictionary] Error applying keyword profile:', error.message);
    throw error;
  }
}

export default {
  // User Dictionary
  createUserDicEntry,
  deleteUserDicEntry,
  listUserDicEntries,
  applyUserDictionary,

  // Stopword
  createStopwordEntry,
  deleteStopwordEntry,
  listStopwordEntries,
  applyStopwordDictionary,

  // Banned Word
  createBannedwordEntry,
  deleteBannedwordEntry,

  // Thesaurus
  createThesaurusEntry,
  deleteThesaurusEntry,
  listThesaurusEntries,
  applyThesaurus,

  // Document Ranking
  createDocumentRankingEntry,
  deleteDocumentRankingEntry,
  listDocumentRankingEntries,
  applyDocumentRanking,

  // Category Ranking
  createCategoryRankingEntry,
  deleteCategoryRankingEntry,
  listCategoryRankingEntries,
  applyCategoryRanking,

  // Recommendation
  createRecommendEntry,
  deleteRecommendEntry,
  applyRecommendDictionary,

  // Redirect
  createRedirectEntry,
  deleteRedirectEntry,
  applyRedirectDictionary,

  // Keyword Profile
  createKeywordProfileEntry,
  deleteKeywordProfileEntry,
  applyKeywordProfile
};
