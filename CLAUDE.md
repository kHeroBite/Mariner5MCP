# CLAUDE.md - search-mcp-node AI 작업 지침서

이 문서는 Claude Code가 search-mcp-node 프로젝트에서 작업할 때 필요한 모든 정보를 포함합니다.

## 공통 명령어 참조

```yaml
빌드_및_실행:
  개발_실행: npm start 또는 npm run dev
  용도: 모든 코드 변경 후 실행 테스트 (stdin/stdout JSON-RPC)

의존성_설치:
  명령어: npm install 또는 npm i
  용도: package.json 변경 후 필수 실행

린트_검사:
  명령어: npm run lint
  용도: 코드 스타일 검사 (선택사항)

테스트_예시:
  컬렉션_조회: echo '{"id":1,"method":"collections.list","params":{}}' | npm start
  색인_실행: echo '{"id":2,"method":"index.run","params":{"collection":"demo","type":"rebuild"}}' | npm start
  검색: echo '{"id":3,"method":"search.query","params":{"querySet":{...}}}' | npm start

ntfy_알림:
  명령어: |
    echo '{
      "topic": "SearchMCPAlert",
      "title": "클로드코드 작업 완료",
      "message": "작업 요약: [구체적인_작업_내용]\n\n커밋 내역:\n- [커밋_해시] [커밋_메시지]",
      "priority": 4,
      "tags": ["checkmark", "AI", "Claude", "complete"]
    }' > temp_claude_final.json
    curl https://ntfy.sh -H "Content-Type: application/json; charset=utf-8" --data-binary @temp_claude_final.json
    rm temp_claude_final.json
  용도: 작업 완료 알림 (절대 필수)
```

## ⚠️ 권장 작업 순서

```yaml
권장_작업_절차:
  기본_모드_개별_단계:
    1_코드_검토:
      실행_시점:
        - 모든 코드 변경 전
        - 구조 변경 시
      필수조건:
        - PROJECT.md 참조하여 영향 범위 파악
        - 의존성 확인 (파일 간, 함수 간 호출 관계)

    2_코드_수정:
      작업:
        - 파일 수정
        - 새 도구 모듈 추가 시 tools/index.js에 등록
        - 엔드포인트 추가 시 config/endpoints.json 업데이트
        - AJV 스키마 정의 (모든 입력 검증)

    3_의존성_확인:
      npm_install:
        - package.json 변경 시: npm install
        - 스트림 없이 검증만: npm list

    4_실행_테스트:
      명령어: npm start
      입력: JSON-RPC 요청 (한 줄)
      확인:
        - 응답이 JSON 포맷인가?
        - error/result 필드 있는가?
        - id 필드가 요청과 일치하는가?
      실패_시:
        - 스키마 검증 에러 확인
        - HTTP 엔드포인트 확인 (config/endpoints.json)
        - BASE_URL 및 API_TOKEN 확인 (.env)

    5_문서_업데이트:
      조건: 중요한_변경_발생시만
      대상: PROJECT.md, CLAUDE.md
      실행_시점: 코드 변경 후, 커밋 전
      변경사항:
        - 새_도구_모듈_추가
        - 새_엔드포인트_추가
        - 아키텍처_변경
        - 함수_시그니처_변경
        - 환경변수_추가/변경
      이유: 문서는 코드와 함께 커밋되어야 일관성 유지

    6_커밋_준비:
      파일: .commit_message.txt
      형식: "[클로드] {이모지} {설명} (claude-haiku-4-5-20251001)"
      인코딩: UTF-8
      순서:
        - Read .commit_message.txt
        - Edit .commit_message.txt (기존 내용 덮어쓰기)
      포함사항: 코드 변경 + 문서 변경

    7_git_작업:
      명령어:
        - set GIT_TERMINAL_PROMPT=0
        - git add .
        - git -c core.editor=true commit -F .commit_message.txt
        - git push
      커밋_내용: 코드 + 문서 모두 포함

    8_ntfy_알림:
      참조: [공통_명령어_참조_ntfy_알림]
      필수: 절대_필수_절대_빠뜨리지_말것
      실행_시점: 모든_작업_완료_후

  조건부_실행:
    context_체크:
      조건: context가_20%_이하로_남은_경우
      명령어: /compact
      설명: 대화 기록 압축으로 context 공간 확보
      실행_시점: 작업 중 언제든지 (순서 무관)
```

## 📜 작업 이력 관리

