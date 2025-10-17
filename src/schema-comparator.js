/**
 * schema-comparator.js - 기존 컬렉션 필드와 새 SQL 테이블 스키마 비교
 *
 * 기존 Mariner5 컬렉션의 필드와 새로 분석한 테이블 스키마를 비교하여
 * 추가/수정/삭제할 필드를 자동으로 분류
 */

/**
 * 필드 목록 비교 (기존 vs 새로운)
 * @param {Array} existingFields - 기존 컬렉션 필드 배열
 * @param {Array} newFields - 새로 분석한 필드 배열
 * @returns {object} { toAdd, toRemove, toModify, noChange }
 */
export function compareFieldLists(existingFields = [], newFields = []) {
  // 필드명으로 맵 생성 (빠른 검색용)
  const existingMap = new Map(existingFields.map(f => [f.name, f]));
  const newMap = new Map(newFields.map(f => [f.name, f]));

  const toAdd = [];
  const toRemove = [];
  const toModify = [];
  const noChange = [];

  // 1. 새로운 필드 중 추가/수정 판단
  for (const [fieldName, newField] of newMap) {
    const existing = existingMap.get(fieldName);

    if (!existing) {
      // 새로운 필드 → 추가
      toAdd.push({
        ...newField,
        action: 'add',
        reason: '테이블에서 새로 발견'
      });
    } else {
      // 기존 필드와 비교
      const changes = detectFieldChanges(existing, newField);

      if (changes.length === 0) {
        // 변경사항 없음
        noChange.push({
          name: fieldName,
          action: 'keep',
          reason: '변경사항 없음'
        });
      } else {
        // 수정 필요
        toModify.push({
          name: fieldName,
          existing,
          new: newField,
          changes,
          action: 'modify'
        });
      }
    }
  }

  // 2. 기존 필드 중 제거 판단
  for (const [fieldName, existingField] of existingMap) {
    if (!newMap.has(fieldName)) {
      // 테이블에서 제거된 필드 → 컬렉션에서도 제거할 후보
      toRemove.push({
        name: fieldName,
        existing: existingField,
        action: 'remove',
        reason: '테이블에서 제거됨'
      });
    }
  }

  return {
    toAdd,
    toRemove,
    toModify,
    noChange,
    summary: {
      total: existingFields.length,
      newTotal: newFields.length,
      addCount: toAdd.length,
      removeCount: toRemove.length,
      modifyCount: toModify.length,
      unchangeCount: noChange.length
    }
  };
}

/**
 * 개별 필드의 변경사항 감지
 * @param {object} existing - 기존 필드
 * @param {object} newField - 새 필드
 * @returns {Array} 변경사항 배열
 */
export function detectFieldChanges(existing, newField) {
  const changes = [];

  // 타입 변경
  if (existing.type !== newField.type) {
    changes.push({
      property: 'type',
      old: existing.type,
      new: newField.type,
      severity: 'high'
    });
  }

  // 색인 여부 변경
  if (existing.indexed !== newField.indexed) {
    changes.push({
      property: 'indexed',
      old: existing.indexed,
      new: newField.indexed,
      severity: 'medium'
    });
  }

  // 정렬 가능 여부 변경
  if (existing.sortable !== newField.sortable) {
    changes.push({
      property: 'sortable',
      old: existing.sortable,
      new: newField.sortable,
      severity: 'low'
    });
  }

  // Analyzer 변경
  if (existing.analyzer !== newField.analyzer) {
    changes.push({
      property: 'analyzer',
      old: existing.analyzer,
      new: newField.analyzer,
      severity: 'medium'
    });
  }

  // stored 여부 변경
  if (existing.stored !== newField.stored) {
    changes.push({
      property: 'stored',
      old: existing.stored,
      new: newField.stored,
      severity: 'low'
    });
  }

  return changes;
}

/**
 * 필드 타입 호환성 검사
 * @param {string} oldType - 기존 타입
 * @param {string} newType - 새 타입
 * @returns {object} { compatible, warning }
 */
export function checkTypeCompatibility(oldType, newType) {
  const typeGroups = {
    text: ['TEXT', 'VARCHAR', 'CHAR'],
    number: ['INTEGER', 'LONG', 'DOUBLE'],
    datetime: ['DATE', 'DATETIME', 'TIME'],
    boolean: ['BOOLEAN'],
    binary: ['BINARY']
  };

  // 그룹 찾기
  let oldGroup = null;
  let newGroup = null;

  for (const [group, types] of Object.entries(typeGroups)) {
    if (types.includes(oldType)) oldGroup = group;
    if (types.includes(newType)) newGroup = group;
  }

  if (oldType === newType) {
    return { compatible: true, warning: null };
  }

  // 같은 그룹 내 변경은 호환 가능 (경고 포함)
  if (oldGroup && oldGroup === newGroup) {
    return {
      compatible: true,
      warning: `타입 변경: ${oldType} → ${newType} (같은 그룹, 검색 재실행 권장)`
    };
  }

  // 다른 그룹 변경은 호환 불가
  return {
    compatible: false,
    warning: `타입 불일치: ${oldType} (${oldGroup}) ↔ ${newType} (${newGroup})`
  };
}

