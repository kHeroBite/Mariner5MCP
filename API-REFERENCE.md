# Mariner5 REST API Reference

Mariner5 검색엔진 REST API 완벽 가이드입니다.

## 📋 목차

- [서버 설정](#서버-설정)
- [필수 라이브러리](#필수-라이브러리)
- [인증](#인증)
- [컬렉션 관리](#컬렉션-관리)
- [검색](#검색)
- [색인](#색인)
- [사전 관리](#사전-관리)
- [시뮬레이션](#시뮬레이션)
- [Extension](#extension)
- [로그](#로그)
- [서버 관리](#서버-관리)
- [에러 코드](#에러-코드)

---

## 서버 설정

### REST Server 구성

**위치**: `mariner5/util/restServer`

**설정 파일**: `mariner5/util/restServer/conf/rest.conf`

```properties
# REST API 포트
HTTP_REST_PORT=5001

# Mariner5 AdminServer 연결
MARINER_HOST=127.0.0.1
MARINER_PORT=5555

# CORS 설정
SUPPORT_CORS=true
ALLOW_ORIGIN=*

# 요청 크기 제한 (20MB)
REQUEST_BODY_LIMIT=20971520

# 클라이언트 풀 설정
CLIENT_MIN_POOL_SIZE=1
CLIENT_MAX_POOL_SIZE=50
CLIENT_POOL_WAIT_TIMEOUT=5000

# 로그 설정
USE_LOG=true
LOG_LEVEL=INFO
LOG_BACKUP_PERIOD=7
```

### 서버 시작

```bash
# Windows
cd C:\DATA\Project\mariner5\util\restServer\script
start.bat

# Linux
cd /path/to/mariner5/util/restServer/script
./start.sh
```

### 서버 상태 확인

```bash
curl http://localhost:5001/health
```

---

## 필수 라이브러리

**위치**: `mariner5/lib` 및 `mariner5/util/restServer/lib`

### 핵심 라이브러리 (mariner5/lib)

| JAR 파일 | 용도 |
|---------|------|
| `m5_client.jar` | AdminServerClient (JNI 연결) |
| `m5_common.jar` | 공통 유틸리티 및 데이터 구조 |
| `m5_core.jar` | 검색엔진 코어 (색인/검색 알고리즘) |
| `m5_server.jar` | AdminServer (관리 서버) |
| `m5_extension.jar` | Extension 플러그인 시스템 |
| `m5_framework.jar` | 프레임워크 기반 구조 |
| `m5_mgr.jar` | 관리 도구 |
| `m5_util.jar` | 유틸리티 함수 |
| `m5_recommend.jar` | 추천 기능 |

### REST API 라이브러리 (restServer/lib)

| JAR 파일 | 용도 |
|---------|------|
| `m5_rest.jar` | REST API 서버 구현 (Netty 기반) |

### 외부 의존성

| JAR 파일 | 용도 |
|---------|------|
| `gson-2.9.1.jar` | JSON 직렬화/역직렬화 |
| `logback-classic-1.2.13.jar` | 로깅 프레임워크 |
| `logback-core-1.2.13.jar` | 로깅 코어 |
| `lucene-core-9.10.0.jar` | Lucene 검색 엔진 코어 |
| `lucene-codecs-9.10.0.jar` | Lucene 코덱 |

### Node.js 연동 (mariner5-mcp)

```bash
# Node.js Java 브릿지
npm install java
```

**환경변수 설정** (`.env`):
```properties
MARINER5_HOME=C:\DATA\Project\mariner5
MARINER5_HOST=localhost
MARINER5_PORT=5555
BASE_URL=http://localhost:5001
```

---

## 인증

### API Token (선택사항)

```bash
# 환경변수로 설정
export API_TOKEN=your_api_token_here
```

**요청 헤더**:
```http
Authorization: Bearer your_api_token_here
```

**주의**: 기본 설정에서는 인증이 비활성화되어 있습니다.

---

## 컬렉션 관리

### 1. 컬렉션 목록 조회

**Endpoint**: `GET /collections`

**요청**:
```bash
curl http://localhost:5001/collections
```

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "name": "products",
      "shards": 3,
      "replicas": 1,
      "documentCount": 10000,
      "status": "ACTIVE"
    }
  ]
}
```

### 2. 컬렉션 생성

**Endpoint**: `POST /collections`

**요청**:
```bash
curl -X POST http://localhost:5001/collections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "products",
    "shards": 3,
    "replicas": 1
  }'
```

**응답**:
```json
{
  "success": true,
  "data": {
    "name": "products",
    "created": "2025-10-20T12:00:00Z"
  }
}
```

### 3. 컬렉션 조회

**Endpoint**: `GET /collections/{collection}`

**요청**:
```bash
curl http://localhost:5001/collections/products
```

**응답**:
```json
{
  "success": true,
  "data": {
    "name": "products",
    "shards": 3,
    "replicas": 1,
    "fields": [
      {"name": "id", "type": "INTEGER", "indexed": false},
      {"name": "title", "type": "TEXT", "indexed": true, "analyzer": "korean_analyzer"}
    ]
  }
}
```

### 4. 컬렉션 수정

**Endpoint**: `PUT /collections/{collection}`

**요청**:
```bash
curl -X PUT http://localhost:5001/collections/products \
  -H "Content-Type: application/json" \
  -d '{
    "replicas": 2
  }'
```

### 5. 컬렉션 삭제

**Endpoint**: `DELETE /collections/{collection}`

**요청**:
```bash
curl -X DELETE http://localhost:5001/collections/products
```

### 6. 스키마 필드 관리

**Endpoint**: `GET /collections/{collection}/schema/fields`

**요청**:
```bash
curl http://localhost:5001/collections/products/schema/fields
```

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "name": "id",
      "type": "INTEGER",
      "indexed": false,
      "stored": true
    },
    {
      "name": "title",
      "type": "TEXT",
      "indexed": true,
      "stored": true,
      "analyzer": "korean_analyzer"
    }
  ]
}
```

---

## 검색

### 검색 실행

**Endpoint**: `POST /collections/search`

**요청**:
```bash
curl -X POST http://localhost:5001/collections/search \
  -H "Content-Type: application/json" \
  -d '{
    "querySet": {
      "version": "1.0",
      "query": [
        {
          "fromSet": {
            "collection": ["products"]
          },
          "selectSet": {
            "fields": ["*"]
          },
          "whereSet": {
            "operator": "AND",
            "searchKeyword": "노트북"
          },
          "orderSet": {
            "field": "score",
            "direction": "DESC"
          },
          "limitSet": {
            "offset": 0,
            "size": 10
          }
        }
      ]
    }
  }'
```

**응답**:
```json
{
  "success": true,
  "data": {
    "totalHits": 150,
    "took": 12,
    "documents": [
      {
        "id": 1,
        "title": "삼성 노트북 갤럭시북",
        "price": 1200000,
        "score": 4.5
      }
    ]
  }
}
```

### QuerySet 구조

```javascript
{
  "version": "1.0",
  "query": [
    {
      // FROM: 검색 대상 컬렉션
      "fromSet": {
        "collection": ["products", "reviews"]
      },

      // SELECT: 반환 필드
      "selectSet": {
        "fields": ["id", "title", "price"],
        "facets": ["category", "brand"]
      },

      // WHERE: 검색 조건
      "whereSet": {
        "operator": "AND",  // AND | OR
        "searchKeyword": "노트북",
        "filters": [
          {"field": "price", "operator": ">=", "value": 500000},
          {"field": "stock", "operator": ">", "value": 0}
        ]
      },

      // ORDER: 정렬
      "orderSet": {
        "field": "score",  // score | field_name
        "direction": "DESC"  // ASC | DESC
      },

      // LIMIT: 페이징
      "limitSet": {
        "offset": 0,
        "size": 10
      },

      // GROUP: 그룹핑
      "groupSet": {
        "field": "category"
      },

      // HIGHLIGHT: 하이라이트
      "highlightSet": {
        "fields": ["title", "description"],
        "preTag": "<em>",
        "postTag": "</em>"
      }
    }
  ]
}
```

---

## 색인

### 1. 색인 실행

**Endpoint**: `POST /collections/index`

**요청**:
```bash
curl -X POST http://localhost:5001/collections/index \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "products",
    "type": "rebuild"
  }'
```

**색인 타입**:
- `rebuild`: 전체 재색인
- `incremental`: 증분 색인
- `merge`: 세그먼트 병합

**응답**:
```json
{
  "success": true,
  "data": {
    "jobId": "idx-20251020-001",
    "status": "RUNNING"
  }
}
```

### 2. 색인 상태 조회

**Endpoint**: `GET /collections/index/status?collection={collection}`

**요청**:
```bash
curl http://localhost:5001/collections/index/status?collection=products
```

**응답**:
```json
{
  "success": true,
  "data": {
    "status": "COMPLETED",
    "progress": 100,
    "documentsIndexed": 10000,
    "startTime": "2025-10-20T12:00:00Z",
    "endTime": "2025-10-20T12:05:30Z"
  }
}
```

### 3. 색인 로그 조회

**Endpoint**: `GET /logs/index?collection={collection}&limit={limit}`

**요청**:
```bash
curl http://localhost:5001/logs/index?collection=products&limit=100
```

---

## 사전 관리

### 1. 추천 단어 (Recommend Dictionary)

**Endpoint**: `GET /dics/recommend`

**요청**:
```bash
curl http://localhost:5001/dics/recommend
```

**Endpoint**: `POST /dics/recommend`

**요청**:
```bash
curl -X POST http://localhost:5001/dics/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "노트북",
    "recommend": "랩탑"
  }'
```

### 2. 리다이렉트 (Redirect Dictionary)

**Endpoint**: `POST /dics/redirect`

**요청**:
```bash
curl -X POST http://localhost:5001/dics/redirect \
  -H "Content-Type: application/json" \
  -d '{
    "from": "노트북",
    "to": "/products/laptops"
  }'
```

### 3. 불용어 (Stopword Dictionary)

**Endpoint**: `POST /dics/stopword`

**요청**:
```bash
curl -X POST http://localhost:5001/dics/stopword \
  -H "Content-Type: application/json" \
  -d '{
    "word": "the"
  }'
```

### 4. 사용자 정의 유의어 (User CN Dictionary)

**Endpoint**: `POST /dics/userCn`

**요청**:
```bash
curl -X POST http://localhost:5001/dics/userCn \
  -H "Content-Type: application/json" \
  -d '{
    "word": "삼성",
    "synonym": "SAMSUNG"
  }'
```

### 5. 문서 랭킹 (Document Ranking Dictionary)

**Endpoint**: `POST /dics/documentRanking`

**요청**:
```bash
curl -X POST http://localhost:5001/dics/documentRanking \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "prod-001",
    "boost": 1.5
  }'
```

---

## 시뮬레이션

### 1. 시뮬레이션 목록 조회

**Endpoint**: `GET /simulations`

**요청**:
```bash
curl http://localhost:5001/simulations
```

### 2. 시뮬레이션 생성

**Endpoint**: `POST /simulations`

**요청**:
```bash
curl -X POST http://localhost:5001/simulations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_scenario_1",
    "collection": "products",
    "querySet": { ... }
  }'
```

### 3. 시뮬레이션 실행

**Endpoint**: `POST /simulations/{id}/run`

**요청**:
```bash
curl -X POST http://localhost:5001/simulations/test_scenario_1/run
```

### 4. 시뮬레이션 삭제

**Endpoint**: `DELETE /simulations/{id}`

**요청**:
```bash
curl -X DELETE http://localhost:5001/simulations/test_scenario_1
```

---

## Extension

### 1. Extension 목록 조회

**Endpoint**: `GET /extensions/java`

**요청**:
```bash
curl http://localhost:5001/extensions/java
```

### 2. Extension 등록

**Endpoint**: `POST /extensions/java`

**요청**:
```bash
curl -X POST http://localhost:5001/extensions/java \
  -H "Content-Type: application/json" \
  -d '{
    "className": "ProductNormalizer",
    "packageName": "com.mariner.ext",
    "binary": "UEsDBAoAAA..."
  }'
```

### 3. Extension 활성화

**Endpoint**: `POST /extensions/java/{className}/activate`

**요청**:
```bash
curl -X POST http://localhost:5001/extensions/java/ProductNormalizer/activate
```

### 4. Extension 비활성화

**Endpoint**: `POST /extensions/java/{className}/deactivate`

**요청**:
```bash
curl -X POST http://localhost:5001/extensions/java/ProductNormalizer/deactivate
```

### 5. Extension 삭제

**Endpoint**: `DELETE /extensions/java/{className}`

**요청**:
```bash
curl -X DELETE http://localhost:5001/extensions/java/ProductNormalizer
```

---

## 로그

### 1. 에러 로그 조회

**Endpoint**: `GET /logs/error?limit={limit}`

**요청**:
```bash
curl http://localhost:5001/logs/error?limit=100
```

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-10-20T12:00:00Z",
      "level": "ERROR",
      "message": "Index failed: products",
      "stackTrace": "..."
    }
  ]
}
```

### 2. 에러 로그 삭제

**Endpoint**: `DELETE /logs/error/{id}`

**요청**:
```bash
curl -X DELETE http://localhost:5001/logs/error/err-001
```

### 3. 모든 에러 로그 삭제

**Endpoint**: `DELETE /logs/error`

**요청**:
```bash
curl -X DELETE http://localhost:5001/logs/error
```

---

## 서버 관리

### 1. 서버 상태 확인

**Endpoint**: `GET /setProps`

**요청**:
```bash
curl http://localhost:5001/setProps
```

**응답**:
```json
{
  "success": true,
  "data": {
    "version": "5.0.0",
    "status": "RUNNING",
    "uptime": 3600000,
    "collections": 10,
    "totalDocuments": 100000
  }
}
```

### 2. 서버 속성 설정

**Endpoint**: `POST /collections/search/setProps`

**요청**:
```bash
curl -X POST http://localhost:5001/collections/search/setProps \
  -H "Content-Type: application/json" \
  -d '{
    "cacheSize": 1024,
    "maxThreads": 50
  }'
```

---

## 에러 코드

### HTTP 상태 코드

| 코드 | 의미 |
|-----|------|
| `200` | 성공 |
| `201` | 생성 성공 |
| `400` | 잘못된 요청 (입력 검증 실패) |
| `404` | 리소스 없음 (컬렉션/문서 없음) |
| `409` | 충돌 (중복된 이름) |
| `500` | 서버 내부 오류 |
| `503` | 서비스 사용 불가 (연결 실패) |

### 애플리케이션 에러 코드

| 코드 | 의미 |
|-----|------|
| `E_INVALID_INPUT` | 입력 스키마 검증 실패 |
| `E_COLLECTION_NOT_FOUND` | 컬렉션이 존재하지 않음 |
| `E_COLLECTION_EXISTS` | 컬렉션이 이미 존재함 |
| `E_INDEX_FAILED` | 색인 작업 실패 |
| `E_SEARCH_FAILED` | 검색 실행 실패 |
| `E_CONNECTION_FAILED` | AdminServer 연결 실패 |
| `E_TIMEOUT` | 요청 시간 초과 |

### 에러 응답 형식

```json
{
  "success": false,
  "error": {
    "code": "E_COLLECTION_NOT_FOUND",
    "message": "컬렉션 'products'를 찾을 수 없습니다.",
    "details": {
      "collection": "products",
      "timestamp": "2025-10-20T12:00:00Z"
    }
  }
}
```

---

## 부록

### REST Server 시작 스크립트

**Windows** (`mariner5/util/restServer/script/start.bat`):
```batch
@echo off
cd /d "%~dp0.."
java -jar lib/m5_rest.jar
```

**Linux** (`mariner5/util/restServer/script/start.sh`):
```bash
#!/bin/bash
cd "$(dirname "$0")/.."
java -jar lib/m5_rest.jar
```

### Node.js 연동 예시

```javascript
import axios from 'axios';

const BASE_URL = 'http://localhost:5001';

// 컬렉션 목록 조회
const response = await axios.get(`${BASE_URL}/collections`);
console.log(response.data);

// 검색 실행
const searchResponse = await axios.post(`${BASE_URL}/collections/search`, {
  querySet: {
    version: '1.0',
    query: [{
      fromSet: { collection: ['products'] },
      selectSet: { fields: ['*'] },
      whereSet: { operator: 'AND', searchKeyword: '노트북' }
    }]
  }
});
console.log(searchResponse.data);
```

---

## 참고 문서

- [PROJECT.md](./PROJECT.md) - mariner5-mcp 프로젝트 구조
- [CLAUDE.md](./CLAUDE.md) - AI 작업 지침
- [README.md](./README.md) - 사용자 가이드

---

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-20
**라이선스**: Proprietary (Mariner5)
