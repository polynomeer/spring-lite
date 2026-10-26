# spring-lite Lab 구현 계획서

> 상태: 진행 중 · 작성일 2026-10-26
> 기획: [spring-lite Lab 리디자인 기획안](spring-lite-lab-redesign.md)

기획안의 화면(01~11)을 실제로 동작하게 만드는 순서와 작업 단위를 정리한다. 단계마다 **무엇을 만들고, 어디를 고치고, 무엇으로 검증하고, 어떻게 커밋하는지**를 적는다. 각 단계가 끝나면 맨 아래 진행 기록을 갱신한다.

## 원칙

- **모듈 의존 방향을 지킨다.** 새 의존은 `core ← context ← aop ← tx`, `jdbc`, `web`, `boot` 방향으로만 추가한다([ADR 0001](../adr/0001-multi-module-architecture.md)).
- **외부 라이브러리를 추가하지 않는다.** 백엔드는 JDK만, 프론트엔드는 이미 쓰는 React 18 + Vite 범위 안에서 해결한다.
- **관측은 동작을 바꾸지 않는다.** 이벤트 수집이 꺼져 있으면 프레임워크는 지금과 똑같이 동작하고, 켜져 있어도 결과는 같다.
- **커밋 하나에 의도 하나.** 기능 커밋에는 구현, 테스트, 해당 모듈 `README.md` 역할 목록 갱신을 함께 담는다. 백로그·모듈 맵 갱신은 별도 `docs:` 커밋으로 나눈다.
- **기존 화면과 API를 깨지 않는다.** `/lab/run/trace`와 현재 `visual-lab-app` 화면은 새 기능이 대체할 때까지 그대로 둔다.

## 단계 개요

| 단계 | 이름 | 범위 | 선행 |
| --- | --- | --- | --- |
| 1 | 관측 기반 | core · tx · jdbc · web · example-app | — |
| 2 | 테마와 리플레이 화면 | visual-lab-app | 1 |
| 3 | DB 스냅샷과 예측 루프 | example-app · visual-lab-app | 2 |
| 4 | 시나리오 DSL과 트랜잭션 샌드박스 | example-app · visual-lab-app | 3 |
| 5 | 빈 그래프와 생명주기 | context · example-app · visual-lab-app | 1 |
| 6 | 함정 실험실 | example-app · visual-lab-app | 2, 4 |
| 7 | 학습 지도와 복습 노트 | visual-lab-app | 3 |
| 8 | 비교 확장 | comparison 앱 2개 · visual-lab-app | 1, 2 |
| 9 | 고도화: 구현 워크스페이스, What-if 스위치 | tx · context · aop · visual-lab-app | 2, 4 |

---

## 1단계 · 관측 기반

**목표**: 요청 하나가 프레임워크를 지나는 동안 일어난 일을 순서 있는 이벤트 목록으로 얻는다. 리플레이, 상태 인스펙터, 예측 루프, 비교가 모두 이 목록을 읽는다.

### 설계

- `spring-lite-core`에 `lite.spring.core.trace` 패키지를 만든다.
  - `TraceLayer`: `WEB`, `SERVICE`, `TX`, `JDBC`, `CONTAINER`, `AOP`
  - `TraceEvent`(record): 순번, 계층, 종류, 마커, 설명, 스레드, 그 시점의 호출 스택, 속성(`Map<String, String>`)
  - `TraceRecorder`(final 유틸): 스레드마다 하나의 수집 세션을 둔다. 세션이 없으면 모든 호출이 아무 일도 하지 않는다. `start()`로 세션을 열고 `close()`로 닫으며, 바깥 세션이 있었다면 닫을 때 되돌린다. `pushFrame`/`popFrame`으로 호출 스택을 관리한다.
- 수집 지점은 각 모듈의 기존 코드 안에 둔다. 새 확장 포인트나 빈 등록이 필요 없다.

