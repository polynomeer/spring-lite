# visual-lab-app

`visual-lab-app`은 기존 `visual-lab/*.html` 정적 페이지를 분리형 프론트엔드로 옮기기 위한 시작 스캐폴드다.

현재 단계의 목적은 다음과 같다.

- React + TypeScript + Vite 기반 독립 앱 구조 확보
- 기존 학습 흐름을 컴포넌트 기반 구조로 옮길 준비
- 향후 `static simulation mode`와 `live runtime mode`를 함께 지원할 기반 마련

## 현재 포함 범위

- 최소 실행 가능한 Vite 앱 설정
- `Runtime Mode` 토글과 명시적 trace 실행 버튼
- `한국어 / English` UI 전환
- playground, container, example-flow, comparison 전체를 고를 수 있는 공통 trace explorer
- metrics, steps, lanes, snapshot, references를 공통 스키마로 렌더링하는 trace UI
- `example-flow`, `container`, `playground` live runtime 연동
- Spring Lite와 Spring Boot DI 결과를 나란히 조회하는 dual-runtime comparison
- 학습 지도(`#/`, `#/map`, 홈): 트랙 8개(core~test)×단계 4개(개념·구현·실험·비교) 메타데이터(`src/lib/learning-tracks.json`), 트랙별 진행 막대, 이어서 하기. 실험 단계는 리플레이·샌드박스·빈 그래프·함정 실험실이 남기는 활동 신호로 자동 완료되고, 읽기·구현 단계는 직접 완료 표시. 진행도는 브라우저 `localStorage`(`spring-lite-lab-progress`)
- 복습 노트(`#/review`): 틀린 예측으로 만든 복습 카드(답을 떠올린 뒤 펼치고, 기억 여부에 따라 1·3·7·14·30일 간격 반복, 일정은 `spring-lite-lab-reviews`), 틀린 예측과 연결된 약한 개념과 다시 볼 실험 링크, "틀린 것만" 필터가 있는 예측 기록 표
- 라이트(기본)·다크(Trace Ink) 테마 토큰(`src/theme/theme.css`, `--lab-*`)과 상단 바 테마 전환, 선택은 브라우저에 저장
- 요청 리플레이(`#/replay`): `POST /lab/run/events`의 실제 프레임워크 이벤트를 스크러버(←/→/스페이스), 콜스택, 이벤트 상세, 트랜잭션 상태 인스펙터, 이벤트 로그로 재생. 서버 없이 쓰는 정적 샘플(`replay-samples.ts`) 포함
- 리플레이 DB 스냅샷(쓰기·트랜잭션 완료 직후 트랜잭션 커넥션과 다른 커넥션의 행 수)과 예측 루프(트랜잭션 결말·메서드 반환/예외를 먼저 고르고 확인, 기록은 브라우저 `localStorage`)
- 트랜잭션 샌드박스(`#/sandbox`): 메서드·전파·insert/call/throw·catch로 호출 구조를 편집하고, 테이블별 최종 행 수를 예측한 뒤 `POST /lab/sandbox/run`으로 실행해 판정, 트랜잭션 타임라인(보류·재개 포함), 트랜잭션별 결말을 보여줌
- 빈 그래프(`#/beans`): `GET /lab/container/graph`의 빈과 주입 관계를 계층 그래프로 그리고(프록시 강조, 앱 빈/프레임워크 빈 필터), 생성 순서를 재생하며, 선택한 빈의 생애 단계와 BeanPostProcessor 체인(교체 여부)을 보여줌. 정적 샘플(`container-sample.ts`) 포함
- 함정 실험실(`#/pitfalls`): 실험 8종(self-invocation, final 메서드, checked 예외, 새 스레드, rollback-only, prototype 주입, 생성자 순환 참조, `@Valid` 누락)을 계층별로 고르고, 망가진 버전과 고친 버전을 example-app에서 실제로 실행해 결과·관찰 사실·이벤트를 나란히 비교. 원인과 고치는 법, 실제 Spring과의 차이를 함께 보여줌

## 실행 예정 방법

의존성을 설치한 뒤 아래처럼 실행한다.

```bash
npm install
npm run dev
```

기본 개발 서버 포트는 `4173`이다.

