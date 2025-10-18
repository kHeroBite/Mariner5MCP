/**
 * java-wrapper-v2/analyzer-config.js - 분석기(Analyzer) 설정 API ⭐ v3.7 신규
 *
 * - Analyzer 선택: 형태소분석 / 바이그램 / 유니그램 명시적 제어
 * - 필드별 Analyzer 설정
 * - Analyzer 테스트 및 비교
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject,
  javaClasses
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

// ==================== Analyzer 관리 (10+ 메서드) ====================

/**
 * 사용 가능한 모든 Analyzer 목록 조회
 */
export async function listAnalyzers(instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AnalyzerConfig']);
    const result = await callJavaMethod(command, 'listAnalyzers');
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Analyzer] Error listing analyzers:', error.message);
    throw error;
  }
}

/**
 * 필드의 현재 Analyzer 조회
 */
export async function getFieldAnalyzer(collectionName, fieldName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AnalyzerConfig']);
    const result = await callJavaMethod(command, 'getFieldAnalyzer', collectionName, fieldName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Analyzer] Error getting field analyzer:', error.message);
    throw error;
  }
}

/**
 * 필드의 Analyzer 설정
 * @param {string} collectionName - 컬렉션명
 * @param {string} fieldName - 필드명
 * @param {object} analyzerConfig - 분석기 설정
 *   - type: 'korean_morpheme' | 'bigram' | 'unigram' | 'standard' | 'keyword'
 *   - options: 분석기별 옵션
 */
export async function setFieldAnalyzer(collectionName, fieldName, analyzerConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AnalyzerConfig']);
    const javaConfig = convertToJavaObject(analyzerConfig);
    const result = await callJavaMethod(
      command,
      'setFieldAnalyzer',
      collectionName,
      fieldName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Analyzer] Error setting field analyzer:', error.message);
    throw error;
  }
}

/**
 * 형태소 분석(Morpheme) 설정
 * @param {string} collectionName - 컬렉션명
 * @param {string} fieldName - 필드명
 * @param {object} options - 형태소 분석 옵션
 *   - maxCompound: 최대 복합어 개수 (기본값: 2)
 *   - fallback: 실패 시 폴백 분석기 (기본값: 'bigram')
 *   - removeStopwords: 불용어 제거 여부 (기본값: true)
 */
export async function setMorphemeAnalyzer(collectionName, fieldName, options = {}, instanceId = null) {
  try {
    const defaultOptions = {
      maxCompound: 2,
      fallback: 'bigram',
      removeStopwords: true,
      ...options
    };
    return await setFieldAnalyzer(collectionName, fieldName, {
      type: 'korean_morpheme',
      options: defaultOptions
    }, instanceId);
  } catch (error) {
    console.error('[Analyzer] Error setting morpheme analyzer:', error.message);
    throw error;
  }
}

/**
 * 바이그램(Bigram) 분석 설정
 * @param {string} collectionName - 컬렉션명
 * @param {string} fieldName - 필드명
 * @param {object} options - 바이그램 옵션
 *   - minGram: 최소 그램 길이 (기본값: 2)
 *   - maxGram: 최대 그램 길이 (기본값: 2)
 *   - tokenChars: 토큰에 포함할 문자 (기본값: 'letter,digit')
 */
export async function setBigramAnalyzer(collectionName, fieldName, options = {}, instanceId = null) {
  try {
    const defaultOptions = {
      minGram: 2,
      maxGram: 2,
      tokenChars: 'letter,digit',
      ...options
    };
    return await setFieldAnalyzer(collectionName, fieldName, {
      type: 'bigram',
      options: defaultOptions
    }, instanceId);
  } catch (error) {
    console.error('[Analyzer] Error setting bigram analyzer:', error.message);
    throw error;
  }
}

