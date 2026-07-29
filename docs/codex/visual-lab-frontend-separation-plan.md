# Visual Lab Frontend Separation Plan

이 문서는 현재 `visual-lab`의 정적 HTML 기반 학습 페이지를, 더 풍부한 UI와 실제 서버 연동이 가능한 분리형 프론트엔드 구조로 발전시키기 위한 기획안이다.

목표는 "프론트엔드를 분리한다" 자체가 아니라, 아래 두 가지를 동시에 만족하는 것이다.

- 학습용 시뮬레이션 UI를 더 동적으로 만들 수 있어야 한다.
- 실제 `spring-lite` 서버 또는 비교 대상 Spring Boot 서버와 연동해 실행 결과를 시각화할 수 있어야 한다.

## 1. 현재 기준선

현재 `visual-lab`은 아래 특성을 가진다.

- `visual-lab/*.html` 파일로 구성된 정적 페이지다.
- 브라우저 안에서 미리 정의한 시나리오를 계산해 `timeline`, `lane`, `summary`, `snapshot`을 렌더한다.
- 실행 중인 서버와 데이터를 주고받는 `fetch`, `WebSocket`, `SSE` 기반 기능은 없다.
- 실제 서버 실행은 별도로 가능하다.
  - `./gradlew :example-app:run`
  - `SpringLiteApplication.run(...)`을 통해 내장 서버를 띄운다.

현재 구조의 강점은 단순함이다.

- 빌드가 필요 없다.
- 파일만 열어도 동작한다.
- 책/문서와 같이 배포하기 쉽다.

현재 구조의 한계도 분명하다.

- 실제 런타임 결과와 시뮬레이션 결과가 분리되어 있다.
- UI 상태, 시나리오, 코드 매핑, 응답 결과가 커질수록 HTML 단일 파일 구조가 급격히 불편해진다.
- 공통 컴포넌트, 상태 관리, 재사용 가능한 시각화 모듈을 만들기 어렵다.
- "실제 서버 trace 보기", "비교 대상 서버 2개 동시 연결", "실행 기록 저장/재생" 같은 기능을 붙이기 어렵다.

## 2. 왜 프론트엔드를 분리하는가

프론트엔드 분리는 아래 요구가 생길 때 가치가 커진다.

### 2.1 더 풍부한 동적 UI

- 여러 패널의 상태를 동시에 동기화
- 입력값 변경에 따른 즉시 반응형 시각화
- 공통 타임라인/레인/스냅샷 컴포넌트 재사용
- 다크모드가 아니라도 더 복합적인 레이아웃, 그래프, 필터링, 북마크, 비교 패널 제공

### 2.2 실제 서버 연동

- 브라우저에서 바로 `example-app` API 호출
- 서버가 반환한 trace/event를 그대로 timeline에 렌더
- `spring-lite`와 Spring Boot 서버를 같은 화면에서 나란히 비교
- 요청 기록 저장, 재생, diff 비교

### 2.3 유지보수성

- HTML 단일 파일 대신 화면/컴포넌트/상태/연동 계층 분리
- 테스트 가능한 UI 구조 확보
- 확장 기능을 페이지별이 아니라 공용 컴포넌트로 축적 가능

## 3. 목표 상태

분리 이후 `visual-lab`은 아래 두 모드로 동작하는 것이 가장 바람직하다.

### Mode A. Static Simulation Mode

현재와 같은 학습용 시뮬레이션 모드다.

- 서버 없이도 동작
- 책/문서 독자에게 배포하기 쉬움
- 최소 환경에서 재현 가능

### Mode B. Live Runtime Mode

실제 서버와 연동하는 실행 모드다.

- `spring-lite example-app`
- 비교용 Spring Boot 앱
- trace/debug endpoint
- live request / replay / diff

핵심은 둘 중 하나를 버리는 것이 아니라, **정적 시뮬레이션 모드와 실제 런타임 연동 모드를 모두 지원하는 것**이다.

## 4. 권장 아키텍처

## 4.1 저장소 구조

권장 구조는 아래와 같다.

```text
spring-lite/
  visual-lab-app/              # 분리된 프론트엔드 앱
    src/
      app/
      components/
      features/
      lib/
      pages/
      styles/
    public/
  visual-lab/                  # 현재 정적 버전 또는 export 결과
  spring-lite-lab-api/         # 선택적: 실험용 trace/debug API 모듈
  example-app/
  comparison-spring-lite-app/
  comparison-spring-boot-app/
```

권장 방향:

- `visual-lab-app`은 실제 개발용 프론트엔드
- `visual-lab/`은 정적 export 산출물 또는 fallback 정적 버전

즉, 개발은 앱에서 하고 배포는 정적으로도 가능하게 가져가는 구조가 좋다.

## 4.2 계층 분리

프론트엔드는 최소 아래 계층으로 나누는 것이 좋다.

### UI Component Layer

- timeline
- lane
- snapshot card
- metric panel
- request form
- code reference rail