루트에서 백엔드와 함께 올리려면 아래 스크립트를 사용해도 된다.

```bash
./scripts/run_visual_lab_stack.sh
```

기본 포트가 사용 중이면 스크립트가 다음 사용 가능한 포트를 자동으로 선택한다. 시작되는 구성 요소와 기본 포트는 다음과 같다.

| 구성 요소 | 기본 포트 | 역할 |
| --- | ---: | --- |
| `example-app` | `8080` | Visual Lab의 일반 live trace API |
| `comparison-spring-lite-app` | `18081` | Spring Lite DI comparison trace API |
| `comparison-spring-boot-app` | `18082` | Spring Boot DI comparison trace API |
| `visual-lab-app` | `4173` | 브라우저 UI와 개발 프록시 |

프론트는 `/lab`, `/compare-lite`, `/compare-boot` 상대 경로를 각각 해당 백엔드로 프록시한다. 따라서 기본 로컬 실행에서는 별도 CORS 설정이 필요하지 않다.

live mode를 실서버와 연결하려면 환경변수를 지정한다.

```bash
VITE_LAB_API_BASE_URL=http://127.0.0.1:18080 npm run dev
```

환경변수를 주지 않으면 개발 서버에서 상대경로 `/lab/run/trace`를 사용하고, Vite 프록시가 `http://127.0.0.1:8080`의 `example-app`으로 전달한다.

비교 서버를 독립적으로 배포했다면 아래 환경변수로 comparison endpoint를 직접 지정할 수 있다. 이 경우 대상 서버에서 해당 프론트 origin을 허용하는 CORS 설정이 필요하다.

```bash
VITE_SPRING_LITE_COMPARE_API_BASE_URL=https://lite.example.com \
VITE_SPRING_BOOT_COMPARE_API_BASE_URL=https://boot.example.com \
npm run dev
```

현재 프론트엔드는 `POST /lab/run/trace` 계약을 기대한다. 백엔드가 꺼져 있거나 응답하지 않으면 live mode는 에러를 설명하는 placeholder trace를 보여준다.

현재 UI는 선택값과 마지막 실행값을 분리해 보여준다.

- preset이나 runtime mode를 바꾼 뒤 `Run Selected Trace`로 실제 요청 실행
- 같은 요청을 다시 보내고 싶으면 `Re-run Last` 사용
- 마지막 실행 payload와 endpoint 상태를 화면에서 바로 확인
- live mode에서는 실제 서버 응답 trace 또는 fallback placeholder trace를 같은 패널 구조로 렌더링
- UI 셸, 주요 상태 메시지, 랩 카드, preset 라벨, trace 메타데이터는 한국어와 영어를 모두 지원

현재 live mode에서 바로 실행 가능한 시나리오는 다음과 같다.

- `example-flow / create`
- `example-flow / validation`
- `example-flow / not-found`
- `example-flow / service-error`
- `example-flow / rollback`
- `playground / aop-success`
- `playground / aop-rollback`
- `playground / mvc-validation`
- `container / bootstrap-full`
- `container / lifecycle-proxy`
- `comparison / di`, `comparison / mvc`, `comparison / tx` (Spring Lite와 Spring Boot 서버를 동시에 조회)

이 시나리오들은 모두 같은 `LabTrace` 스키마로 내려오며, 일부는 실제 서비스/트랜잭션/JDBC 경로를 실행하고 일부는 컨트롤러 선행 검증 분기를 정규화해서 보여준다.

static mode에서 현재 포함된 랩 범위는 다음과 같다.

- `playground`
  - `aop-success`
  - `aop-rollback`
  - `mvc-validation`
- `container`
  - `bootstrap-full`
  - `lifecycle-proxy`
- `example-flow`
  - `create`
  - `validation`
  - `not-found`
  - `service-error`
  - `rollback`
- `comparison`
  - `di`
  - `mvc`
  - `tx`

## 다음 구현 순서

1. 두 runtime 결과의 step, metric, outcome 차이를 강조하는 diff를 제공한다.
2. request form 편집, replay, 저장 세션 같은 상호작용을 확장한다.
3. comparison trace의 요청 파라미터를 편집하고 결과를 재현할 수 있게 한다.
