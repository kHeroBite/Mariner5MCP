# Mariner5 Java 클래스 분석 보고서

## 1. 현재 로드된 Command 클래스 현황

### 전체 로드된 Command 클래스 (43개)

#### 1.1 컬렉션 관리 (15개)
- CommandCollection
- CommandSchemaSetting
- CommandSortSetting
- CommandAdvancedSetting
- CommandIndexDBManagement
- CommandDBWatcher
- CommandDataSourceSetting
- CommandDBWatcherFilterSetting
- CommandIndexKeyList
- CommandDrama
- CommandTopicker
- CommandVectorSearchConfig
- CommandUnion
- CommandCollectionMonitor
- [미사용] CommandDataSourceSetting, CommandIndexKeyList, CommandDrama, CommandTopicker, CommandVectorSearchConfig, CommandUnion

#### 1.2 사전 관리 (12개)
- CommandUserDic
- CommandUserCnDic
- CommandUserSwDic
- CommandUserPreMorph
- CommandBannedWord
- CommandStopword
- CommandRedirect
- CommandRecommend
- CommandThesaurus
- CommandCategoryRanking
- CommandDocumentRanking
- CommandKeywordProfile

#### 1.3 검색 튜닝/프로파일 (4개)
- CommandProfile
- CommandSearchSimulation
- CommandSearchRequest
- CommandIntegratedInfo

#### 1.4 시스템 관리 (8개)
- CommandScheduleTask
- CommandServerSetting
- CommandBrokerSetting
- CommandLogSetting
- CommandSystemManagement
- CommandReport
- CommandStatus
- CommandGetDashBoardResource

#### 1.5 기존 (3개)
- CommandCollectionInfoServer
- CommandIndexTaskServer
- CommandSimulationQueryManagement

### java-wrapper-v2에서 실제 사용 중인 Command (22개)

**사용 중**: SchemaSetting, SortSetting, AdvancedSetting, IndexDBManagement, DBWatcher, UserDic, Stopword, BannedWord, Redirect, Thesaurus, Recommend, DocumentRanking, CategoryRanking, KeywordProfile, Profile, SystemManagement, ScheduleTask, ServerSetting, BrokerSetting, LogSetting, Report, GetDashBoardResource

## 2. 현재 로드된 DB Handler 클래스 현황

### 전체 로드된 DB Handler 클래스 (31개)

#### 2.1 핵심 관리 (6개)
- AuthorityDB
- ScheduleTaskDB
- AccountManagementDB
- WebManagerPropertiesDB
- IndexLogDB
- IndexingJobDB

#### 2.2 사전 관리 (10개)
- UserDicDB
- ThesaurusDB
- BannedWordDB
- StopwordDB
- RedirectDB
- RecommendDB
- CategoryRankingDB
- DocumentRankingDB
- KeywordProfileDB
- CategoryUpdateSettingDB

#### 2.3 컬렉션/모니터링 (4개)
- CollectionGroupDB
- TrendsSettingDB
- TrendsDeleteDB
- RecommendUpdateSettingDB

#### 2.4 로그/분석 (11개)
- FullQueryLogDB
- TimeoutQueryLogDB
- PopularQueryLogDB
- ZeitgeistQueryLogDB
- FailQueryLogDB
- JobLogDB
- ErrorLogDB
- NoticeLogDB
- MonitorAlarmLogDB
- QueryLogGroupDB
- RapidFreqIndexKeywordDB

## 3. 미사용 Command 클래스 (21개)

### 높은 활용 가능성 (권장)
1. **CommandUserCnDic** - 사용자 정의 유의어 (User CN Dictionary)
   - 현황: 로드됨, 미사용
   - 이유: 한글 처리 최적화 필요
   - 위험도: 낮음

2. **CommandUserSwDic** - 사용자 정의 SW Dictionary
   - 현황: 로드됨, 미사용
   - 이유: 전문용어/신조어 관리 필요
   - 위험도: 낮음

3. **CommandUserPreMorph** - 사용자 정의 사전 형태소 분석
   - 현황: 로드됨, 미사용
   - 이유: Pre-Morphological 분석 필요
   - 위험도: 낮음

4. **CommandDataSourceSetting** - 데이터 소스 설정
   - 현황: 로드됨, 미사용
   - 이유: 외부 DB 연동 필요
   - 위험도: 중간