```yaml
작업_이력_관리:
  history.md_파일: C:\DATA\Project\search-mcp-node\history.md (선택적 참조)
  읽기_시점: 과거 이력 질문, 버그 추적, 설계 결정 확인 시만
  기록_대상: 주요 기능/아키텍처 변경, 중요 버그 수정, 새 도구 추가
  기록_형식: 날짜, 작업자, 변경내용, 이유, 영향파일, 주의사항
```

## 🤖 AI 동작 원칙

```yaml
AI_응답_규칙:
  필수: 항상_한글로_답변 (기술 용어는 한글 우선, 필요시 영문 괄호 병기)
  출력_형식:
    - 최종_결과만_간결하게: 소스코드/빌드로그/장황한_설명 출력 금지
    - 핵심_요약: 무엇을 했는지 3줄 이내로 요약
    - 결과_확인: 성공/실패 여부와 핵심 수치만 표시
  트랜잭션: 처음부터 끝까지 원자적 완료 (git commit/ntfy 중단 금지)
  오류: 자동 수정 및 재시도 (오류 없어질 때까지 반복)

콘솔_출력_금지:
  원칙: 명령 실행 시 로그나 진행 메시지를 콘솔에 출력하지 마라
  적용_범위:
    - npm_install: 설치 로그 출력 금지
    - 실행_테스트: 테스트 실행 중 진행 메시지 출력 금지
    - 명령_실행: 일반 bash 명령의 상세 로그 출력 금지
    - 수정_과정: 코드 수정 중간 과정, 시행착오, 오류 발생 내역 출력 금지
    - 소스_변경: 변경되는 소스 코드 내용 출력 금지
  허용_출력:
    - 최종_결과_요약: 해결 완료 후 성공/실패 여부와 핵심 수치만 간결하게
    - 치명적_오류: 해결 불가능한 오류만 표시 (해결 가능한 오류는 자동 수정 후 결과만 표시)
  금지_출력:
    - 중간_과정: "수정 중입니다", "오류가 발생했습니다", "다시 시도합니다" 등
    - 시행착오: 여러 번 시도하는 과정의 각 단계별 진행 상황
    - 소스_코드: 변경 전/후 소스 코드 diff, 코드 블록
  이유: 콘솔 가독성 유지 및 핵심 정보만 전달

소스코드_구조_확인_필수_절차:
  PROJECT.md_읽기_필수:
    실행_시점:
      - 소스 코드 구조 질문 시
      - 파일 인벤토리 확인 시
      - 함수 위치 확인 시
      - 아키텍처 질문 시
      - 의존성 확인 시
      - 새 파일 추가 전

  우선순위:
    - PROJECT.md: 소스 코드 구조 (파일, 함수, 아키텍처, 도구)
    - CLAUDE.md: 작업 프로세스 및 AI 동작 원칙
    - README.md: 사용 가이드 및 설정
```

## 📁 프로젝트 구조

**📖 상세 구조 문서: [PROJECT.md](./PROJECT.md)**

PROJECT.md 파일에는 다음 정보가 문서화되어 있습니다:
- 프로젝트 메타정보 (Node.js ES Module, MCP 서버)
- 전체 파일 인벤토리 (15개 파일 구조)
- 핵심 컴포넌트 상세 설명 (server.js, http.js, tools/...)
- 11개 도구 모듈 (collections, columns, queries, dict, index, server, logs, sim, ext, codegen, search)
- 데이터 흐름도 및 에러 처리
- 의존성 정보 (axios, dotenv, ajv)
- 테스트 예시

```yaml
프로젝트_개요:
  프로젝트명: search-mcp-node
  타입: Node.js MCP 서버 (stdin/stdout JSON-RPC)
  버전: 1.0.0
  런타임: Node.js (ES Module)
  총_파일수: 15개
  구성:
    - 핵심_서버: 3개 (server.js, http.js, utils.js)
    - 도구_레지스트리: 1개 (tools/index.js)
    - 도구_모듈: 11개 (collections, columns, queries, dict, index, server, logs, sim, ext, codegen, search)
    - 설정: 1개 (config/endpoints.json)
    - 의존성: 3개 (package.json, package-lock.json, .env)
    - 문서: 3개 (README.md, PROJECT.md, CLAUDE.md)

  주의사항:
    - 소스 코드 구조 확인 시 PROJECT.md 파일 필수 참조
    - 새 도구 추가 시 tools/index.js에 등록
    - 새 엔드포인트 추가 시 config/endpoints.json 수정
    - 모든 입력은 AJV 스키마로 검증
    - 모든 응답은 JSON 포맷
```