| 모듈 | 위치 | 이벤트 |
| --- | --- | --- |
| tx | `TransactionManager` | `begin`, `join`, `suspend`, `resume`, `commit`, `rollback`, `mark-rollback-only` · 속성 `tx`, `depth`, `active`, `readOnly`, `rollbackOnly` |
| tx | `TransactionalBeanPostProcessor` 인터셉터 | 프록시 진입/종료 프레임, `invoke`, `return`, `throw` |
| jdbc | `JdbcTemplate` | `update`, `query`, `batch` · 마커는 SQL 첫 단어, 속성 `sql`, `rows`, `tx` |
| web | `DispatcherServlet` | `request`, `handler`, `response` · 속성 `method`, `path`, `status` |
| example-app | `VisualLabTraceController` | `POST /lab/run/events`: 기존 시나리오를 세션 안에서 실행하고 `{trace, events}` 반환 |

- 트랜잭션 식별자: `TransactionManager`가 물리 트랜잭션마다 `tx#1`, `tx#2`처럼 이름을 붙이고 `currentTransactionName()`으로 노출한다. JDBC 이벤트는 이 이름으로 어느 트랜잭션에서 실행됐는지 표시한다.

### 검증

- `TraceRecorderTest`: 세션이 없을 때 무시, 순번·스택 기록, 세션 중첩과 복원
- `TransactionManagerTest`: REQUIRED 참여, REQUIRES_NEW의 suspend → begin → commit → resume 순서, 참여 중 롤백의 mark-rollback-only
- `TransactionalBeanPostProcessorTest`: 프록시 호출이 프레임과 invoke/return 이벤트를 남김
- `JdbcTemplateTest`: SQL 이벤트와 트랜잭션 이름
- `DispatcherServletTest`: request/handler/response 이벤트
- `ExampleApplicationWebTest`: `/lab/run/events` rollback 시나리오에 begin → insert → rollback 순서가 있음
- `./gradlew test` 전체 통과

### 커밋

1. `feat(core): add thread-bound trace recorder`
2. `feat(tx): record transaction lifecycle trace events`
3. `feat(jdbc): record sql trace events`
4. `feat(web): record dispatch trace events`
5. `feat(example-app): expose lab event trace endpoint`
6. `docs(codex): note trace recorder in module map`

---

## 2단계 · 테마와 리플레이 화면

**목표**: 시안 02(요청 리플레이)를 `visual-lab-app`에서 동작하게 한다.

- 디자인 토큰을 CSS 변수로 옮긴다. `:root`에 라이트, `[data-theme="dark"]`에 Trace Ink 값을 두고, 헤더에 테마 전환을 둔다. 선택은 `localStorage`에 저장한다.
- `/lab/run/events` 클라이언트와 타입(`TraceEventView`)을 추가한다.
- 리플레이 화면: 이벤트 스크러버(이전·재생·다음, 키보드 ←/→/스페이스), 콜스택, 상태 인스펙터(tx, depth, rollbackOnly), 이벤트 로그
- 정적 모드용 샘플 이벤트를 `lab-trace-data`에 추가해 서버 없이도 화면이 뜨게 한다.
- 검증: `npm run build`(타입 체크 포함), 브라우저에서 라이트/다크 확인
- 커밋: `feat(visual-lab): add theme tokens`, `feat(visual-lab): add event replay view`

## 3단계 · DB 스냅샷과 예측 루프

- `TraceRecorder`에 스냅샷 훅을 두고, example-app이 지정한 이벤트 직후 "트랜잭션 커넥션"과 "별도 커넥션"의 행 수를 기록한다.
- 리플레이에 DB 스냅샷 패널과 "다음 이벤트 예측" 프롬프트를 붙인다. 예측 결과는 `localStorage`에 남긴다(7단계 복습 노트의 원천).
- 검증: rollback 시나리오에서 insert 직후 트랜잭션 커넥션 +1, 별도 커넥션 0
- 커밋: `feat(example-app): capture db snapshots in lab traces`, `feat(visual-lab): add prediction prompt to replay`

