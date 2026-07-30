# visual-lab-app

`visual-lab-app`은 기존 `visual-lab/*.html` 정적 페이지를 분리형 프론트엔드로 옮기기 위한 시작 스캐폴드다.

현재 단계의 목적은 다음과 같다.

- React + TypeScript + Vite 기반 독립 앱 구조 확보
- 기존 학습 흐름을 컴포넌트 기반 구조로 옮길 준비
- 향후 `static simulation mode`와 `live runtime mode`를 함께 지원할 기반 마련

## 현재 포함 범위

- 최소 실행 가능한 Vite 앱 설정
- `Runtime Mode` 토글이 있는 초기 랜딩 화면
- 현재 `visual-lab`의 네 개 핵심 화면을 feature card로 정리한 overview
- 다음 구현 단계와 목표를 보여주는 roadmap panel

## 실행 예정 방법

의존성을 설치한 뒤 아래처럼 실행한다.

```bash
npm install
npm run dev
```

기본 개발 서버 포트는 `4173`이다.

live mode를 실서버와 연결하려면 환경변수를 지정한다.

```bash
VITE_LAB_API_BASE_URL=http://127.0.0.1:8080 npm run dev
```

환경변수를 주지 않으면 개발 서버에서 상대경로 `/lab/run/trace`를 사용하고, Vite 프록시가 `http://127.0.0.1:8080`의 `example-app`으로 전달한다.

현재 프론트엔드는 `POST /lab/run/trace` 계약을 기대한다. 백엔드가 꺼져 있거나 응답하지 않으면 live mode는 에러를 설명하는 placeholder trace를 보여준다.

현재 `example-app` 기준 live mode에서 바로 실행 가능한 시나리오는 다음과 같다.

- `example-flow / create`
- `example-flow / validation`
- `example-flow / not-found`
- `example-flow / service-error`
- `example-flow / rollback`

이 시나리오들은 모두 같은 `LabTrace` 스키마로 내려오며, 일부는 실제 서비스/트랜잭션/JDBC 경로를 실행하고 일부는 컨트롤러 선행 검증 분기를 정규화해서 보여준다.

## 다음 구현 순서

1. 현재 `visual-lab` 정적 페이지 기능을 React 컴포넌트로 옮긴다.
2. 공통 `LabTrace` 타입과 static/live provider 계층을 추가한다.
3. `example-flow-lab` 이후 `container`와 `comparison` 계열도 같은 live contract로 확장한다.