## 📝 중요 주의사항

```yaml
JSON_RPC_통신:
  요청_형식: {"id":N,"method":"tool.name","params":{...}}
  응답_형식_성공: {"id":N,"result":{"success":true,"endpoint":"","data":...}}
  응답_형식_실패: {"id":N,"error":{"code":"E_CODE","message":"...","data":{}}}
  주의: 응답은 반드시 한 줄로 출력 (newline 포함)

입력_검증:
  규칙: 모든 도구는 AJV 스키마로 입력 사전 검증
  실패_시: E_INVALID_INPUT 에러 반환 (검증 오류 상세 포함)
  예시: 필수필드 누락, 잘못된 타입, 범위 위반

HTTP_통신:
  클라이언트: Axios 기반
  기본_타임아웃: 60초 (HTTP_TIMEOUT 환경변수로 변경)
  자동_재시도: 429/502/503/504 상태코드 (1초 대기 후 재시도)
  인증: API_TOKEN 환경변수 있으면 Authorization 헤더 추가
  베이스_URL: BASE_URL 환경변수 (기본값: http://localhost:8080/api)

도구_추가_가이드:
  절차:
    1. tools/modules/feature-name.js 파일 생성
    2. AJV 스키마 정의
    3. tools/index.js에 import & export 추가
    4. config/endpoints.json에 경로 추가
    5. README.md & PROJECT.md 문서 업데이트

  템플릿:
    // tools/modules/example.js
    export const example = {
      'example.action': {
        handler: async (input) => {
          const schema = { type: 'object', required: ['param'] };
          makeValidator(schema)(input);
          const url = BASE_URL + ep.action;
          const res = await http.post(url, input);
          return ok(ep.action, input, res.data);
        }
      }
    };

환경변수:
  BASE_URL: 검색엔진 REST API 베이스 URL (기본값: http://localhost:8080/api)
  API_TOKEN: 인증 토큰 (있으면 Authorization 헤더에 포함)
  HTTP_TIMEOUT: HTTP 타임아웃 ms 단위 (기본값: 60000)
  LOG_LEVEL: 로그 레벨 debug|info|warn|error (기본값: info)

한글_인코딩:
  통신언어: 한국어
  파일인코딩: UTF-8 (BOM 없음)
  줄바꿈: LF (Linux 호환)
  주의: Windows 환경에서도 LF 사용 (Git CRLF 변환 비활성화 권장)
```

## 📋 문서 업데이트 규칙

```yaml
업데이트_필수:
  코드_변경:
    - 새_도구_모듈_추가: PROJECT.md에 도구 정보 추가 (메서드명, 역할, 파라미터)
    - 새_엔드포인트_추가: PROJECT.md에 경로 정보 추가 + config/endpoints.json 수정
    - 아키텍처_변경: PROJECT.md 즉시 업데이트 (구조, 의존성, 초기화 순서)
    - 함수_시그니처_변경: 영향받는 도구 정보 업데이트
    - 환경변수_추가/변경: PROJECT.md 및 README.md 업데이트
    - 의존성_추가/변경: package.json 확인 + PROJECT.md 문서화

  작업_프로세스_변경:
    - CLAUDE.md 업데이트: 작업 순서, 명령어, 검증 방법

업데이트_불필요:
  - 변수명_변경 (내부용)
  - 주석_수정
  - 포맷팅_변경
  - 작업_이력 (절대_남기지_마라)
```

## ⚙️ 개발 환경 설정

```bash
# 설치
npm i

# 환경변수 설정
cp .env.example .env
# .env 파일 수정:
# BASE_URL=실제_검색엔진_URL
# API_TOKEN=인증토큰 (있으면)
# HTTP_TIMEOUT=60000
# LOG_LEVEL=info

# 개발 실행 (stdin/stdout JSON-RPC)
npm start

# 테스트 (한 줄 JSON-RPC 요청)
echo '{"id":1,"method":"collections.list","params":{}}' | npm start
```

## 🚨 최종 체크리스트

```
✅ 1. 코드 변경 후 npm start로 기본 기능 테스트
✅ 2. 문서 업데이트 (중요_변경시: CLAUDE.md, PROJECT.md)
✅ 3. .commit_message.txt 작성
✅ 4. git add . && git commit -F .commit_message.txt
✅ 5. git push
✅ 6. ntfy 알림 전송 (절대_필수)
✅ 완료
```