5. **CommandIndexKeyList** - 인덱스 키 목록 관리
   - 현황: 로드됨, 미사용
   - 이유: 복합 인덱스 키 설정 필요
   - 위험도: 낮음

6. **CommandDBWatcher** (부분 사용)
   - 현황: 로드됨, 부분 사용
   - 이유: DB 모니터링/변경 감지 고급 기능 필요
   - 위험도: 중간

### 중간 활용 가능성
7. **CommandDrama** - 분산 컬렉션
   - 현황: 로드됨, 미사용
   - 이유: 대규모 데이터셋 분산 필요
   - 위험도: 높음 (복잡도 높음)

8. **CommandTopicker** - 상위 키워드 추출
   - 현황: 로드됨, 미사용
   - 이유: 트렌드 분석/인기 키워드 추출 필요
   - 위험도: 낮음

9. **CommandSearchSimulation** (부분 사용)
   - 현황: 로드됨, 부분 사용
   - 이유: 시뮬레이션 고급 기능 필요
   - 위험도: 중간

10. **CommandSearchRequest** (부분 사용)
    - 현황: 로드됨, 부분 사용
    - 이유: 커스텀 검색 요청 처리 필요
    - 위험도: 낮음

11. **CommandIntegratedInfo** - 통합 정보 조회
    - 현황: 로드됨, 미사용
    - 이유: 서버 전체 상태 조회 필요
    - 위험도: 낮음

### 낮은 활용 가능성 (선택적)
12. **CommandVectorSearchConfig** - 벡터 검색 설정
    - 현황: 로드됨, 미사용
    - 이유: 임베딩 기반 검색 필요
    - 위험도: 중간 (향후 기술)

13. **CommandUnion** - 컬렉션 합집합
    - 현황: 로드됨, 미사용
    - 이유: 다중 컬렉션 통합 검색 필요
    - 위험도: 높음 (복잡도 높음)

14. **CommandCollectionMonitor** - 컬렉션 모니터링
    - 현황: 로드됨, 미사용
    - 이유: 실시간 모니터링 필요
    - 위험도: 낮음

15. **CommandStatus** - 상태 조회
    - 현황: 로드됨, 미사용
    - 이유: 상세 상태 정보 필요
    - 위험도: 낮음

16. **CommandCollectionInfoServer** (기존)
    - 현황: 로드됨, 미사용
    - 이유: 레거시 API
    - 위험도: 높음

17. **CommandIndexTaskServer** (기존)
    - 현황: 로드됨, 미사용
    - 이유: 레거시 API
    - 위험도: 높음

18. **CommandSimulationQueryManagement** (기존)
    - 현황: 로드됨, 미사용
    - 이유: 레거시 API
    - 위험도: 높음

### 기타
19. **CommandCollectionInfoServer**, **CommandIndexTaskServer**, **CommandSimulationQueryManagement**
    - 상태: 레거시 API (호환성 유지용)

## 4. 미사용 DB Handler 클래스 (31개)

### 모든 DB Handler는 현재 로드되었으나 직접 사용되지 않음

**이유**: java-wrapper-v2에서 Command 클래스를 통해 간접적으로 사용
- DB Handler는 내부적으로 Command 클래스에 의해 사용
- 직접 API 노출 불필요 (래퍼 레이어를 통해 제공)

## 5. tools/modules에서 구현되지 않은 주요 기능

### 높은 우선순위 (즉시 구현 권장)
1. **User CN Dictionary (사용자 정의 유의어)**
   - 현황: java-wrapper-v2에서 미구현
   - 파급: 한글 검색 품질 향상
   - 위험도: 낮음
   - 예상 도구: dict.userCnDic.create, dict.userCnDic.list 등 (5개+)

2. **User Pre-Morph Dictionary**
   - 현황: java-wrapper-v2에서 미구현
   - 파급: 형태소 분석 전처리
   - 위험도: 낮음
   - 예상 도구: dict.preMorph.* (5개+)

3. **Data Source Setting**
   - 현황: java-wrapper-v2에서 미구현
   - 파급: 외부 DB 연동 필수
   - 위험도: 중간
   - 예상 도구: schema.datasource.* (5개+)

4. **DB Watcher 고급 기능**
   - 현황: 기본 기능만 구현
   - 파급: 실시간 데이터 동기화
   - 위험도: 중간
   - 예상 도구: collection.watcher.advanced.* (5개+)