### Feature Layer

- playground feature
- container-lab feature
- example-flow feature
- comparison-dashboard feature

### Data Layer

- static scenario provider
- live API client
- trace normalizer
- comparison adapter

### State Layer

- selected scenario
- runtime mode (`static` / `live`)
- selected backend target (`spring-lite` / `spring-boot`)
- last request / trace / error state

## 4.3 백엔드 연동 구조

권장 연동 구조는 다음 둘 중 하나다.

### Option 1. 기존 example-app / comparison app에 lab endpoint 추가

장점:

- 모듈 수가 늘지 않는다.
- 실제 애플리케이션 컨텍스트 위에서 trace를 수집할 수 있다.

단점:

- 학습용 API와 예제 앱 API가 섞인다.
- 운영 경로와 학습 경로의 관심사가 분리되지 않는다.

### Option 2. `spring-lite-lab-api` 별도 모듈 추가

장점:

- 학습/디버그/시각화용 기능을 명확히 분리할 수 있다.
- 여러 앱을 공통 규약으로 연결하기 쉽다.

단점:

- 설계가 조금 더 커진다.
- 초기 구현 비용이 증가한다.

현재 저장소 성격상 **Option 2가 장기적으로 더 적합**하다. 다만 첫 구현은 Option 1로 시작하고, 안정화 후 별도 모듈로 분리하는 전략도 현실적이다.

## 5. 권장 프론트엔드 기술 선택

목표가 "학습용 UI + 동적 시각화 + 서버 연동 + 정적 배포 가능성"이라면 아래 조합이 가장 무난하다.

### 권장안

- `React`
- `TypeScript`
- `Vite`
- 상태 관리는 우선 React 기본 상태 + context
- 시각화는 직접 렌더링 + 필요 시 경량 chart 라이브러리

선정 이유:

- 현재 페이지들은 모두 상호작용이 많고 상태 중심이다.
- `timeline`, `lane`, `snapshot`, `metric`, `reference highlight`는 컴포넌트화 이점이 크다.
- 정적 빌드와 로컬 개발 서버가 모두 쉽다.
- 이후 테스트, story-like preview, mock/live 전환이 수월하다.

### 과한 선택으로 보이는 것

- 초기에 Next.js 같은 풀스택 프레임워크
- 무거운 전역 상태 라이브러리
- 거대한 차트 프레임워크

현재는 "서버 렌더링"보다 "브라우저 기반 인터랙션"이 본질이므로, 우선은 Vite 기반 SPA가 적합하다.

## 6. Live Runtime Mode에서 필요한 백엔드 기능

프론트엔드를 분리해도 백엔드 지원이 없으면 실제 연동 모드는 의미가 작다. 아래 API/기능이 필요하다.

### 6.1 Request Runner API

예:

- `POST /lab/run/example-flow`
- `POST /lab/run/playground/mvc`
- `POST /lab/run/playground/tx`

역할:

- 브라우저 입력을 서버 시나리오 실행 요청으로 변환
- 실행 결과와 trace를 한 번에 반환

### 6.2 Trace API

응답 예시 구조:

```json
{
  "scenario": "create-order",
  "status": 200,
  "timeline": [],
  "lanes": [],
  "metrics": {},
  "references": []
}
```

포함되어야 할 정보:

- 단계별 이벤트
- MVC / Service / Tx / JDBC 레인 데이터
- 최종 메트릭
- 관련 코드/테스트 reference id

### 6.3 Container Introspection API

예:

- `GET /lab/container/beans`
- `GET /lab/container/bootstrap-summary`
- `GET /lab/container/handler-mappings`

역할:

- 실제 등록된 bean 목록
- proxy 여부
- infra bean 구성
- handler mapping 정보 노출

### 6.4 Comparison API

예:

- `POST /lab/compare/di`
- `POST /lab/compare/mvc`
- `POST /lab/compare/tx`

역할:

- `spring-lite` 결과와 Spring Boot 결과를 공통 포맷으로 정규화
- 차이점만 뽑아 UI가 바로 비교 가능하게 제공

### 6.5 Streaming Trace

후속 확장으로 아래도 고려할 수 있다.

- `Server-Sent Events`
- `WebSocket`

용도:

- 요청 실행 중 단계별 실시간 timeline 업데이트
- 서버 시작/실행/완료 상태 스트리밍

이건 초기 단계에 필수는 아니고, replay보다 live feeling을 강화할 때 가치가 있다.

## 7. UI 측면에서 추가하면 좋은 기능

프론트엔드를 분리할 가치가 가장 크게 드러나는 부분이다.

### 7.1 Runtime Mode Toggle

- `Static Simulation`
- `Live Spring Lite`
- `Live Spring Boot`

### 7.2 Trace Replay

- 실제 실행 결과를 단계별로 재생
- speed control
- pause / step / resume

### 7.3 Dual Comparison View

- 좌측 `spring-lite`
- 우측 Spring Boot
- 같은 요청을 동시에 실행하고 단계별 diff 표시