/**
 * 유니그램(Unigram) 분석 설정
 * @param {string} collectionName - 컬렉션명
 * @param {string} fieldName - 필드명
 * @param {object} options - 유니그램 옵션
 *   - minGram: 최소 그램 길이 (기본값: 1)
 *   - maxGram: 최대 그램 길이 (기본값: 1)
 */
export async function setUnigramAnalyzer(collectionName, fieldName, options = {}, instanceId = null) {
  try {
    const defaultOptions = {
      minGram: 1,
      maxGram: 1,
      ...options
    };
    return await setFieldAnalyzer(collectionName, fieldName, {
      type: 'unigram',
      options: defaultOptions
    }, instanceId);
  } catch (error) {
    console.error('[Analyzer] Error setting unigram analyzer:', error.message);
    throw error;
  }
}

/**
 * Analyzer 테스트: 텍스트를 분석하여 토큰 목록 반환
 */
export async function testAnalyzer(analyzerType, text, options = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AnalyzerConfig']);
    const javaOptions = convertToJavaObject(options);
    const result = await callJavaMethod(
      command,
      'testAnalyzer',
      analyzerType,
      text,
      javaOptions
    );
    releaseAdminClient(instanceId);
    return await javaListToArray(result);
  } catch (error) {
    console.error('[Analyzer] Error testing analyzer:', error.message);
    throw error;
  }
}

/**
 * 두 Analyzer 비교
 */
export async function compareAnalyzers(text, analyzer1Type, analyzer2Type, options1 = {}, options2 = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AnalyzerConfig']);
    const javaOpts1 = convertToJavaObject(options1);
    const javaOpts2 = convertToJavaObject(options2);
    const result = await callJavaMethod(
      command,
      'compareAnalyzers',
      text,
      analyzer1Type,
      analyzer2Type,
      javaOpts1,
      javaOpts2
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Analyzer] Error comparing analyzers:', error.message);
    throw error;
  }
}

/**
 * 최적 Analyzer 추천 (데이터 샘플 기반)
 */
export async function recommendAnalyzer(fieldName, dataSamples = [], collectionName = null, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AnalyzerConfig']);
    const javaSamples = convertToJavaObject(dataSamples);
    const result = await callJavaMethod(
      command,
      'recommendAnalyzer',
      fieldName,
      javaSamples,
      collectionName || ''
    );
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Analyzer] Error recommending analyzer:', error.message);
    throw error;
  }
}

/**
 * 필드 Analyzer 초기화 (기본값으로)
 */
export async function resetFieldAnalyzer(collectionName, fieldName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AnalyzerConfig']);
    const result = await callJavaMethod(command, 'resetFieldAnalyzer', collectionName, fieldName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Analyzer] Error resetting field analyzer:', error.message);
    throw error;
  }
}

/**
 * 컬렉션의 모든 Analyzer 설정 조회
 */
export async function getCollectionAnalyzers(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AnalyzerConfig']);
    const result = await callJavaMethod(command, 'getCollectionAnalyzers', collectionName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Analyzer] Error getting collection analyzers:', error.message);
    throw error;
  }
}

/**
 * 컬렉션 Analyzer 일괄 설정
 */
export async function setCollectionAnalyzers(collectionName, analyzerConfig = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const command = await callJavaMethod(adminClient, 'getCommand', ['AnalyzerConfig']);
    const javaConfig = convertToJavaObject(analyzerConfig);
    const result = await callJavaMethod(
      command,
      'setCollectionAnalyzers',
      collectionName,
      javaConfig
    );
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Analyzer] Error setting collection analyzers:', error.message);
    throw error;
  }
}

export default {
  // Analyzer 관리
  listAnalyzers,
  getFieldAnalyzer,
  setFieldAnalyzer,
  setMorphemeAnalyzer,
  setBigramAnalyzer,
  setUnigramAnalyzer,
  testAnalyzer,
  compareAnalyzers,
  recommendAnalyzer,
  resetFieldAnalyzer,
  getCollectionAnalyzers,
  setCollectionAnalyzers
};
