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

현재 프론트엔드는 `POST /lab/run/trace` 계약을 기대한다. 백엔드 endpoint가 아직 없으면 live mode는 placeholder trace를 보여준다.

## 다음 구현 순서

1. 현재 `visual-lab` 정적 페이지 기능을 React 컴포넌트로 옮긴다.
2. 공통 `LabTrace` 타입과 static/live provider 계층을 추가한다.
3. `example-flow-lab`을 첫 live integration 대상으로 연결한다.
