/**
 * java-wrapper-v2/query-builder.js - 검색 쿼리 빌더 (Fluent API) ⭐ v3.7 신규
 *
 * Fluent 패턴으로 직관적인 검색 쿼리 작성
 * REST API 호환 QuerySet 자동 생성
 */

/**
 * Fluent API 기반 검색 쿼리 빌더
 *
 * 사용 예시:
 * const query = new SearchQueryBuilder()
 *   .from('products')
 *   .select(['title', 'price', 'image'])
 *   .where('노트북')
 *   .filter('price', '>=', 500000)
 *   .filter('price', '<=', 2000000)
 *   .sort('created_at', 'DESC')
 *   .sort('price', 'ASC')
 *   .page(0, 20)
 *   .build();
 */
export class SearchQueryBuilder {
  constructor() {
    this.querySet = {
      version: '1.0',
      query: [{
        fromSet: { collection: [] },
        selectSet: { fields: ['*'] },
        whereSet: { operator: 'AND', searchKeyword: '', filters: [] },
        sortSet: [],
        groupSet: [],
        highlightSet: {},
        facetSet: [],
        pageSet: { start: 0, count: 20 }
      }]
    };
  }

  /**
   * 컬렉션 지정
   * @param {string|string[]} collections - 컬렉션명(들)
   */
  from(collections) {
    const cols = Array.isArray(collections) ? collections : [collections];
    this.querySet.query[0].fromSet.collection = cols;
    return this;
  }

  /**
   * 조회 필드 지정
   * @param {string[]} fields - 필드명 배열 (기본값: ['*'])
   */
  select(fields) {
    this.querySet.query[0].selectSet.fields = Array.isArray(fields) ? fields : [fields];
    return this;
  }

  /**
   * 검색 키워드 설정
   * @param {string} keyword - 검색 키워드
   * @param {string} operator - 연산자 ('AND' | 'OR' | 'NOT')
   */
  where(keyword, operator = 'AND') {
    this.querySet.query[0].whereSet.searchKeyword = keyword;
    this.querySet.query[0].whereSet.operator = operator;
    return this;
  }

  /**
   * 필터 조건 추가
   * @param {string} field - 필드명
   * @param {string} operator - 연산자 ('=', '!=', '>', '<', '>=', '<=', 'in', 'between', 'like')
   * @param {any} value - 비교값
   */
  filter(field, operator, value) {
    this.querySet.query[0].whereSet.filters.push({
      field,
      operator,
      value
    });
    return this;
  }

  /**
   * 정렬 조건 추가
   * @param {string} field - 정렬 필드
   * @param {string} order - 정렬 순서 ('ASC' | 'DESC')
   * @param {number} priority - 정렬 우선순위 (1=1차, 2=2차, ...)
   */
  sort(field, order = 'ASC', priority = null) {
    const sortItem = { field, order };
    if (priority !== null) {
      sortItem.priority = priority;
    }
    this.querySet.query[0].sortSet.push(sortItem);
    return this;
  }

  /**
   * 그룹화 설정
   * @param {string[]} fields - 그룹화 필드
   * @param {object} aggregations - 집계 함수 (count, sum, avg, min, max)
   */
  group(fields, aggregations = {}) {
    this.querySet.query[0].groupSet = {
      fields: Array.isArray(fields) ? fields : [fields],
      aggregations
    };
    return this;
  }

  /**
   * 페이징 설정
   * @param {number} start - 시작 위치 (0 부터)
   * @param {number} count - 반환 문서 수
   */
  page(start, count) {
    this.querySet.query[0].pageSet = { start, count };
    return this;
  }

  /**
   * 하이라이트 설정
   * @param {string[]} fields - 하이라이트할 필드
   * @param {object} options - 하이라이트 옵션 (preTag, postTag, fragmentSize)
   */
  highlight(fields, options = {}) {
    this.querySet.query[0].highlightSet = {
      fields: Array.isArray(fields) ? fields : [fields],
      ...options
    };
    return this;
  }