## 4단계 · 시나리오 DSL과 트랜잭션 샌드박스

- `POST /lab/sandbox/run`: 호출 트리(JSON)를 받는다. 노드는 메서드 이름, 전파(REQUIRED/REQUIRES_NEW), SQL 삽입 대상 테이블, 예외 여부, 바깥에서 catch할지 여부를 가진다. example-app 안의 범용 `SandboxService`가 실제 `@Transactional` 프록시를 거쳐 트리를 실행한다.
- 응답은 이벤트 목록과 테이블별 최종 행 수다.
- 화면 04: 호출 구조 편집기, 예측 객관식, 결과 타임라인
- 검증: 기획안의 예제(바깥 REQUIRED + 안쪽 REQUIRES_NEW 예외 + catch → orders 1행, audit_log 0행)를 통합 테스트로 고정
- 커밋: `feat(example-app): add transactional sandbox runner`, `feat(visual-lab): add transaction sandbox view`

## 5단계 · 빈 그래프와 생명주기

- `AnnotationConfigApplicationContext`가 refresh 중 빈마다 `CONTAINER` 이벤트(정의 등록, 생성자 주입 대상, Aware, 초기화, 후처리기별 교체 여부)를 남긴다. 기동 시점에는 세션이 없으므로, 컨텍스트가 마지막 refresh 이벤트를 보관하는 읽기 전용 조회를 둔다.
- `BeanRuntimeDescriptor`에 의존 빈 이름 목록을 더한다.
- 화면 03, 08
- 커밋: `feat(context): record bean lifecycle trace events`, `feat(visual-lab): add bean graph and lifecycle views`

## 6단계 · 함정 실험실

- example-app에 실험별 "망가진 버전"과 "고친 버전" 시나리오를 둔다(self-invocation, checked 예외, final 메서드, 순환 참조, prototype 주입, rollback-only, 새 스레드, `@Valid` 누락).
- 화면 05: 재현 → 리플레이 → 고친 버전 실행
- 커밋: 실험 2~3개씩 묶어 `feat(example-app): add pitfall scenarios for …`, 마지막에 `feat(visual-lab): add pitfall lab view`

## 7단계 · 학습 지도와 복습 노트

- 트랙·단계 메타데이터(정적 JSON), 진행도와 예측 기록(`localStorage`)
- 화면 01, 11: 이어서 하기, 트랙 그리드, 오늘의 복습(간격 반복), 약한 개념
- 커밋: `feat(visual-lab): add learning map`, `feat(visual-lab): add review notes`

## 8단계 · 비교 확장

- `comparison-spring-boot-app`이 같은 이벤트 스키마를 내보내는 어댑터(`TransactionSynchronization`, `HandlerInterceptor` 기반)를 둔다. `comparison-spring-lite-app`도 함께 맞춘다.
- 화면 07: 실행 경로 정렬(단계 이름 정규화), 한쪽에만 있는 단계 표시
- 커밋: `feat(comparison): emit normalized trace events`, `feat(visual-lab): align dual runtime traces`

## 9단계 · 고도화

- What-if 스위치: tx·context·aop에 실험용 시스템 프로퍼티 플래그(기본값은 언제나 원래 동작). 화면 10.
- 구현 워크스페이스: 과제 메타데이터, 테스트 결과 표시, 내 구현과 기준 구현 이벤트 정렬. 화면 09. 학습자 코드 실행 방식은 기획안 8절의 열린 질문을 먼저 정한다.

---

## 진행 기록

| 단계 | 상태 | 커밋 | 메모 |
| --- | --- | --- | --- |
| 1 | 완료 | `7f47837`, `3cc999e`, `dd7d1ab`, `078cebb`, `42ad1f4` | `TraceRecorder`(core), tx·jdbc·web 수집, `POST /lab/run/events`. 트랜잭션 프록시 진입은 AOP 계층, 메서드 반환·예외는 SERVICE 계층으로 기록한다. |
| 2 | 다음 | | 테마 토큰과 리플레이 화면 |
