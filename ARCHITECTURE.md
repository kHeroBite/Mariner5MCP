# ARCHITECTURE.md - mariner5-mcp 시스템 아키텍처

mariner5-mcp는 **3가지 사용 환경**에서 동작하도록 설계되었습니다.

---

## 1️⃣ 개발 환경 (Claude Code)

```
Claude Code ←→ mariner5-mcp ←→ mariner5 엔진 ←→ 관리도구용DB/실데이터용DB
   (MCP Client)   (JSON-RPC)    (JNI/REST)      (Derby/MySQL)

역할:
- 세팅, 수집, 색인, REST API 설정
- 개발자 중심의 AI 기반 자동화
```

### 통신 구조

```yaml
Claude Code (MCP Client):
  프롬프트 작성 → mariner5-mcp에 JSON-RPC 전송
    ↓
  mariner5-mcp (Node.js MCP Server):
    ├─ Java JNI 브릿지: mariner5 엔진과 네이티브 통신 (포트 5555)
    └─ REST API 폴백: HTTP를 통한 REST 통신 (포트 8080)
    ↓
  mariner5 엔진 (Java):
    ├─ AdminServer (포트 5555): JNI 관리 인터페이스
    └─ REST Server (포트 8080): HTTP 관리 인터페이스
    ↓
  관리도구용DB (Derby/MySQL):
    - 컬렉션 설정, 인덱스 정보, 통계 저장
```

### 개발 사이클

1. **스키마 설계**: SQL 쿼리 분석 → 자동 컬렉션 생성
2. **데이터 수집**: 외부 데이터 소스 연동
3. **색인 빌드**: 색인 생성 및 동기화
4. **검색 튜닝**: QueryBuilder, Analyzer, Sort 설정
5. **통합 테스트**: 검색 성능 및 정확도 검증
6. **배포 준비**: Java 검색페이지 코드 자동 생성

### 환경변수 예시

```bash
# .env (mariner5-mcp 설정)
MARINER5_HOME=C:\DATA\Project\mariner5
MARINER5_HOST=localhost
MARINER5_PORT=5555
BASE_URL=http://localhost:8080/api
LOG_LEVEL=debug
```

---

## 2️⃣ 실 환경 (Java 검색 애플리케이션)

```
Java 검색페이지 ←→ mariner5 REST Server ←→ mariner5 엔진 ←→ 실데이터용DB
  (검색 UI)       (REST API)            (검색 엔진)      (MySQL)

역할:
- 최종 사용자 검색 서비스 제공
- 고성능, 고가용성 필수
- mariner5-mcp 미포함
```

### 통신 구조

```yaml
사용자 ← 웹 브라우저 → Java 검색페이지:
  ├─ 검색 요청 수신
  └─ mariner5 REST API 호출 (포트 8080)
      ↓
  mariner5 REST Server:
    └─ HTTP/JSON 기반 검색 요청 처리
      ↓
  mariner5 엔진:
    ├─ 검색 수행
    ├─ 랭킹 계산
    └─ 결과 반환
      ↓
  실데이터용DB (MySQL):
    - 대규모 데이터셋 저장
    - 색인 복구/백업 시 사용
```

### 특징

- **API Only**: Java 애플리케이션이 REST API만 사용
- **확장성**: 여러 Java 인스턴스 병렬 요청 가능
- **고가용성**: mariner5 엔진이 안정적으로 운영 중이어야 함

### 구성 예시

```bash
# Java 검색페이지 구성
mariner5-search-app/
├── SearchController.java
├── config/
│   └── MarinerSearchClient.java
│       ├── REST_URL: "http://mariner5-server:8080/api"
│       └── timeout: 30s
└── resources/
    └── mariner5.properties
```

---

## 3️⃣ 실 환경 (관리도구)

```
Tomcat ← 관리도구(webManager) ←→ mariner5 (5555포트)
           (마리너 웹UI)          (JNI 통신)
                              ↓
                        관리도구용DB
                        (Derby/MySQL)

역할:
- mariner5 엔진 관리/모니터링
- 관리자용 웹 UI 제공
- 컬렉션, 사전, 색인, 로그 관리
```

### 통신 구조

```yaml
관리자 ← 웹 브라우저 → webManager (Tomcat):
  ├─ 관리 UI 렌더링
  └─ mariner5 JNI 호출 (포트 5555)
      ↓
  mariner5 엔진 (AdminServer):
    ├─ JNI 브릿지로 직접 통신
    ├─ 빠른 응답 (HTTP 오버헤드 없음)
    └─ 관리 작업 수행 (컬렉션 생성, 색인 실행 등)
      ↓
  관리도구용DB (Derby/MySQL):
    - 웹UI 상태 저장
    - 설정 정보 저장
    - 모니터링 로그 저장
```

### 포트 정보

| 포트 | 용도 | 통신 방식 |
|------|------|---------|
| 5555 | mariner5 AdminServer | JNI (관리도구) |
| 8080 | mariner5 REST Server | HTTP (검색 앱) |
| 8888 | Tomcat (webManager) | HTTP (웹 관리자) |

### 시작 순서

1. **mariner5 엔진 시작** (포트 5555, 8080)
2. **Tomcat 시작** (포트 8888)
3. **webManager 배포**
4. **관리자 접속** (`http://localhost:8888/mariner`)

---

## 환경별 특징 비교