  /**
   * Facet 검색 설정
   * @param {string} field - Facet 필드
   * @param {number} limit - Facet 항목 수
   */
  facet(field, limit = 10) {
    this.querySet.query[0].facetSet.push({
      field,
      limit
    });
    return this;
  }

  /**
   * 쿼리셋 검증
   * @returns {object} 검증 결과 { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];
    const query = this.querySet.query[0];

    if (!query.fromSet.collection || query.fromSet.collection.length === 0) {
      errors.push('컬렉션이 지정되지 않았습니다');
    }

    if (!query.selectSet.fields || query.selectSet.fields.length === 0) {
      errors.push('조회 필드가 지정되지 않았습니다');
    }

    if (query.pageSet.start < 0) {
      errors.push('페이지 시작 위치는 0 이상이어야 합니다');
    }

    if (query.pageSet.count <= 0) {
      errors.push('반환 문서 수는 1 이상이어야 합니다');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 쿼리셋 미리보기 (JSON 문자열)
   * @returns {string} 포맷팅된 JSON 문자열
   */
  preview() {
    return JSON.stringify(this.querySet, null, 2);
  }

  /**
   * QuerySet 빌드 (최종 반환)
   * @returns {object} REST API 호환 QuerySet
   */
  build() {
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`쿼리 검증 실패: ${validation.errors.join(', ')}`);
    }
    return this.querySet;
  }

  /**
   * QuerySet 리셋
   */
  reset() {
    this.constructor.call(this);
    return this;
  }

  /**
   * 현재 상태 복사 (빌더 체인 분기용)
   */
  clone() {
    const cloned = new SearchQueryBuilder();
    cloned.querySet = JSON.parse(JSON.stringify(this.querySet));
    return cloned;
  }

  /**
   * 고급: whereSet 직접 설정
   */
  advancedWhere(whereSet) {
    this.querySet.query[0].whereSet = whereSet;
    return this;
  }

  /**
   * 고급: sortSet 직접 설정 (n차 정렬 명시)
   */
  advancedSort(sortSet) {
    this.querySet.query[0].sortSet = sortSet;
    return this;
  }
}

/**
 * 간단한 쿼리 생성 헬퍼 함수들
 */
export const QueryHelper = {
  /**
   * 간단한 검색 쿼리 생성
   */
  simpleSearch(collection, keyword, fields = ['*']) {
    return new SearchQueryBuilder()
      .from(collection)
      .select(fields)
      .where(keyword)
      .build();
  },

  /**
   * 범위 필터 쿼리
   */
  rangeFilter(collection, rangeField, minValue, maxValue, fields = ['*']) {
    return new SearchQueryBuilder()
      .from(collection)
      .select(fields)
      .filter(rangeField, '>=', minValue)
      .filter(rangeField, '<=', maxValue)
      .build();
  },

  /**
   * 복합 필터 쿼리
   */
  complexFilter(collection, filters, fields = ['*']) {
    const builder = new SearchQueryBuilder()
      .from(collection)
      .select(fields);

    for (const { field, operator, value } of filters) {
      builder.filter(field, operator, value);
    }

    return builder.build();
  },

  /**
   * 정렬된 검색 쿼리
   */
  sortedSearch(collection, keyword, sorts, fields = ['*']) {
    const builder = new SearchQueryBuilder()
      .from(collection)
      .select(fields)
      .where(keyword);

    for (const { field, order } of sorts) {
      builder.sort(field, order);
    }

    return builder.build();
  },

  /**
   * 페이징 검색 쿼리
   */
  pagedSearch(collection, keyword, page = 0, pageSize = 20, fields = ['*']) {
    const start = page * pageSize;
    return new SearchQueryBuilder()
      .from(collection)
      .select(fields)
      .where(keyword)
      .page(start, pageSize)
      .build();
  }
};

export default SearchQueryBuilder;
