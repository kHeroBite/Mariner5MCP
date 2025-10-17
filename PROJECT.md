# PROJECT.md - search-mcp-node 프로젝트 문서

기업형 검색엔진을 통합 관리하는 **Node.js 기반 MCP(Model Context Protocol) 서버**의 아키텍처 및 구조 문서입니다.

## 📋 프로젝트 메타정보

```yaml
프로젝트명: search-mcp-node
타입: Node.js MCP 서버 (stdin/stdout JSON-RPC)
버전: 1.0.0
런타임: Node.js (ES Module)
패키지관리자: npm
```

## 📁 프로젝트 구조

```
search-mcp-node/
├── src/                           # 소스 코드 디렉토리
│   ├── server.js                  # JSON-RPC 서버 메인 엔트리포인트
│   ├── http.js                    # Axios HTTP 클라이언트 + 인터셉터
│   ├── utils.js                   # 공통 유틸리티 함수
│   └── tools/                     # MCP 도구 정의
│       ├── index.js               # 도구 레지스트리 (모든 도구 export)
│       └── modules/               # 기능별 도구 모듈 (11개)
│           ├── collections.js     # 컬렉션 관리 (create/update/delete/get/list)
│           ├── columns.js         # 스키마 필드 관리 (add/update/delete/list)
│           ├── queries.js         # 저장 쿼리 관리 (create/update/delete/list/test)
│           ├── dict.js            # 사전 관리 (recommend/redirect/stopword/userCn/documentRanking)
│           ├── index.js           # 색인 제어 (run/status, logs.index.get)
│           ├── server.js          # 서버 설정 (setProps/health)
│           ├── logs.js            # 로그 조회 (error.get/error.delete/error.deleteAll)
│           ├── sim.js             # 시뮬레이션 (create/update/delete/list/run/status)
│           ├── ext.js             # Java 확장 플러그인 (create/update/delete/list/activate/deactivate)
│           ├── codegen.js         # 코드 생성 (검색 페이지 Java 생성)
│           └── search.js          # 검색 실행 (search.query)
│
├── config/
│   └── endpoints.json             # REST 엔드포인트 매핑 설정
│
├── .env                           # 환경변수 (BASE_URL, API_TOKEN, HTTP_TIMEOUT, LOG_LEVEL)
├── .env.example                   # 환경변수 템플릿
├── package.json                   # npm 의존성 정의
├── package-lock.json              # npm 잠금파일
├── CLAUDE.md                      # AI 작업 지침 문서
├── PROJECT.md                     # 이 파일 (프로젝트 구조)
└── README.md                      # 사용자 가이드
```

## 🔧 핵심 컴포넌트

### 1. 서버 (server.js:1-61)
**역할**: stdin/stdout 기반 JSON-RPC 메시지 핸들러

**주요 기능**:
- Line-delimited JSON-RPC 파싱
- 도구(method) 디스패칭
- 에러 처리 및 응답 포맷팅
- LOG_LEVEL 기반 로깅

**핵심 함수**:
- `handleLine(line:string)` : JSON-RPC 메시지 처리 (id/method/params 추출, 도구 실행)
- `write(obj:object)` : JSON 응답을 stdout에 출력

**요청 형식**:
```json
{"id":1,"method":"collections.list","params":{}}
```

**응답 형식**:
```json
{"id":1,"result":{"success":true,"endpoint":"...","data":[...]}}
{"id":1,"error":{"code":"E_TOOL","message":"...","data":{}}}
```

### 2. HTTP 클라이언트 (http.js:1-26)
**역할**: Axios 기반 HTTP 통신 (검색엔진 REST API 호출)

**주요 기능**:
- HTTP 타임아웃 설정 (기본 60초)
- Authorization 헤더 자동 추가 (API_TOKEN 환경변수)
- 재시도 로직 (429/502/503/504 상태코드)

**인터셉터**:
- **Request**: `API_TOKEN` 자동 삽입
- **Response**: 서버 에러 시 1초 대기 후 재시도

### 3. 유틸리티 (utils.js:1-29)
**역할**: 공통 함수 라이브러리

**함수 목록**:
- `tpl(str, params)` : 템플릿 문자열 치환 (`{collection}` → 실제값)
- `makeValidator(schema)` : AJV 스키마 검증 (입력 검증)
- `ok(endpoint, request, data, meta)` : 성공 응답 포맷팅
- `fail(code, message, details, hint)` : 실패 응답 포맷팅

### 4. 도구 레지스트리 (tools/index.js:1-25)
**역할**: 모든 도구 모듈을 하나의 객체로 통합

