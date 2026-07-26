# Visual Lab

`visual-lab`는 `spring-lite`의 내부 동작을 문서만으로 보기 어려운 지점에 대해, 브라우저에서 직접 조작해보는 학습용 페이지를 모아두는 디렉터리다.

## 포함된 페이지

- `spring-lite-playground.html`
  - `AOP + Transaction` 호출 체인 시뮬레이터
  - `MVC Request` 처리 파이프라인 실험실

## 왜 필요한가

문서와 코드만 읽을 때는 아래 같은 질문이 자주 남는다.

- advice와 transaction interceptor는 정확히 어떤 순서로 실행되는가
- nested `REQUIRED` 호출은 실제로 무엇이 "중첩"되는가
- 요청이 404, 400, 200으로 갈릴 때 어느 단계에서 분기되는가
- validation 실패와 controller exception은 왜 서로 다른 경로로 처리되는가

이 페이지는 그 질문을 눈으로 확인하게 해준다.

## 여는 방법

브라우저에서 아래 파일을 직접 열면 된다.

- `visual-lab/spring-lite-playground.html`

또는 간단히 로컬 서버를 띄워도 된다.

```bash
python3 -m http.server 8081
```

그 뒤 브라우저에서 `http://localhost:8081/visual-lab/spring-lite-playground.html`로 접속하면 된다.

## 함께 보면 좋은 문서

- `docs/architecture/visual-architecture-guide.md`
- `docs/architecture/runtime-sequence-diagrams.md`
- `docs/testing/detailed-test-guide.md`