/**
 * 추천 액션 생성 (updateMode에 따라)
 * @param {object} comparison - compareFieldLists 결과
 * @param {string} updateMode - 'safe' 또는 'smart'
 * @returns {object} { actions, warnings, info }
 */
export function recommendActions(comparison, updateMode = 'safe') {
  const actions = [];
  const warnings = [];
  const info = [];

  // SAFE 모드: 추가만
  if (updateMode === 'safe') {
    // 필드 추가
    for (const field of comparison.toAdd) {
      actions.push({
        type: 'add',
        field: field.name,
        details: field,
        priority: 'high'
      });
    }

    // 제거할 필드 경고만 표시
    for (const field of comparison.toRemove) {
      warnings.push({
        type: 'warning',
        message: `필드 '${field.name}'이 테이블에서 제거되었습니다 (자동 제거 안 함)`,
        severity: 'medium'
      });
    }

    // 수정할 필드 경고만 표시
    for (const field of comparison.toModify) {
      warnings.push({
        type: 'warning',
        message: `필드 '${field.name}' 속성 변경 감지 (자동 수정 안 함): ${field.changes.map(c => `${c.property}`).join(', ')}`,
        severity: 'low'
      });
    }

    info.push({
      message: 'SAFE 모드: 필드 추가만 수행됩니다. 기존 필드는 유지됩니다.'
    });
  }

  // SMART 모드: 모두 처리
  else if (updateMode === 'smart') {
    // 필드 추가
    for (const field of comparison.toAdd) {
      actions.push({
        type: 'add',
        field: field.name,
        details: field,
        priority: 'high'
      });
    }

    // 필드 수정
    for (const field of comparison.toModify) {
      // 호환성 검사
      const compat = checkTypeCompatibility(field.existing.type, field.new.type);

      actions.push({
        type: 'modify',
        field: field.name,
        changes: field.changes,
        compatible: compat.compatible,
        warning: compat.warning,
        priority: compat.compatible ? 'medium' : 'high'
      });

      if (compat.warning) {
        warnings.push({
          type: 'warning',
          message: compat.warning,
          severity: 'medium'
        });
      }
    }

    // 필드 삭제
    for (const field of comparison.toRemove) {
      actions.push({
        type: 'remove',
        field: field.name,
        reason: field.reason,
        priority: 'medium'
      });

      warnings.push({
        type: 'warning',
        message: `필드 '${field.name}'이 테이블에서 제거되었으므로 컬렉션에서도 제거합니다.`,
        severity: 'low'
      });
    }

    info.push({
      message: 'SMART 모드: 필드 추가/수정/삭제 모두 수행됩니다.'
    });
  }

  return {
    actions,
    warnings,
    info,
    summary: {
      totalActions: actions.length,
      warningCount: warnings.length,
      infoCount: info.length
    }
  };
}

/**
 * 필드 업데이트 작업 계획 생성
 * @param {Array} actions - recommendActions 결과의 actions
 * @returns {object} { columnsToAdd, columnsToModify, columnsToRemove }
 */
export function generateUpdatePlan(actions) {
  const columnsToAdd = [];
  const columnsToModify = [];
  const columnsToRemove = [];

  for (const action of actions) {
    if (action.type === 'add') {
      columnsToAdd.push({
        field: action.field,
        type: action.details.type,
        indexed: action.details.indexed,
        stored: action.details.stored,
        analyzer: action.details.analyzer,
        options: { sortable: action.details.sortable }
      });
    } else if (action.type === 'modify') {
      columnsToModify.push({
        field: action.field,
        changes: action.changes,
        priority: action.priority
      });
    } else if (action.type === 'remove') {
      columnsToRemove.push({
        field: action.field,
        reason: action.reason
      });
    }
  }

  return {
    columnsToAdd,
    columnsToModify,
    columnsToRemove,
    totalOperations: actions.length
  };
}

export default {
  compareFieldLists,
  detectFieldChanges,
  checkTypeCompatibility,
  recommendActions,
  generateUpdatePlan
};
