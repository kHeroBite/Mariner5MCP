# PROJECT.md - mariner5-mcp 프로젝트 문서

**Mariner5 기업형 검색엔진**을 완벽하게 제어하는 **Node.js 기반 MCP(Model Context Protocol) 서버**의 아키텍처 및 구조 문서입니다.

## 📋 프로젝트 메타정보

```yaml
프로젝트명: mariner5-mcp
타입: Node.js MCP 서버 (stdin/stdout JSON-RPC + Java JNI)
버전: 3.8.0
런타임: Node.js 16.0.0 이상 (ES Module)
패키지관리자: npm
핵심_특징: Java 네이티브 + REST API 폴백, 멀티 인스턴스 지원, Extension 자동 생성
```

## 📁 프로젝트 구조

```
mariner5-mcp/
├── src/                                  # 소스 코드 디렉토리
│   ├── server.js                         # JSON-RPC 서버 메인 엔트리포인트
│   ├── http.js                           # Axios HTTP 클라이언트 + 인터셉터 (레거시 지원)
│   ├── utils.js                          # 공통 유틸리티 함수
│   ├── instance-manager.js               # JNI 멀티 인스턴스 관리 ⭐ 신규
│   ├── connection-manager.js             # 멀티 서버 연결 관리 ⭐ 신규
│   ├── java-bridge.js                    # Java JNI 브릿지 레이어 (멀티 인스턴스 지원) ⭐
│   ├── java-wrapper.js                   # Mariner5 API 래퍼 (instanceId 파라미터) ⭐
│   ├── schema-analyzer.js                # SQL → Mariner5 필드 매핑 ⭐ 신규
│   ├── schema-comparator.js              # 필드 비교 및 스키마 업데이트 ⭐ 신규
│   ├── extension-builder.js              # Extension 자동 생성/컴파일 ⭐ 신규
│   ├── extension-templates/              # Extension Java 템플릿 디렉토리 ⭐ 신규
│   │   ├── analyzer/
│   │   │   └── CustomAnalyzer.java.tpl
│   │   ├── processor/
│   │   │   ├── DataProcessor.java.tpl
│   │   │   └── FieldEnricher.java.tpl
│   │   ├── fetcher/
│   │   │   └── ExternalDataFetcher.java.tpl
│   │   └── filter/
│   │       └── CustomFilter.java.tpl
│   ├── java-wrapper-v2/                  # 678+ 메서드 통합 래퍼 모듈 ⭐ 신규 (v3.8: +15)
│   │   ├── index.js                      # 통합 export (모든 모듈)
│   │   ├── helpers.js                    # 공통 유틸리티 (getAdminClient, convertToJavaObject)
│   │   ├── collection.js                 # 컬렉션 관리 (130+ 메서드) - DBWatcher/Monitor/DataSource ⭐
│   │   ├── dictionary.js                 # 사전 관리 (130+ 메서드) - UserCnDic/PreMorph ⭐
│   │   ├── hotspot.js                    # 핫스팟 분석 (30+ 메서드) ⭐ v3.3
│   │   ├── indexing.js                   # 색인 작업 (25+ 메서드) + CommandIndexKeyList (5개)
│   │   ├── management.js                 # 계정/스케줄/접속/로그 (40+ 메서드)
│   │   ├── server.js                     # 서버/브로커/리소스 (35+ 메서드) + CommandStatus (5개)
│   │   ├── monitoring.js                 # 로그 모니터링 (30+ 메서드)
│   │   ├── tuning.js                     # 검색 튜닝 (60+ 메서드)
│   │   ├── advanced.js                   # 고급 기능 (50+ 메서드) ⭐ v3.4
│   │   │                                 #   - VectorSearch/Union/Drama
│   │   ├── query-builder.js              # 검색 쿼리 빌더 (Fluent API, SearchQueryBuilder) ⭐ v3.7 신규
│   │   ├── analyzer-config.js            # Analyzer 설정 (형태소/바이그램/유니그램) (12+ 메서드) ⭐ v3.7 신규
│   │   └── sort-config.js                # n차 정렬 설정 (1차/2차/3차 우선순위) (8+ 메서드) ⭐ v3.7 신규
│   │
│   └── tools/                            # MCP 도구 정의
│       ├── index.js                      # 도구 레지스트리 (모든 도구 export, 358+개) ⭐ v3.7
│       └── modules/                      # 기능별 도구 모듈 (28개)
│           ├── collections.js            # 컬렉션 관리 (Java 네이티브 + REST 폴백)
│           ├── columns.js                # 스키마 필드 관리
│           ├── queries.js                # 저장 쿼리 관리
│           ├── dict.js                   # 사전 관리
│           ├── dict-advanced.js          # 고급 사전 (UserCnDic, PreMorph) (16개) ⭐ v3.2
│           ├── index.js                  # 색인 제어 (Java 네이티브 + REST 폴백)
│           ├── server.js                 # 서버 설정 (Java 네이티브 + REST 폴백)
│           ├── logs.js                   # 로그 조회
│           ├── sim.js                    # 시뮬레이션 (Java 네이티브 + REST 폴백)
│           ├── ext.js                    # Java Extension (11개 도구)
│           ├── codegen.js                # 코드 생성
│           ├── search.js                 # 검색 실행 (Java 네이티브 + REST 폴백)
│           ├── schema-from-sql.js        # SQL 기반 자동 컬렉션 생성
│           ├── servers.js                # 다중 서버 관리
│           ├── admin.js                  # 계정/스케줄/접속/로그 (40개 도구)
│           ├── hotKeyword.js             # 핫 키워드 관리 (15개 도구)
│           ├── monitoring.js             # 로그 모니터링 (30개 도구)
│           ├── tuning.js                 # 검색 튜닝 (30개 도구)
│           ├── datasource.js             # DataSource 관리 (15개 도구) ⭐ v3.2
│           ├── collection-monitor.js     # 컬렉션 모니터링 (30개 도구) ⭐ v3.3
│           ├── advanced-search.js        # 고급 검색 (18개 도구) ⭐ v3.3
│           ├── advanced-features.js      # 고급 기능 (25개 도구) ⭐ v3.4
│           │                             #   - VectorSearch (8개) / Union (7개) / Drama (10개)
│           ├── query-builder-tools.js    # 검색 쿼리 빌더 (15개 도구) ⭐ v3.7 신규
│           ├── analyzer-tools.js         # Analyzer 설정 (12개 도구) ⭐ v3.7 신규
│           ├── sort-tools.js             # n차 정렬 설정 (8개 도구) ⭐ v3.7 신규
│           └── setup.js                  # 서비스 설치/구동 관리 (Derby/Search/REST/Tomcat) ⭐ v3.8 신규
│
├── config/
│   ├── endpoints.json                    # REST 엔드포인트 매핑 설정 (레거시)
│   └── services.json                     # 서비스 설치 정보 (Derby/Search/REST/Tomcat) ⭐ v3.8 신규
│
├── .env                                  # 환경변수 (MARINER5_HOME, IR5_HOME 등)
├── .env.example                          # 환경변수 템플릿
├── package.json                          # npm 의존성 정의
├── package-lock.json                     # npm 잠금파일
├── CLAUDE.md                             # AI 작업 지침 문서
├── PROJECT.md                            # 이 파일 (프로젝트 구조)
└── README.md                             # 사용자 가이드
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

### 2. 인스턴스 관리자 (instance-manager.js) ⭐ 신규
**역할**: JNI 멀티 인스턴스 풀 관리 (UUID 기반)

**주요 클래스**:
- `InstanceManager` : 인스턴스 생성/삭제/조회/모니터링
- `ConnectionPool` : 연결 풀 관리 (최대 10개, 설정 가능)
- `InstanceContext` : 인스턴스 상태/메타데이터/통계

**상태**: CREATED → CONNECTING → CONNECTED (또는 ERROR/CLOSED)

**주요 메서드**:
```javascript
createInstance(config)      // 새 인스턴스 생성 (UUID)
getInstance(instanceId)     // 인스턴스 획득
releaseInstance(instanceId) // 인스턴스 반환
deleteInstance(instanceId)  // 인스턴스 삭제
listInstances()             // 모든 인스턴스 조회
setDefaultInstance(id)      // 기본 인스턴스 설정
startMonitoring(interval)   // 상태 모니터링 시작
cleanup()                   // 모든 인스턴스 정리
```

### 3. 서버 연결 관리자 (connection-manager.js) ⭐ 신규
**역할**: 멀티 서버 AdminServerClient 연결 관리 (서버명 기반)

**주요 기능**:
- 서버별 독립적인 연결 유지
- 서버명으로 클라이언트 획득
- 자동 재연결 및 상태 추적
- 연결 통계 수집

**주요 메서드**:
```javascript
addServer(name, host, port)    // 서버 등록 및 연결
getClient(serverName)          // 클라이언트 획득
removeServer(name)             // 서버 연결 제거
listServers()                  // 등록된 서버 목록
getAllServers()                // 모든 서버 정보
reconnect(serverName)          // 특정 서버 재연결
setDefaultServer(name)         // 기본 서버 설정
getStatistics()                // 연결 통계
```

### 3-1. Java 브릿지 (java-bridge.js) ⭐ 멀티 인스턴스 지원
**역할**: Node.js와 Java(Mariner5) JNI 연결 (Map 기반 다중 연결)

**주요 기능**:
- Java 클래스패스 설정 (Mariner5 lib/*.jar)
- node-java를 통한 Java 메서드 호출
- 호스트:포트 키로 AdminServerClient 캐싱
- Java 컬렉션↔JavaScript 객체 변환
- 비동기 Promise 래핑

**주요 클래스**:
```javascript
javaClasses.AdminServerClient       // Mariner5 관리 클라이언트
javaClasses.CommandSearchRequest     // 검색 요청 처리
javaClasses.CommandCollectionInfoServer  // 컬렉션 정보
javaClasses.CommandIndexTaskServer   // 색인 작업
javaClasses.CommandSimulationQueryManagement // 시뮬레이션
```

### 4. Extension Builder (extension-builder.js) ⭐ 신규
**역할**: Extension Java 코드 자동 생성 → 컴파일 → JAR → Base64 인코딩 파이프라인

**핵심 기능** (5단계):
```
1. Template 로드 (extension-templates/*.tpl)
   ↓
2. 변수 치환 ({{className}}, {{targetFields}} 등)
   ↓
3. Java 소스 생성 (.java 파일)
   ↓
4. javac 컴파일 (.class 파일)
   ↓
5. JAR 패키징 + Base64 인코딩
```

**주요 함수**:
- `listAvailableTemplates()` : 4가지 템플릿 목록 반환
- `renderTemplate(templatePath, variables)` : {{KEY}} 패턴을 변수값으로 치환
- `generateJavaSource(className, packageName, source)` : Java 파일 생성
- `compileJava(javaPath, packageName)` : javac로 컴파일
- `createJar(className, packageName, classPath)` : JAR 파일 생성
- `jarToBase64(jarPath)` : Base64 인코딩 (Mariner5 전송용)
- `generateExtension(config)` : 전체 파이프라인 실행 (핵심)
- `previewExtension(config)` : 컴파일 없이 소스만 미리보기

**Template 4가지 유형**:
| 유형 | 파일 | 용도 |
|------|------|------|
| analyzer | CustomAnalyzer.java.tpl | 텍스트 분석 (한글/영문) |
| processor | DataProcessor.java.tpl | 데이터 전처리 |
| processor | FieldEnricher.java.tpl | 필드 확장 (외부 데이터) |
| fetcher | ExternalDataFetcher.java.tpl | REST API 기반 조회 |
| filter | CustomFilter.java.tpl | 조건 필터링 |

**예시 흐름**:
```javascript
// 입력
{
  type: "processor",
  name: "product_normalizer",
  targetFields: ["product_name"]
}

// 1. 템플릿 로드 (DataProcessor.java.tpl)
// 2. 변수 치환
public class ProductNormalizer {
  public Map<String, Object> process(Map<String, Object> document) {
    // TODO: Process target fields (product_name)
    return document;
  }
}

// 3. Java 소스 생성
com/mariner/ext/ProductNormalizer.java

// 4. javac 컴파일
com/mariner/ext/ProductNormalizer.class

// 5. JAR 생성 + Base64
ProductNormalizer.jar → "UEsDBAoAAA..." (2.3KB)

// 출력
{
  className: "ProductNormalizer",
  packageName: "com.mariner.ext",
  source: "public class ...",
  binary: "UEsDBAoAAA...",
  size: 2.3,
  created: "2025-10-17T..."
}
```

### 5. Java 래퍼 (java-wrapper.js) ⭐ 멀티 인스턴스 지원
**역할**: Mariner5 AdminServerClient 고수준 API 래핑 (인스턴스별 관리)

**주요 메서드** (instanceId 파라미터 추가):
- `createAdminServerInstance(config)` : 새 인스턴스 생성
- `deleteAdminServerInstance(instanceId)` : 인스턴스 삭제
- `listCollections(instanceId = null)` : 컬렉션 목록
- `getCollection(name, instanceId = null)` : 컬렉션 조회
- `createCollection(name, options, instanceId = null)` : 컬렉션 생성
- `deleteCollection(name, instanceId = null)` : 컬렉션 삭제
- `executeSearch(querySet, instanceId = null)` : 검색 실행
- `getIndexStatus(collection, instanceId = null)` : 색인 상태
- `runIndex(collection, type, instanceId = null)` : 색인 실행
- `listSimulations(instanceId = null)` : 시뮬레이션 목록
- `createSimulation(name, config, instanceId = null)` : 시뮬레이션 생성
- `runSimulation(id, instanceId = null)` : 시뮬레이션 실행
- `deleteSimulation(id, instanceId = null)` : 시뮬레이션 삭제
- `checkServerHealth(instanceId = null)` : 서버 상태 확인
- `setDefaultInstance(instanceId)` : 기본 인스턴스 설정
- `getDefaultInstanceId()` : 기본 인스턴스 조회
- `getAllInstances()` : 모든 인스턴스 조회

### 5-1. 통합 래퍼 v2 (java-wrapper-v2/) ⭐ 신규 - 400+ 메서드
**역할**: AdminServerClient를 고수준으로 래핑한 모듈화된 API (7개 기능별 모듈)

**모듈 구조**:
```
java-wrapper-v2/
├── index.js          # 통합 export (모든 모듈 + 기본 메서드)
├── helpers.js        # 공통 유틸리티
├── collection.js     # 컬렉션/스키마/인덱스 (80+ 메서드)
├── dictionary.js     # 12가지 사전 타입 (100+ 메서드)
├── indexing.js       # 색인/백업/스냅샷 (20+ 메서드)
├── management.js     # 계정/스케줄/접속/로그 (40+ 메서드)
├── server.js         # 서버/브로커/리소스 (30+ 메서드)
├── monitoring.js     # 로그 모니터링 (30+ 메서드)
└── tuning.js         # 검색 프로파일/QuerySet (60+ 메서드)
```

**주요 특징**:
- 모든 메서드는 선택적 `instanceId` 파라미터 지원 (null = 기본 인스턴스)
- Try-catch 에러 처리 및 구조화된 로깅
- javaMapToObject/javaListToArray 자동 타입 변환
- getAdminClient/releaseAdminClient 인스턴스 관리

**각 모듈 설명**:

| 모듈 | 메서드 수 | 주요 기능 |
|------|---------|--------|
| collection.js | 80+ | 스키마, 인덱스 필드, 정렬/필터/그룹 설정, DBWatcher |
| dictionary.js | 100+ | 사용자사전, 불용어, 유의어, 문서랭킹, 추천, 리다이렉트 등 12가지 |
| indexing.js | 20+ | 색인 실행/취소/동기, 백업/복구, 스냅샷, 레포지토리 내보내기 |
| management.js | 40+ | 계정 관리, 스케줄 작업, IP 접속 제어, 로그 설정 |
| server.js | 30+ | 서버 시작/중지/재시작, 브로커 관리, CPU/메모리/디스크 사용량 |
| monitoring.js | 30+ | 검색/색인/에러/알람 로그, 로그 설정 및 유지 기간 |
| tuning.js | 60+ | 검색 프로파일, QuerySet, 랭킹 모델, 필터/정렬/그룹 필드 설정 |

**사용 예시**:
```javascript
import * as javaWrapper from './java-wrapper-v2/index.js';

// 스키마 생성 (기본 인스턴스)
await javaWrapper.collection.createSchema('myCollection', {...});

// 특정 인스턴스에서 스키마 생성
await javaWrapper.collection.createSchema('myCollection', {...}, 'instance-id');

// 사전 추가
await javaWrapper.dictionary.addUserDicEntry('사용자', '명사', ..., 'instance-id');

// 색인 실행
await javaWrapper.indexing.executeIndex('myCollection', 'rebuild', 'instance-id');
```

### 6. HTTP 클라이언트 (http.js:1-26) [레거시]
**역할**: Axios 기반 HTTP 통신 (REST API 폴백용)

**주요 기능**:
- HTTP 타임아웃 설정 (기본 60초)
- Authorization 헤더 자동 추가 (API_TOKEN 환경변수)
- 재시도 로직 (429/502/503/504 상태코드)

**주의**: Java 네이티브 호출 실패 시에만 사용됨

### 7. 유틸리티 (utils.js:1-29)
**역할**: 공통 함수 라이브러리

**함수 목록**:
- `tpl(str, params)` : 템플릿 문자열 치환 (`{collection}` → 실제값)
- `makeValidator(schema)` : AJV 스키마 검증 (입력 검증)
- `ok(endpoint, request, data, meta)` : 성공 응답 포맷팅
- `fail(code, message, details, hint)` : 실패 응답 포맷팅

### 8. 도구 레지스트리 (tools/index.js:1-25)
**역할**: 모든 도구 모듈을 하나의 객체로 통합

**구조**:
```javascript
export const tools = {
  'collections.create': { handler: async (input) => {...} },
  'collections.list': { handler: async (input) => {...} },
  // ... 총 50+ 도구
};
```

### 9. 기능별 도구 모듈 (tools/modules/*.js) ⭐ instanceId 파라미터 지원

#### collections.js (5개 도구, instanceId 파라미터 추가)
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

#### ext.js ⭐ Extension 자동 생성 시스템
Java 플러그인 관리 + 자동 생성/컴파일 파이프라인

**기본 도구 (6개)**:
- **ext.java.create** : 플러그인 등록
- **ext.java.update** : 플러그인 수정
- **ext.java.delete** : 플러그인 삭제
- **ext.java.list** : 플러그인 목록
- **ext.java.activate** : 플러그인 활성화
- **ext.java.deactivate** : 플러그인 비활성화

**자동 생성 도구 (5개)** ⭐ 신규:
- **ext.templates** : 사용 가능한 템플릿 목록 (4가지 유형)
- **ext.preview** : 생성될 Java 소스 코드 미리보기
- **ext.generate** : 템플릿 → Java 생성 → 컴파일 → JAR → Base64 → 등록 (완전 자동)
- **ext.attachToCollection** : Extension을 컬렉션에 연결
- **ext.detachFromCollection** : Extension을 컬렉션에서 해제

**Extension 유형 (4가지)**:
| 유형 | 목적 | 메서드 | 용도 |
|------|------|--------|------|
| analyzer | 텍스트 분석기 | tokenStream() | 한글/영문 언어별 처리 |
| processor | 데이터 전처리 | process() | 정규화, 타입 변환 |
| fetcher | 외부 데이터 조회 | process() | REST API 기반 수집 |
| filter | 조건 필터링 | process() | 문서 필터링/선택 |

**사용 예시**:
```javascript
// 1) 템플릿 목록 조회
{"method":"ext.templates","params":{}}

// 2) Java 코드 미리보기
{"method":"ext.preview","params":{"type":"processor","name":"my_ext"}}

// 3) Extension 자동 생성 (한 줄에 모든 것 완료)
{"method":"ext.generate","params":{
  "type":"processor",
  "name":"product_normalizer",
  "description":"제품명 정규화",
  "targetFields":["product_name"]
}}
// 결과: Java 소스 생성 → javac 컴파일 → JAR 패키징 → Base64 인코딩 → Mariner5 등록
```

#### search.js
검색 쿼리 실행
- **search.query** : 검색 실행 (querySet 필수)

#### codegen.js
코드 생성
- **codegen.page.java.create** : Java 검색 페이지 생성
- **codegen.page.java.preview** : 미리보기
- **codegen.page.java.params** : 파라미터 설정

#### setup.js ⭐ v3.8 신규
서비스 설치/구동 관리 (Derby DB, 검색엔진, REST 서버, Tomcat)

**7가지 도구**:
- **setup.detect** : 설치된 서비스 자동 탐지 (경로, 버전, 상태)
- **setup.install** : 서비스 설치 (로컬 ZIP, URL 다운로드, 이미 설치된 경로 등록)
- **setup.configure** : 서비스 설정 (포트, 경로, 옵션)
- **setup.start** : 서비스 시작 (개별 또는 전체)
- **setup.stop** : 서비스 중지 (개별 또는 전체)
- **setup.status** : 서비스 상태 확인 (실행 여부, PID, 포트)
- **setup.logs** : 서비스 로그 조회 (최근 N줄)

**지원 서비스**:
| 서비스 | 기본 포트 | 역할 |
|--------|---------|------|
| Derby DB | 1527 | 검색엔진 메타데이터 저장 |
| Search Engine | 5555 | Mariner5 검색엔진 (AdminServer) |
| REST Server | 8080 | REST API 서버 |
| Tomcat | 9090 | 웹 애플리케이션 서버 |

**사용 예시**:
```javascript
// 1) 서비스 상태 확인
{"method":"setup.status","params":{}}

// 2) 검색엔진 설치 (이미 설치된 경로 등록)
{"method":"setup.install","params":{
  "service":"search",
  "sourceType":"installed",
  "source":"C:\\SearchEngine",
  "port":5555
}}

// 3) URL에서 다운로드 및 설치
{"method":"setup.install","params":{
  "service":"tomcat",
  "sourceType":"url",
  "source":"https://example.com/tomcat.zip",
  "targetPath":"C:\\Services\\tomcat"
}}

// 4) 모든 서비스 시작
{"method":"setup.start","params":{"service":"all"}}

// 5) 검색엔진 로그 조회 (최근 100줄)
{"method":"setup.logs","params":{"service":"search","lines":100}}
```

**설정 파일** (config/services.json):
```json
{
  "derby": {
    "installed": true,
    "path": "C:\\Derby",
    "port": 1527,
    "dataPath": "C:\\Derby\\data"
  },
  "search": {
    "installed": true,
    "path": "C:\\SearchEngine",
    "port": 5555,
    "configPath": "C:\\SearchEngine\\config"
  },
  "rest": {...},
  "tomcat": {...}
}
```

#### schema-from-sql.js ⭐ 신규 + Extension 통합
SQL 쿼리 기반 자동 컬렉션 생성 + Extension 자동 생성/적용

**3가지 도구**:
- **schema.fromSql** : SQL 쿼리/테이블명으로 자동 컬렉션 생성 (Extension 지원)
  - 스키마 자동 분석 (MySQL 메타데이터)
  - 필드 타입 자동 매핑 (VARCHAR→TEXT, INT→INTEGER 등)
  - Analyzer 자동 선택 (한글→korean_analyzer, 영문→standard_analyzer)
  - 색인 필드 vs 정렬 필드 자동 분류
  - Primary Key → Document ID 자동 매핑
  - **NEW**: Extension 자동 생성/적용 (컬렉션 생성 시 함께 처리)
- **schema.listAvailableTables** : 사용 가능한 테이블 목록 조회
- **schema.describeTable** : 특정 테이블 스키마 조회
- **schema.updateCollectionFromSql** : 기존 컬렉션을 SQL로 업데이트 (SAFE/SMART 모드)

**사용 예시 1: 기본 컬렉션 생성**:
```javascript
{
  "method": "schema.fromSql",
  "params": {
    "sql": "SELECT * FROM products",
    "collectionName": "products_search",
    "shards": 3,
    "replicas": 1
  }
}

// 결과:
// 1. products_search 컬렉션 생성
// 2. 8개 필드 자동 추가 (타입, 색인, 정렬 정보 포함)
// 3. Analyzer 자동 설정 (한글/영문 분석기)
// 4. 색인 필드: product_name, description, category
// 5. 정렬 필드: id, price, stock, created_at, updated_at
```

**사용 예시 2: Extension 자동 포함**:
```javascript
{
  "method": "schema.fromSql",
  "params": {
    "sql": "SELECT * FROM products",
    "collectionName": "products_search",
    "extensions": [
      {
        "type": "processor",
        "name": "data_enricher",
        "description": "외부 데이터 보강",
        "targetFields": ["product_name"]
      }
    ]
  }
}

// 결과:
// 1. products_search 컬렉션 생성
// 2. 8개 필드 자동 추가
// 3. Extension 자동 생성:
//    - DataEnricher.java 소스 생성
//    - javac로 컴파일
//    - DataEnricher.jar 생성
//    - Base64 인코딩
//    - Mariner5에 등록
// 4. 전체 과정 자동 처리 (한 번의 요청으로!)
```

**사용 예시 3: 기존 컬렉션 업데이트 (SAFE 모드)**:
```javascript
{
  "method": "schema.updateCollectionFromSql",
  "params": {
    "collectionName": "products_search",
    "sql": "SELECT * FROM products",
    "updateMode": "safe"  // 필드 추가만 수행
  }
}
// 결과: 새로운 필드만 추가 (기존 필드는 유지)
```

### 10. 엔드포인트 설정 (config/endpoints.json) [레거시]

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

### 개발 환경: Claude Code → mariner5-mcp → mariner5 엔진

```
Claude Code (MCP Client)
    ↓
  stdin ← JSON-RPC 요청 (method: "collections.create", params: {...})
    ↓
mariner5-mcp Server (Node.js):
    ├─ 1. handleLine(): JSON-RPC 파싱
    ├─ 2. tools[method].handler(): 입력 검증 (AJV 스키마)
    ├─ 3. java-wrapper.js: 메서드 호출 결정
    │   │
    │   ├─ Try 1: java-bridge.js (JNI 네이티브)
    │   │   ├─ AdminServerClient 획득
    │   │   ├─ mariner5 엔진으로 직접 호출 (포트 5555)
    │   │   └─ 성공 → 응답 반환
    │   │
    │   └─ Fallback: http.js (REST API)
    │       ├─ BASE_URL + 엔드포인트
    │       ├─ mariner5 REST Server 호출 (포트 8080)
    │       └─ 응답 반환
    │
    ├─ 4. 응답 포맷팅 (success/error)
    ├─ 5. stdout → JSON 응답
    │
    └─ 관리도구용DB 업데이트 (필요시)
        ├─ 색인 상태 저장
        ├─ 컬렉션 메타데이터
        └─ 작업 로그
    ↓
stdout ← JSON 응답 (result: {...} 또는 error: {...})
    ↓
Claude Code에서 결과 해석 및 다음 작업 수행
```

### 실 환경 (검색): Java 애플리케이션 → mariner5 REST API

```
사용자 ← 웹 브라우저
    ↓ HTTP GET/POST
Java 검색페이지:
    ├─ SearchController.java
    └─ MarinerSearchClient.java
       ├─ BASE_URL = "http://mariner5-server:8080/api"
       └─ REST API 호출
    ↓ HTTP JSON
mariner5 REST Server (포트 8080):
    ├─ 검색 요청 처리
    ├─ Analyzer로 형태소 분석
    ├─ 검색 알고리즘 실행
    ├─ 랭킹 계산
    └─ 결과 정렬
    ↓
실데이터용DB (MySQL):
    └─ 대규모 데이터셋 쿼리
    ↓
JSON 응답 (검색 결과)
    ↓
Java 검색페이지에서 렌더링
    ↓
HTML ← 웹 브라우저에 표시
```

### 실 환경 (관리도구): webManager → mariner5 JNI

```
관리자 ← 웹 브라우저
    ↓ HTTP GET/POST
Tomcat:
    └─ webManager (포트 8888)
       └─ AdminUI.java
    ↓ JNI 호출
mariner5 AdminServerClient (포트 5555):
    ├─ JNI 브릿지로 직접 통신 (빠름)
    ├─ 컬렉션 관리
    ├─ 색인 제어
    ├─ 사전 관리
    └─ 모니터링
    ↓
mariner5 엔진 (메모리)
    └─ 실시간 결과 반환
    ↓
관리도구용DB (Derby/MySQL):
    ├─ UI 상태 저장
    ├─ 설정 정보
    └─ 모니터링 로그
    ↓
JSON 응답
    ↓
HTML ← webManager UI 렌더링
```

### v1.0 REST API 아키텍처 (레거시)

```
Claude Code
    ↓ stdin JSON-RPC
tools/modules/*.js
    ↓ http.js (Axios)
Mariner5 REST API
```

### 아키텍처 변경 사항

| 항목 | v1.0 (REST API) | v2.0 (Java Native) |
|------|----------------|--------------------|
| 백엔드 | REST API | Java JNI (AdminServerClient) |
| 프로토콜 | HTTP REST | Java 직접 호출 |
| 의존성 | Axios | node-java |
| 지연시간 | HTTP 오버헤드 | 최소 (JNI) |
| 재시도 | HTTP 재시도 로직 | Java 예외 처리 |
| 폴백 | 없음 | REST API 자동 폴백 |
| 연결 | 무상태 요청 | TCP 영구 연결 (AdminServer) |

### 주요 개선 사항

1. **성능**: HTTP 오버헤드 제거, JNI 직접 호출
2. **안정성**: 실패 시 자동 REST API 폴백
3. **기능**: Mariner5 AdminServerClient 전체 API 접근 가능
4. **호환성**: 기존 REST API 설정 유지 (레거시 지원)
5. **확장성**: Java 래퍼를 통해 새 기능 추가 용이

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

### Java 네이티브 설정 (필수)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `MARINER5_HOME` | `C:\DATA\Project\mariner5` | Mariner5 검색엔진 설치 경로 |
| `MARINER5_HOST` | `localhost` | AdminServer 호스트 |
| `MARINER5_PORT` | `5555` | AdminServer 포트 |

### REST API 폴백 설정 (레거시)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `BASE_URL` | `http://localhost:8080/api` | 검색엔진 REST API 베이스 URL (Java 연결 실패 시) |
| `API_TOKEN` | 없음 | 인증 토큰 (있으면 Authorization 헤더에 포함) |
| `HTTP_TIMEOUT` | `60000` | HTTP 타임아웃(ms) |

### 공통 설정

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `LOG_LEVEL` | `info` | 로깅 레벨 (debug/info/warn/error) |

## 📦 의존성

```json
{
  "java": "^0.17.0",       // Java JNI 브릿지 ⭐
  "uuid": "^9.0.0",        // UUID 생성 (인스턴스 ID) ⭐ 신규
  "axios": "^1.12.2",      // HTTP 클라이언트 (폴백용)
  "dotenv": "^16.6.1",     // 환경변수 로딩
  "ajv": "^8.17.1"         // JSON 스키마 검증
}
```

**주의**: `node-java`는 다음 요구사항 필요:
- Java JDK 설치 (JAVA_HOME 환경변수)
- Python 2.7+ 또는 3.x
- C++ 컴파일러 (Windows: Visual C++ Build Tools)

## 🧪 테스트 예시

### 기본 도구 테스트

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

### SQL 기반 자동 컬렉션 생성 테스트

```bash
# 1) 사용 가능한 테이블 조회
echo '{"id":1,"method":"schema.listAvailableTables","params":{}}' | npm start

# 2) 특정 테이블 스키마 조회
echo '{"id":2,"method":"schema.describeTable","params":{"table":"products"}}' | npm start

# 3) SQL로 자동 컬렉션 생성 (가장 중요!)
echo '{"id":3,"method":"schema.fromSql","params":{"sql":"SELECT * FROM products","collectionName":"products_search","shards":3,"replicas":1}}' | npm start

# 결과:
# - products_search 컬렉션 자동 생성
# - 8개 필드 자동 추가 (타입, 색인, 정렬 정보 포함)
# - Analyzer 자동 설정 (한글/영문 분석기)
# - 색인 필드: product_name, description, category
# - 정렬 필드: id, price, stock, created_at, updated_at
# - Primary Key: id (Document ID)

# 4) 자동 생성된 컬렉션 확인
echo '{"id":4,"method":"collections.get","params":{"collection":"products_search"}}' | npm start

# 5) 색인 실행
echo '{"id":5,"method":"index.run","params":{"collection":"products_search","type":"rebuild"}}' | npm start

# 6) 검색 테스트
echo '{"id":6,"method":"search.query","params":{"querySet":{"version":"1.0","query":[{"fromSet":{"collection":["products_search"]},"selectSet":{"fields":["*"]},"whereSet":{"operator":"AND","searchKeyword":"노트북"}}]}}}' | npm start
```

### Extension 자동 생성 테스트

```bash
# 1) 템플릿 목록 조회
echo '{"id":1,"method":"ext.templates","params":{}}' | npm start

# 결과: analyzer, processor(2), fetcher, filter 5개 템플릿

# 2) Java 소스 미리보기
echo '{"id":2,"method":"ext.preview","params":{"type":"processor","name":"my_enricher","description":"데이터 보강"}}' | npm start

# 결과: Java 소스 코드 (56줄)

# 3) Extension 자동 생성 (한 번에 모든 것!)
echo '{"id":3,"method":"ext.generate","params":{"type":"processor","name":"product_normalizer","description":"제품명 정규화","targetFields":["product_name","category"]}}' | npm start

# 결과:
# - ProductNormalizer.java 자동 생성
# - javac로 컴파일 (성공)
# - ProductNormalizer.jar 생성
# - Base64 인코딩
# - Mariner5에 자동 등록
# - className, binary, size 반환

# 4) SQL 기반 컬렉션 생성 + Extension 자동 포함
echo '{"id":4,"method":"schema.fromSql","params":{"sql":"SELECT * FROM products","collectionName":"products_search","extensions":[{"type":"processor","name":"data_enricher","description":"외부 데이터 보강","targetFields":["product_name"]}]}}' | npm start

# 결과:
# - products_search 컬렉션 생성
# - 8개 필드 자동 추가
# - data_enricher Extension 자동 생성/컴파일/등록
# - 모든 것을 한 번의 요청으로 완료!

# 5) Extension을 컬렉션에 연결
echo '{"id":5,"method":"ext.attachToCollection","params":{"extension":"product_normalizer","collection":"products_search"}}' | npm start

# 결과: attached: true
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

## 🎯 Extension 자동 생성 시스템 (v3.0) ⭐ 핵심 기능

### 전체 흐름 (End-to-End)

```
MCP 요청
  ↓
ext.generate(config)
  ├─ 1단계: 템플릿 선택 (4가지 중 선택)
  ├─ 2단계: 변수 치환 ({{className}}, {{targetFields}} 등)
  ├─ 3단계: Java 소스 생성
  ├─ 4단계: javac 컴파일
  ├─ 5단계: JAR 패키징
  └─ 6단계: Base64 인코딩 + Mariner5 자동 등록
  ↓
MCP 응답 (className, packageName, binary, size)
```

### 핵심 특징

| 기능 | 설명 |
|------|------|
| **자동 코드 생성** | 템플릿 기반으로 Java 소스 자동 생성 |
| **자동 컴파일** | javac를 통한 Java 컴파일 (Mariner5 라이브러리 포함) |
| **자동 JAR 생성** | 컴파일된 클래스를 JAR로 패키징 |
| **Base64 인코딩** | JAR을 Base64로 인코딩 (Mariner5 REST API 전송용) |
| **자동 등록** | Mariner5에 자동 등록 (한 번의 요청으로!) |
| **미리보기** | 컴파일 전 Java 소스 코드 확인 가능 |
| **컬렉션 통합** | SQL 기반 컬렉션 생성 시 Extension 자동 포함 |

### 파이프라인 아키텍처

```
extension-builder.js
├─ listAvailableTemplates()      → 템플릿 목록 (4가지)
├─ renderTemplate()               → 변수 치환
├─ generateJavaSource()           → .java 파일 생성
├─ compileJava()                  → javac 컴파일
├─ createJar()                    → JAR 생성
├─ jarToBase64()                  → Base64 인코딩
└─ generateExtension()            → 전체 파이프라인 (핵심)

ext.js (MCP 도구)
├─ ext.templates                  → 템플릿 목록 조회
├─ ext.preview                    → Java 소스 미리보기
├─ ext.generate                   → 자동 생성 (위 파이프라인 호출)
├─ ext.attachToCollection         → Extension 연결
└─ ext.detachFromCollection       → 연결 해제

schema-from-sql.js (SQL 통합)
├─ schema.fromSql                 → SQL 기반 컬렉션 생성
│  └─ extensions 파라미터 지원 (Extension 자동 생성)
└─ schema.updateCollectionFromSql → 기존 컬렉션 업데이트
```

## 🔗 참고 문서

- [README.md](./README.md) - 사용 가이드
- [CLAUDE.md](./CLAUDE.md) - AI 작업 지침
- 검색엔진 REST API 문서 (BASE_URL 참조)

## 📊 프로젝트 통계

### v3.0 (멀티 인스턴스 지원)

- **새로 추가된 파일**: instance-manager.js, connection-manager.js (2개)
- **수정된 파일**: java-bridge.js (Map 기반 다중 연결), java-wrapper.js (instanceId 파라미터), 도구 모듈 5개
- **코드량**: 약 400줄 (instance-manager.js + connection-manager.js)
- **최대 동시 인스턴스**: 10개 (설정 가능)
- **인스턴스 식별**: UUID 기반
- **기본 서버 관리**: 자동 장애 조치 지원

### v3.1 (관리 기능 및 모니터링 확장)

- **총 도구**: 96개+ (기본 11개 + 신규 85개)
- **총 모듈**: 14개 MCP 도구 모듈 + java-wrapper-v2 7개 모듈
- **java-wrapper-v2**: 400+ 메서드 (7개 모듈)
- **새로 추가된 도구 모듈** (3개):
  - admin.js: 40개 도구 (계정, 스케줄 작업, 접속 설정, 로그 설정)
  - hotKeyword.js: 15개 도구 (핫 키워드, 트렌딩, 추천 관리)
  - monitoring.js: 30개 도구 (로그 모니터링, 리소스 모니터링)
- **새로 추가된 java-wrapper-v2 모듈** (7개):
  - collection.js: 80+ 메서드
  - dictionary.js: 100+ 메서드
  - indexing.js: 20+ 메서드
  - management.js: 40+ 메서드
  - server.js: 30+ 메서드
  - monitoring.js: 30+ 메서드
  - tuning.js: 60+ 메서드
- **코드량**: 약 1,300줄 신규 추가 (admin.js, hotKeyword.js, monitoring.js + java-wrapper-v2 모듈)
- **특징**: 다중 인스턴스 지원, 모든 메서드에 선택적 instanceId 파라미터

### v3.2 (Mariner5 라이브러리 고급 기능 확장)

- **총 도구**: 130개+ (기존 96개 + 신규 34개)
- **새로 추가된 도구 모듈** (2개):
  - dict-advanced.js: 16개 도구 (UserCnDic 7개 + UserPreMorph 9개) ⭐ 신규
  - datasource.js: 15개 도구 (외부 DB 연동) ⭐ 신규
- **확장된 java-wrapper-v2 모듈** (2개):
  - collection.js: 80+ → 100+ 메서드 (DataSource 20+ 추가)
  - dictionary.js: 100+ → 130+ 메서드 (UserCnDic 7개, UserPreMorph 8개 추가)
- **신규 기능**:
  - User CN Dictionary: 중국어/일본어/외국어 유의어 관리
  - User PreMorph: Pre-Morph 형태소 분석 (커스텀 분석기)
  - DataSource: MySQL/Oracle/PostgreSQL 등 외부 DB 연동
- **코드량**: 약 850줄 신규 추가
- **특징**: Mariner5 미사용 API 활용, HIGH 우선순위 기능 3개 구현

### v3.3 (MEDIUM 우선순위 기능 완성) ⭐ 최신

- **총 도구**: 178개+ (기존 130개 + 신규 48개)
- **새로 추가된 도구 모듈** (2개):
  - collection-monitor.js: 30개 도구 (DBWatcher 고급 8개 + CollectionMonitor 12개 + Topicker 8개) ⭐ 신규
  - advanced-search.js: 18개 도구 (IntegratedInfo 7개 + SearchRequest 11개) ⭐ 신규
- **확장된 java-wrapper-v2 모듈** (3개):
  - collection.js: 100+ → 130+ 메서드 (DBWatcher 고급 8개, CollectionMonitor 10개)
  - hotspot.js: 30+ 메서드 (Topicker 8개, IntegratedInfo 7개, SearchRequest 8개) ⭐ 신규
- **신규 기능**:
  - DBWatcher 고급: 실시간 DB 변경 감지 + 필터링 (8개 도구)
  - CollectionMonitor: 컬렉션 실시간 모니터링 + 성능 분석 (12개 도구)
  - Topicker: 상위 키워드/트렌드 분석 (8개 도구)
  - IntegratedInfo: 서버 통합 정보 조회 (7개 도구)
  - SearchRequest: 고급 검색 기능 (11개 도구)
- **코드량**: 약 1,200줄 신규 추가 (collection-monitor.js 650줄 + advanced-search.js 550줄)
- **특징**: MEDIUM 우선순위 5개 기능 완성, mariner5 API 활용률 80% 이상

### v2.0 (Extension 자동 생성)

- **총 도구**: 50+ (기본 도구 + Extension 자동 생성 도구)
- **새로 추가된 도구**: ext.generate, ext.templates, ext.preview, ext.attachToCollection, ext.detachFromCollection (5개)
- **새로 추가된 파일**: extension-builder.js, schema-analyzer.js, schema-comparator.js, 5개 템플릿 (8개)
- **코드량**: 약 1,500줄 (extension-builder.js + 템플릿)
- **지원하는 Extension 유형**: 4가지 (analyzer, processor×2, fetcher, filter)
- **자동화 수준**: 100% (한 번의 MCP 요청으로 생성→컴파일→패키징→등록)
