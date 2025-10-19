# mariner5-mcp

**Mariner5 기업형 검색엔진**을 완벽하게 제어할 수 있는 **Node.js 기반 MCP(Model Context Protocol) 서버**입니다.

**Java JNI 네이티브 지원** + **REST API 폴백**으로 안정적이고 빠른 성능을 제공합니다.

## 주요 기능

- **컬렉션 관리**: 스키마, 필드, 쿼리 관리 (130+ 메서드)
- **사전 관리**: 사용자사전, 불용어, 유의어, 문서랭킹 (130+ 메서드)
- **색인 제어**: 색인 빌드, 동기화, 백업/복구 (25+ 메서드)
- **서버/로그 운영**: 계정, 스케줄, 접속 제어, 로그 (70+ 메서드)
- **모니터링**: 실시간 로그, 성능 분석, 리소스 모니터링 (60+ 메서드)
- **고급 기능**: Vector Search, Union, Drama, 시뮬레이션 (50+ 메서드)
- **검색 튜닝**: SearchQueryBuilder, Analyzer 설정, 다단계 정렬 (60+ 메서드)
- **Java Extension**: 자동 생성/컴파일/배포 (5가지 유형)
- **SQL 통합**: SQL 쿼리로 자동 컬렉션 생성
- **코드 생성**: 검색 웹페이지 Java 소스 생성

## 설치
```bash
npm i
cp .env.example .env
# .env의 BASE_URL, API_TOKEN을 실제 API에 맞게 설정
```

## 실행 (stdin/stdout JSON-RPC)
```bash
npm start
```
- 한 줄에 하나의 JSON 요청을 쓰면, 한 줄에 응답이 돌아옵니다.
- 예시:
```json
{"id":1,"method":"collections.list","params":{}}
```

## 주요 환경변수
- `BASE_URL` : 백엔드 검색엔진 REST API 베이스 URL
- `API_TOKEN`: 인증 토큰(있을 경우)
- `HTTP_TIMEOUT`: HTTP 타임아웃(ms)
- `LOG_LEVEL`: debug|info|warn|error

## 엔드포인트 매핑
`config/endpoints.json`에서 실제 엔진의 REST 경로로 교체하면 됩니다.

## 제공 도구(메서드명)
- collections.* : create/update/delete/get/list
- columns.*     : add/update/delete/list
- queries.*     : create/update/delete/list/test
- dict.*        : recommend/redirect/stopword/userCn/documentRanking (CRUD)
- index.*       : run/status, logs.index.get
- server.*      : setProps/health
- logs.*        : error.get/error.delete/error.deleteAll
- sim.*         : create/update/delete/list/run/status
- ext.java.*    : create/update/delete/list/activate/deactivate
- search.query  : 검색 실행
- codegen.page.java.* : create/preview/params

## 테스트 예시
```bash
# 1) 검색
echo '{ "id":1, "method":"search.query", "params":{"querySet":{"version":"1.0","query":[{"fromSet":{"collection":["demo"]},"selectSet":{"fields":["*"]},"whereSet":{"operator":"AND","searchKeyword":"테스트"}}]}} }' | npm start

# 2) 색인 실행
echo '{ "id":2, "method":"index.run", "params":{"collection":"demo","type":"rebuild"} }' | npm start

# 3) 컬럼 추가
echo '{ "id":3, "method":"columns.add", "params":{"collection":"demo","field":"title","type":"text","analyzer":"korean"} }' | npm start
```