**구조**:
```javascript
export const tools = {
  'collections.create': { handler: async (input) => {...} },
  'collections.list': { handler: async (input) => {...} },
  // ... 총 50+ 도구
};
```

### 5. 기능별 도구 모듈 (tools/modules/*.js)

#### collections.js (5개 도구)
- **collections.create** : 새 컬렉션 생성 (name, shards, replicas 필수)
- **collections.update** : 컬렉션 설정 변경
- **collections.delete** : 컬렉션 삭제
- **collections.get** : 단일 컬렉션 조회
- **collections.list** : 컬렉션 목록 조회 (페이징 지원)

**스키마 검증**:
```javascript
createSchema: {
  type: 'object',
  required: ['name', 'shards', 'replicas'],
  properties: {
    name: { type: 'string' },
    shards: { type: 'integer', minimum: 1 },
    replicas: { type: 'integer', minimum: 0 }
  }
}
```

#### columns.js
필드 추가/수정/삭제/조회 기능
- **columns.add** : 스키마에 필드 추가
- **columns.update** : 필드 속성 변경
- **columns.delete** : 필드 삭제
- **columns.list** : 컬렉션의 모든 필드 조회

#### queries.js
저장된 쿼리 관리
- **queries.create** : 쿼리 저장
- **queries.update** : 쿼리 수정
- **queries.delete** : 쿼리 삭제
- **queries.list** : 쿼리 목록
- **queries.test** : 쿼리 테스트 실행

#### dict.js
검색 사전 관리
- **dict.recommend** : 추천 단어
- **dict.redirect** : 검색어 리다이렉트
- **dict.stopword** : 불용어 관리
- **dict.userCn** : 사용자 정의 유의어
- **dict.documentRanking** : 문서 순위 설정

#### index.js
색인 제어
- **index.run** : 색인 빌드/재구성
- **index.status** : 색인 상태 조회
- **logs.index.get** : 색인 로그 조회

#### server.js
서버 설정
- **server.setProps** : 서버 속성 설정
- **server.health** : 헬스 체크

#### logs.js
로그 관리
- **logs.error.get** : 에러 로그 조회
- **logs.error.delete** : 특정 에러 로그 삭제
- **logs.error.deleteAll** : 모든 에러 로그 삭제

#### sim.js
시뮬레이션 관리
- **sim.create** : 시뮬레이션 생성
- **sim.update** : 시뮬레이션 수정
- **sim.delete** : 시뮬레이션 삭제
- **sim.list** : 시뮬레이션 목록
- **sim.run** : 시뮬레이션 실행
- **sim.status** : 실행 상태 조회

#### ext.js
Java 플러그인 관리
- **ext.java.create** : 플러그인 등록
- **ext.java.update** : 플러그인 수정
- **ext.java.delete** : 플러그인 삭제
- **ext.java.list** : 플러그인 목록
- **ext.java.activate** : 플러그인 활성화
- **ext.java.deactivate** : 플러그인 비활성화

#### search.js
검색 쿼리 실행
- **search.query** : 검색 실행 (querySet 필수)

#### codegen.js
코드 생성
- **codegen.page.java.create** : Java 검색 페이지 생성
- **codegen.page.java.preview** : 미리보기
- **codegen.page.java.params** : 파라미터 설정

### 6. 엔드포인트 설정 (config/endpoints.json)

```json
{
  "collections": {
    "list": "/collections",
    "get": "/collections/{collection}",
    "create": "/collections",
    "update": "/collections/{collection}",
    "delete": "/collections/{collection}",
    "schemaFields": "/collections/{collection}/schema/fields",
    "queries": "/collections/{collection}/queries"
  },
  "search": { "query": "/collections/search" },
  "index": {
    "run": "/collections/index",
    "logs": "/logs/index"
  },
  "logs": { "error": "/logs/error" },
  "server": {
    "setProps": "/collections/search/setProps",
    "health": "/setProps"
  },
  "dict": { ... },
  "sim": { "root": "/simulations" },
  "ext": { "java": "/extensions/java" }
}
```

**용도**: REST API 경로를 변경할 때만 이 파일 수정 (BASE_URL과 조합하여 최종 URL 생성)

## 🌊 데이터 흐름

```
Claude Code (MCP Client)
    ↓
  stdin ← JSON-RPC 요청
    ↓
server.js: handleLine()
    ↓
tools[method].handler(params)
    ↓
tools/modules/*.js: 입력 검증 (AJV)
    ↓
http.js: 검색엔진 REST API 호출
    ↓
응답 처리 & 포맷팅
    ↓
stdout → JSON 응답
    ↓
Claude Code에 반환
```

