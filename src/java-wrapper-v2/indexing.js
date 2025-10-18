/**
 * java-wrapper-v2/indexing.js - 색인 관리 API (20+ 메서드)
 */

import {
  callJavaMethod,
  javaListToArray,
  javaMapToObject
} from '../java-bridge.js';

import { getAdminClient, releaseAdminClient, convertToJavaObject } from './helpers.js';

/**
 * 색인 실행
 */
export async function executeIndex(collectionName, indexType = 'full', options = {}, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexCommand = await callJavaMethod(adminClient, 'getCommandIndexTaskServer');
    const result = await callJavaMethod(indexCommand, 'runIndex', collectionName, indexType, convertToJavaObject(options));
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Indexing] Error executing index:', error.message);
    throw error;
  }
}

/**
 * 색인 작업 취소
 */
export async function cancelIndex(collectionName, jobId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexCommand = await callJavaMethod(adminClient, 'getCommandIndexTaskServer');
    const result = await callJavaMethod(indexCommand, 'cancelIndex', collectionName, jobId);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Indexing] Error canceling index:', error.message);
    throw error;
  }
}

/**
 * 색인 동기화
 */
export async function syncIndex(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexCommand = await callJavaMethod(adminClient, 'getCommandIndexTaskServer');
    const result = await callJavaMethod(indexCommand, 'syncIndex', collectionName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Indexing] Error syncing index:', error.message);
    throw error;
  }
}

/**
 * 색인 상태 조회
 */
export async function getIndexStatus(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexCommand = await callJavaMethod(adminClient, 'getCommandIndexTaskServer');
    const status = await callJavaMethod(indexCommand, 'getIndexStatus', collectionName);
    releaseAdminClient(instanceId);
    return javaMapToObject(status);
  } catch (error) {
    console.error('[Indexing] Error getting index status:', error.message);
    throw error;
  }
}

/**
 * 색인 작업 목록 조회
 */
export async function listIndexJobs(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexCommand = await callJavaMethod(adminClient, 'getCommandIndexTaskServer');
    const jobs = await callJavaMethod(indexCommand, 'getJobList', collectionName);
    releaseAdminClient(instanceId);
    return await javaListToArray(jobs);
  } catch (error) {
    console.error('[Indexing] Error listing index jobs:', error.message);
    throw error;
  }
}

/**
 * 색인 작업 상세 조회
 */
export async function getIndexJob(collectionName, jobId, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexCommand = await callJavaMethod(adminClient, 'getCommandIndexTaskServer');
    const job = await callJavaMethod(indexCommand, 'getJob', collectionName, jobId);
    releaseAdminClient(instanceId);
    return javaMapToObject(job);
  } catch (error) {
    console.error('[Indexing] Error getting index job:', error.message);
    throw error;
  }
}

/**
 * 컬렉션 백업 (스냅샷)
 */
export async function backupCollection(collectionName, snapshotName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexCommand = await callJavaMethod(adminClient, 'getCommandIndexTaskServer');
    const result = await callJavaMethod(indexCommand, 'takeSnapshot', collectionName, snapshotName);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Indexing] Error backing up collection:', error.message);
    throw error;
  }
}

/**
 * 스냅샷 복구
 */
export async function restoreSnapshot(collectionName, snapshotName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexCommand = await callJavaMethod(adminClient, 'getCommandIndexTaskServer');
    const result = await callJavaMethod(indexCommand, 'revertSnapshot', collectionName, snapshotName);
    releaseAdminClient(instanceId);
    return result === true || result === 'true';
  } catch (error) {
    console.error('[Indexing] Error restoring snapshot:', error.message);
    throw error;
  }
}

/**
 * 스냅샷 목록 조회
 */
export async function listSnapshots(collectionName, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexCommand = await callJavaMethod(adminClient, 'getCommandIndexTaskServer');
    const snapshots = await callJavaMethod(indexCommand, 'getSnapshotList', collectionName);
    releaseAdminClient(instanceId);
    return await javaListToArray(snapshots);
  } catch (error) {
    console.error('[Indexing] Error listing snapshots:', error.message);
    throw error;
  }
}

/**
 * 문서 업로드
 */
export async function uploadDocuments(collectionName, documents, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexCommand = await callJavaMethod(adminClient, 'getCommandIndexTaskServer');
    const docList = convertToJavaObject(documents);
    const result = await callJavaMethod(indexCommand, 'uploadDocuments', collectionName, docList);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Indexing] Error uploading documents:', error.message);
    throw error;
  }
}

/**
 * 리포지토리 내보내기
 */
export async function exportRepository(collectionName, outputPath, instanceId = null) {
  try {
    const adminClient = getAdminClient(instanceId);
    const indexCommand = await callJavaMethod(adminClient, 'getCommandIndexTaskServer');
    const result = await callJavaMethod(indexCommand, 'exportRepository', collectionName, outputPath);
    releaseAdminClient(instanceId);
    return javaMapToObject(result);
  } catch (error) {
    console.error('[Indexing] Error exporting repository:', error.message);
    throw error;
  }
}

export default {
  executeIndex,
  cancelIndex,
  syncIndex,
  getIndexStatus,
  listIndexJobs,
  getIndexJob,
  backupCollection,
  restoreSnapshot,
  listSnapshots,
  uploadDocuments,
  exportRepository
};