| 특징 | 개발 환경 | 실 환경 (검색) | 실 환경 (관리도구) |
|------|---------|-------------|------------|
| **주 사용자** | 개발자 (Claude Code) | 최종 사용자 | 관리자 |
| **통신 방식** | JNI + REST | REST only | JNI |
| **포트** | 5555, 8080 | 8080 | 5555, 8080, 8888 |
| **mariner5-mcp** | ✅ 필수 | ❌ 미포함 | ❌ 미포함 |
| **성능** | 개발/테스트 용 | 고성능/고가용성 | 관리/모니터링 용 |
| **데이터** | 테스트용 | 실데이터 | 설정/로그 |
| **백업** | 선택 | 필수 | 선택 |

---

## 🔄 데이터 흐름 (전체 사이클)

```
┌─────────────────────────────────────────────────────────────┐
│                    개발 환경 (Claude Code)                    │
├─────────────────────────────────────────────────────────────┤
│ 1. SQL 쿼리 분석 + 자동 컬렉션 생성                          │
│    Claude Code → mariner5-mcp → mariner5 엔진               │
│    (schema.fromSql 도구 사용)                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. 데이터 수집 + 색인 빌드                                   │
│    mariner5-mcp로 색인 실행 (index.run)                     │
│    실데이터용DB에서 데이터 로드                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. 검색 튜닝 (개발 환경)                                     │
│    - QueryBuilder로 검색 쿼리 최적화                        │
│    - Analyzer 설정으로 형태소 분석 개선                     │
│    - Sort로 다단계 정렬 설정                                │
│    - 사전 추가/수정 (불용어, 유의어)                       │
│    Claude Code → mariner5-mcp 도구 사용                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. 정확도 검증 (개발 환경)                                   │
│    - search.query로 검색 테스트                             │
│    - 결과 검증 및 미세 조정                                 │
│    - Java Extension 작성 및 배포                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. 배포 준비 (개발 환경)                                     │
│    - codegen.page.java로 검색페이지 자동 생성              │
│    - mariner5-mcp에서 Java 소스 내보내기                   │
│    - 설정 파일 내보내기                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    실 환경 배포                               │
├─────────────────────────────────────────────────────────────┤
│ 6a. 검색 서비스 실행                                         │
│     mariner5 엔진 + Java 검색페이지                          │
│     사용자 → REST API → 검색 결과                           │
│                                                              │
│ 6b. 관리도구 실행                                            │
│     Tomcat + webManager                                     │
│     관리자 → JNI 통신 → 모니터링/관리                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 도구별 사용 환경

### 개발 환경에서만 사용
```
mariner5-mcp 도구:
- schema.fromSql: SQL 기반 자동 컬렉션 생성 (개발 전용)
- ext.generate: Java Extension 자동 생성 (개발용)
- query-builder-tools: 검색 쿼리 최적화 (튜닝용)
- analyzer-tools: Analyzer 설정 (개발용)
- sort-tools: 정렬 설정 (개발용)
- codegen.page.java: 검색페이지 코드 생성 (배포 준비용)
```

### 개발 + 운영 환경 모두 사용
```
공통 도구:
- collections.*: 컬렉션 관리
- columns.*: 필드 관리
- index.*: 색인 제어
- dict.*: 사전 관리
- server.*: 서버 설정
- search.query: 검색 실행
- logs.*: 로그 조회
```

### 운영 환경에서만 사용
```
webManager 도구 (mariner5-mcp 없음):
- 모니터링 대시보드
- 성능 분석
- 실시간 로그
- 사용자 관리
- 백업/복구
```

---

## 🎯 mariner5-mcp의 역할

**mariner5-mcp는 개발 환경의 중추입니다:**

1. **자동화**: Claude Code의 프롬프트로 검색 엔진 관리 자동화
2. **편의성**: 복잡한 Java 코드 작성 없이 MCP 도구로 제어
3. **신속성**: SQL 쿼리만으로 검색 인덱스 자동 생성
4. **확장성**: Extension 자동 생성/배포로 커스터마이징 용이
5. **통합성**: 다양한 데이터베이스/시스템과 연동 가능

**실 환경에서는 필요 없습니다:**
- 검색 서비스: REST API만 필요
- 관리도구: Tomcat + webManager만 필요
- mariner5-mcp는 개발 단계에서만 사용

---

## 📋 체크리스트

### 개발 환경 구축
- [ ] mariner5-mcp 설치
- [ ] mariner5 엔진 실행 (포트 5555, 8080)
- [ ] 관리도구용DB 연동 (Derby/MySQL)
- [ ] Claude Code에 mariner5-mcp MCP 서버 등록
- [ ] 첫 번째 테스트 쿼리 실행

### 실 환경 배포 (검색 서비스)
- [ ] mariner5 엔진 배포 (포트 5555, 8080)
- [ ] 실데이터용DB 연동 (MySQL)
- [ ] Java 검색페이지 빌드
- [ ] mariner5 REST API 테스트
- [ ] 성능 테스트 및 모니터링

### 실 환경 배포 (관리도구)
- [ ] mariner5 엔진 실행 확인
- [ ] Tomcat 설치 및 구성
- [ ] webManager 배포
- [ ] JNI 연결 테스트
- [ ] 관리자 접근 권한 설정

---

## 참고
- [README.md](./README.md) - 설치 및 사용 가이드
- [PROJECT.md](./PROJECT.md) - 프로젝트 상세 구조
- [CLAUDE.md](./CLAUDE.md) - AI 작업 지침