### 7.4 Reference Sync

- 현재 선택된 step과 관련된 코드/문서/테스트 자동 하이라이트
- 클릭 시 관련 파일 경로와 설명 표시

### 7.5 Scenario Presets

- malformed JSON
- validation failure
- rollback
- missing route
- nested transaction

### 7.6 Saved Sessions

- 내가 실행한 시나리오 저장
- 같은 시나리오를 다시 재생
- 책/강의용 데모 링크 생성

### 7.7 Instructor Mode

- 특정 step 강조
- 설명 패널 고정
- 발표/강의용 전체화면 모드

## 8. 단계별 구현 전략

## Phase 1. Frontend App Skeleton

목표:

- `visual-lab-app` 분리
- 현재 정적 페이지를 React/TypeScript 컴포넌트로 옮김

산출물:

- 라우팅 구조
- 공통 layout
- timeline / lane / snapshot 공통 컴포넌트
- 현재 정적 시나리오를 앱 상태로 재구성

완료 기준:

- 서버 없이 현재 기능을 거의 동일하게 재현한다.

## Phase 2. Static And Live Mode Split

목표:

- static scenario provider와 live API provider 분리

산출물:

- runtime mode toggle
- API client abstraction
- mock/live adapter

완료 기준:

- 같은 UI가 static 데이터와 live 데이터 둘 다 렌더할 수 있다.

## Phase 3. Example App Live Integration

목표:

- `example-flow-lab`을 실제 서버 연동형으로 전환

산출물:

- `/lab/run/example-flow`
- `/lab/trace/example-flow`
- 요청/응답/trace 렌더링

완료 기준:

- 브라우저에서 버튼 클릭으로 실제 요청 실행과 trace 시각화가 가능하다.

## Phase 4. Playground Live Integration

목표:

- AOP/Tx/MVC 작은 루프를 실제 런타임 trace로 시각화

산출물:

- interceptor / dispatcher trace endpoint
- live snapshot / lane / timeline

완료 기준:

- playground가 단순 시뮬레이터를 넘어 실제 런타임 디버거 성격을 갖는다.

## Phase 5. Container Introspection

목표:

- container-lab을 실제 상태 탐색기로 확장

산출물:

- bean graph
- handler mapping list
- infra bean summary
- proxy exposure visualization

완료 기준:

- 설정 조합이 아니라 실제 실행된 컨텍스트 상태를 탐색할 수 있다.

## Phase 6. Spring Lite vs Spring Boot Live Compare

목표:

- 두 서버를 동시에 실행해 결과 비교

산출물:

- dual-target runner
- normalized comparison schema
- diff UI

완료 기준:

- 같은 시나리오에 대해 두 런타임 결과를 나란히 재생하고 비교할 수 있다.

## 9. 기술적 리스크와 대응

### 리스크 1. 학습용 UI가 지나치게 복잡해질 수 있음

대응:

- Phase 1에서 현재 static 기능 parity를 먼저 확보
- 새 UI는 기존 mental model을 깨지 않도록 유지

### 리스크 2. trace 포맷이 페이지마다 제각각이 될 수 있음

대응:

- 공통 `LabTrace` 스키마를 먼저 정의
- page-specific field는 extension field로 분리

### 리스크 3. 학습용 endpoint가 예제 앱을 오염시킬 수 있음

대응:

- `lab mode` 전용 endpoint namespace 분리
- 장기적으로 별도 `spring-lite-lab-api` 모듈 검토

### 리스크 4. Spring Boot 비교 모드의 유지 비용

대응:

- 처음부터 모든 기능을 live compare로 만들지 말고
- 먼저 `example-flow`와 `comparison dashboard` 일부 시나리오만 연결

## 10. 최종 권고안

현재 `visual-lab`은 정적 학습 도구로서 이미 가치가 크다. 따라서 바로 폐기하거나 전면 교체하는 접근은 좋지 않다.

가장 좋은 방향은 아래다.

1. 현재 정적 `visual-lab`을 reference/fallback 버전으로 유지한다.
2. 별도 `visual-lab-app` 프론트엔드를 추가한다.
3. 1차 목표는 "현재 정적 기능 parity 확보"다.
4. 2차 목표는 `example-flow-lab`의 실제 서버 연동이다.
5. 이후 `playground`, `container-lab`, `comparison dashboard` 순으로 live mode를 확장한다.

즉, 권장 전략은 **정적 버전을 버리지 않고, 분리형 프론트엔드를 추가해 static mode와 live mode를 함께 가져가는 점진적 확장**이다.

## 11. 추천 다음 작업

이 기획안을 실제 구현으로 옮길 때 가장 먼저 할 일은 아래 세 가지다.

1. `visual-lab-app` 디렉터리와 기술 스택 확정
2. `LabTrace` 공통 응답 스키마 초안 작성
3. `example-flow-lab` live mode를 위한 최소 endpoint 설계