### 중간 우선순위 (선택적)
5. **Collection Monitor (컬렉션 모니터링)**
   - 현황: 미구현
   - 파급: 실시간 모니터링
   - 위험도: 낮음
   - 예상 도구: monitoring.collection.* (8개+)

6. **Vector Search Config**
   - 현황: 미구현
   - 파급: AI 기반 검색
   - 위험도: 중간
   - 예상 도구: search.vector.* (5개+)

7. **Union Collections (컬렉션 합집합)**
   - 현황: 미구현
   - 파급: 다중 컬렉션 통합 검색
   - 위험도: 높음
   - 예상 도구: collections.union.* (5개+)

### 낮은 우선순위 (선택적)
8. **Drama Collections (분산 컬렉션)**
   - 현황: 미구현
   - 파급: 대용량 데이터 분산
   - 위험도: 높음 (복잡)
   - 예상 도구: collections.drama.* (5개+)

9. **Topicker (상위 키워드)**
   - 현황: 미구현
   - 파급: 트렌드 분석
   - 위험도: 낮음
   - 예상 도구: hotKeyword.topicker.* (5개+)

10. **User SW Dictionary**
    - 현황: 미구현
    - 파급: 전문용어/신조어 관리
    - 위험도: 낮음
    - 예상 도구: dict.userSwDic.* (5개+)

## 6. 권장 다음 단계

### Phase 1: 즉시 구현 (1주)
- User CN Dictionary 지원
- User Pre-Morph Dictionary 지원
- Data Source Setting 기본 기능

### Phase 2: 선택적 확장 (2-3주)
- DB Watcher 고급 기능
- Collection Monitor
- Vector Search Config 기초

### Phase 3: 고급 기능 (4주+)
- Union Collections
- Drama Collections (선택)
- Topicker/트렌드 분석

## 7. 참고: Mariner5 lib JAR 파일 분석

### m5_*.jar 파일 구성
- **m5_client.jar** (801KB): AdminServerClient, Command 클래스
- **m5_server.jar** (3.5MB): 서버 핵심 구현
- **m5_common.jar** (4.8MB): 공통 유틸리티, DB Handler
- **m5_core.jar** (3MB): 핵심 기능 (인덱싱, 검색)
- **m5_framework.jar** (299KB): 프레임워크
- **m5_extension.jar** (58KB): Extension 지원
- **m5_util.jar** (348KB): 유틸리티
- **m5_mgr.jar** (121KB): 관리자 기능
- **m5_recommend.jar** (118KB): 추천 엔진

### 사용 가능한 Command 클래스 패키지
- `com.diquest.ir5.client.command.*` - 모든 Command 클래스
- `com.diquest.ir5.client.command.collection.*` - 컬렉션 관련 (15개)
- `com.diquest.ir5.client.command.dictionary.*` - 사전 관련 (12개)
- `com.diquest.ir5.client.command.profile.*` - 프로파일 관련 (1개)

### 사용 가능한 DB Handler 클래스 패키지
- `com.diquest.ir5.common.database.handler.*` - 모든 DB Handler (31개)

## 8. 최종 요약 통계

| 항목 | 총계 | 로드 | 사용중 | 미사용 | 활용도 |
|------|------|------|--------|--------|--------|
| **Command 클래스** | 43 | 43 | 22 | 21 | 51% |
| **DB Handler 클래스** | 31 | 31 | 0* | 31 | 0%* |
| **MCP 도구 모듈** | 17 | 17 | 17 | 0 | 100% |
| **MCP 도구 수** | 96+ | 96+ | 96+ | - | 100% |

*DB Handler는 내부 사용 (Command 클래스 통해 간접 사용)

---

## 권장 구현 우선순위 (HIGH → LOW)

### HIGH 우선순위 (1-2주 내 구현)
1. CommandUserCnDic - User CN Dictionary (한글 유의어)
2. CommandUserPreMorph - Pre-Morph Dictionary
3. CommandDataSourceSetting - Data Source 설정

### MEDIUM 우선순위 (2-3주)
4. CommandDBWatcher (고급) - DB 모니터링
5. CommandCollectionMonitor - Collection 모니터링
6. CommandVectorSearchConfig - Vector Search (기초)

### LOW 우선순위 (선택적)
7. CommandDrama - 분산 컬렉션
8. CommandUnion - 컬렉션 합집합
9. CommandUserSwDic - SW Dictionary
10. CommandTopicker - 상위 키워드

