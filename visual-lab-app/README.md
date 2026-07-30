# visual-lab-app

`visual-lab-app`은 기존 `visual-lab/*.html` 정적 페이지를 분리형 프론트엔드로 옮기기 위한 시작 스캐폴드다.

현재 단계의 목적은 다음과 같다.

- React + TypeScript + Vite 기반 독립 앱 구조 확보
- 기존 학습 흐름을 컴포넌트 기반 구조로 옮길 준비
- 향후 `static simulation mode`와 `live runtime mode`를 함께 지원할 기반 마련

## 현재 포함 범위

- 최소 실행 가능한 Vite 앱 설정
- `Runtime Mode` 토글과 명시적 trace 실행 버튼
- playground, container, example-flow, comparison 전체를 고를 수 있는 공통 trace explorer
- metrics, steps, lanes, snapshot, references를 공통 스키마로 렌더링하는 trace UI
- `example-flow` live runtime 연동과 나머지 랩의 static parity trace

## 실행 예정 방법

의존성을 설치한 뒤 아래처럼 실행한다.

```bash
npm install
npm run dev
```

기본 개발 서버 포트는 `4173`이다.

live mode를 실서버와 연결하려면 환경변수를 지정한다.

```bash
VITE_LAB_API_BASE_URL=http://127.0.0.1:18080 npm run dev
```

환경변수를 주지 않으면 개발 서버에서 상대경로 `/lab/run/trace`를 사용하고, Vite 프록시가 `http://127.0.0.1:8080`의 `example-app`으로 전달한다.

현재 프론트엔드는 `POST /lab/run/trace` 계약을 기대한다. 백엔드가 꺼져 있거나 응답하지 않으면 live mode는 에러를 설명하는 placeholder trace를 보여준다.

현재 UI는 선택값과 마지막 실행값을 분리해 보여준다.

- preset이나 runtime mode를 바꾼 뒤 `Run Selected Trace`로 실제 요청 실행
- 같은 요청을 다시 보내고 싶으면 `Re-run Last` 사용
- 마지막 실행 payload와 endpoint 상태를 화면에서 바로 확인
- live mode에서는 실제 서버 응답 trace 또는 fallback placeholder trace를 같은 패널 구조로 렌더링

현재 `example-app` 기준 live mode에서 바로 실행 가능한 시나리오는 다음과 같다.

- `example-flow / create`
- `example-flow / validation`
- `example-flow / not-found`
- `example-flow / service-error`
- `example-flow / rollback`

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

1. `container`와 `comparison`에 대한 live trace contract를 설계한다.
2. 비교 대시보드를 dual-runtime 실행형 UI로 확장한다.
3. request form 편집, diff, replay 같은 상호작용을 더 풍부하게 만든다.
