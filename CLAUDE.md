# CLAUDE.md - mariner5-mcp AI 작업 지침서

이 문서는 Claude Code가 mariner5-mcp 프로젝트에서 작업할 때 필요한 모든 정보를 포함합니다.

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
  서버_관리: echo '{"id":4,"method":"admin.listUsers","params":{}}' | npm start
  확장기능: echo '{"id":5,"method":"ext.templates","params":{}}' | npm start

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
      출력_규칙: ⭐ 중요
        - 성공: "테스트 완료. 응답 정상." (1줄)
        - 실패: "테스트 실패: JSON 파싱 에러." (1줄만)
        - 중간 과정 설명 금지

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
      출력_규칙: "커밋 메시지 준비 완료." (1줄)

    7_git_작업:
      명령어:
        - set GIT_TERMINAL_PROMPT=0
        - git add .
        - git -c core.editor=true commit -F .commit_message.txt
        - git push
      커밋_내용: 코드 + 문서 모두 포함
      출력_규칙: ⭐ 절대_엄수
        - 커밋_성공: "커밋 완료. 해시: f4b27e6." (1줄)
        - 푸시_성공: "푸시 완료. origin/master 동기화." (1줄)
        - 로그_금지: git log 출력 금지
        - 상태_금지: git status 상세 정보 금지

    8_ntfy_알림:
      참조: [공통_명령어_참조_ntfy_알림]
      필수: 절대_필수_절대_빠뜨리지_말것
      실행_시점: 모든_작업_완료_후
      출력_규칙: "알림 전송 완료." (1줄)

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
  출력_토큰_제한: 최대_500토큰 (약 400단어, 절대_엄수) ⭐ 중요
  출력_형식:
    - 간단히_설명: 1~2줄로 무엇을 했는지만 (성공/실패 + 핵심 수치 1개)
    - 예시: "작업 완료. 3개 파일 수정. 커밋 f4b27e6."
    - 예시: "빌드 실패: 5개 타입 에러 발생."
  금지_절대:
    - 빌드_로그_상세: "완료" 한 줄만 가능
    - 소스_코드_변경: diff, 코드 블록 절대 금지
    - 상세한_진행_과정: 중간 단계 설명 금지
    - 중복_설명: 같은 내용 반복 금지
  트랜잭션: 처음부터 끝까지 원자적 완료 (git commit/ntfy 중단 금지)
  오류: 자동 수정 및 재시도 (오류 없어질 때까지 반복)

콘솔_출력_금지: ⭐ 토큰 절약의 핵심
  절대_금지:
    - 빌드_로그: "빌드 완료 (오류 0개)" 한 줄만 / 상세 로그 금지
    - 소스_코드: diff, 코드 블록 절대 금지
    - 에러_메시지: 오류명만 표시 / 스택 트레이스 금지
    - 진행_설명: "~를 시작합니다", "~를 확인합니다", "수정 중입니다" 금지
    - 중간_단계: 각 단계별 "1단계 실행 중...", "2단계 대기 중..." 금지
    - 시행착오: 여러 번 시도 과정 전부 금지
    - 상세_정보: 상세한 진행 과정, 이유, 배경 설명 금지

  허용_출력:
    - 최종_결과: "작업 완료. 커밋 f4b27e6. 푸시 성공." (1줄)
    - 최종_결과: "빌드 실패: CS0246 (5개 에러)." (1줄)
    - 치명적_오류: "FATAL: git 저장소 손상 (해결 불가)." (1줄)

  금지_출력_예시:
    - ❌ "npm install 실행 중..." / ✅ 언급 금지
    - ❌ "파일 src/server.js 수정됨" / ✅ 최종 결과만
    - ❌ "오류 발생: [상세 스택트레이스 20줄]" / ✅ "오류: E_TYPE"만
    - ❌ "1단계: 파일 읽음, 2단계: 파일 수정, 3단계: 파일 저장" / ✅ 최종 결과만

  이유: 토큰 절약 + 핵심 정보만 전달 + 8192 토큰 초과 방지

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
  프로젝트명: search-mcp-node (v3.0)
  타입: Node.js MCP 서버 (stdin/stdout JSON-RPC)
  버전: 3.0.0
  런타임: Node.js (ES Module)
  총_파일수: 17개
  구성:
    - 핵심_서버: 3개 (server.js, http.js, utils.js)
    - 멀티_인스턴스: 2개 (instance-manager.js, connection-manager.js) ⭐ 신규
    - Java_브릿지: 2개 (java-bridge.js, java-wrapper.js)
    - 도구_레지스트리: 1개 (tools/index.js)
    - 도구_모듈: 11개 (collections, columns, queries, dict, index, server, logs, sim, ext, codegen, search)
    - 설정: 1개 (config/endpoints.json)
    - 의존성: 4개 (package.json, package-lock.json, .env, uuid)
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