## 🔄 에러 처리

### 에러 코드 규약

| 코드 | 설명 |
|------|------|
| `-32700` | JSON 파싱 에러 |
| `-32601` | Unknown method (도구 없음) |
| `E_INVALID_INPUT` | 입력 스키마 검증 실패 |
| `E_TOOL` | 도구 실행 중 에러 |
| 네트워크 에러 | HTTP 클라이언트 에러 |

### 에러 응답 예시

```json
{
  "id": 1,
  "error": {
    "code": "E_INVALID_INPUT",
    "message": "입력 스키마 검증 실패: .collection is not of a type(s) string",
    "data": [
      {
        "instancePath": ".collection",
        "schemaPath": "#/required",
        "message": "must have required property 'collection'"
      }
    ]
  }
}
```

## 🚀 시작 및 실행

```bash
# 설치
npm i

# 환경변수 설정
cp .env.example .env
# .env 파일 수정: BASE_URL, API_TOKEN 설정

# 실행 (stdin/stdout JSON-RPC)
npm start

# 개발 모드 (동일)
npm run dev
```

## 🔐 환경변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `BASE_URL` | `http://localhost:8080/api` | 검색엔진 REST API 베이스 URL |
| `API_TOKEN` | 없음 | 인증 토큰 (있으면 Authorization 헤더에 포함) |
| `HTTP_TIMEOUT` | `60000` | HTTP 타임아웃(ms) |
| `LOG_LEVEL` | `info` | 로깅 레벨 (debug/info/warn/error) |

## 📦 의존성

```json
{
  "axios": "^1.7.7",      // HTTP 클라이언트
  "dotenv": "^16.4.5",    // 환경변수 로딩
  "ajv": "^8.17.1"        // JSON 스키마 검증
}
```

## 🧪 테스트 예시

```bash
# 1) 컬렉션 생성
echo '{"id":1,"method":"collections.create","params":{"name":"demo","shards":1,"replicas":0}}' | npm start

# 2) 컬렉션 목록
echo '{"id":2,"method":"collections.list","params":{}}' | npm start

# 3) 검색 실행
echo '{"id":3,"method":"search.query","params":{"querySet":{"version":"1.0","query":[{"fromSet":{"collection":["demo"]},"selectSet":{"fields":["*"]},"whereSet":{"operator":"AND","searchKeyword":"테스트"}}]}}}' | npm start

# 4) 색인 실행
echo '{"id":4,"method":"index.run","params":{"collection":"demo","type":"rebuild"}}' | npm start
```

## 🎯 주요 설계 원칙

1. **MCP 호환성**: stdin/stdout 기반 JSON-RPC로 Claude Code와 통신
2. **상태무결성**: 모든 도구는 순수 함수 (부작용 최소화)
3. **입력 검증**: AJV 스키마로 모든 입력 사전 검증
4. **에러 전파**: 검색엔진 에러를 그대로 반환
5. **재시도 로직**: 네트워크 불안정 시 자동 재시도
6. **환경 설정 가능**: 모든 엔드포인트/타임아웃 설정 가능

## 📝 주의사항

### 엔드포인트 추가 시

1. `config/endpoints.json`에 경로 추가
2. `tools/modules/*.js`에 도구 구현
3. 스키마 정의 (AJV 호환)
4. `tools/index.js`에 export 추가
5. `README.md` 문서 업데이트

### 새 도구 모듈 추가 시

```javascript
// tools/modules/new-feature.js
export const newFeature = {
  'feature.action': {
    handler: async (input) => {
      const schema = { /* AJV 스키마 */ };
      makeValidator(schema)(input);
      const url = BASE_URL + ep.action;
      const res = await http.post(url, input);
      return ok(ep.action, input, res.data);
    }
  }
};

// tools/index.js에 추가
import { newFeature } from './modules/new-feature.js';
export const tools = {
  ...newFeature,  // 추가
  // ...
};
```

### 콘솔 출력 금지

- HTTP 요청/응답 로그는 `console.error`를 사용하지 않을 것
- 도구 실행 중 진행 상황 메시지 출력 금지
- 에러는 JSON 응답으로만 전달

## 🔗 참고 문서

- [README.md](./README.md) - 사용 가이드
- [CLAUDE.md](./CLAUDE.md) - AI 작업 지침
- 검색엔진 REST API 문서 (BASE_URL 참조)
