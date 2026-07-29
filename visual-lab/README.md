# Visual Lab

`visual-lab`는 `spring-lite`의 내부 동작을 문서와 코드만으로 읽을 때 놓치기 쉬운 "순서", "분기", "경계"를 브라우저에서 직접 조작해보는 학습용 페이지 모음이다.

이 디렉터리의 목표는 단순한 데모가 아니라, 다음 세 가지를 한 번에 묶는 것이다.

- 현재 어떤 입력이 어떤 런타임 분기를 만들었는지
- 그 분기가 실제 코드의 어디에 대응되는지
- 어떤 테스트가 그 동작을 보호하는지

## 빠른 시작

가장 빠른 진입점은 허브 페이지다.

- `visual-lab/index.html`
- 분리형 프론트엔드 스캐폴드는 `visual-lab-app/README.md`에서 확인할 수 있다.

허브에서 바로 아래 네 페이지로 이동할 수 있다.

- `spring-lite-playground.html`
- `spring-lite-container-lab.html`
- `spring-lite-example-flow-lab.html`
- `spring-lite-vs-spring-dashboard.html`

파일을 직접 브라우저에서 열어도 되고, 로컬 서버를 띄워도 된다.

```bash
python3 -m http.server 8081
```

그 뒤 브라우저에서 아래 주소를 열면 된다.

```text
http://localhost:8081/visual-lab/index.html
```

## 추천 학습 순서

기본 추천 순서는 아래와 같다.

1. `spring-lite-playground.html`
2. `spring-lite-container-lab.html`
3. `spring-lite-example-flow-lab.html`
4. `spring-lite-vs-spring-dashboard.html`

이 순서를 추천하는 이유는 다음과 같다.

- `playground`는 가장 작은 AOP / Transaction / MVC 루프를 보여준다.
- `container-lab`은 그 루프가 성립하기 전에 컨테이너가 무엇을 준비하는지 보여준다.
- `example-flow-lab`은 작은 루프들을 실제 애플리케이션 요청으로 합쳐 보여준다.
- `comparison-dashboard`는 마지막에 이 학습 모델을 실제 Spring Boot에 대응시킨다.

## 페이지별 가이드

### 1. `index.html`

허브 페이지다.

무엇을 제공하는가:

- 추천 학습 순서
- 질문 기반 시작점
- `code first / docs first / tests first` 진입 레일
- 각 실습의 목적과 난이도
- 각 실습을 코드/테스트 관점에서 비교하는 preview matrix

이 페이지가 특히 유용한 경우:

- 어디부터 읽어야 할지 모르겠을 때
- 지금 질문이 컨테이너/웹/트랜잭션/실제 Spring 비교 중 어디에 속하는지 빠르게 분류하고 싶을 때
- 특정 실습 전에 같이 열어둘 문서나 테스트를 찾고 싶을 때

### 2. `spring-lite-playground.html`

가장 작은 런타임 루프를 보는 페이지다.

포함된 실습:

- `AOP and Transaction Chain`
- `MVC Request Pipeline`

직접 조작하는 입력:

- advice 종류 (`@Before`, `@Around`, `@AfterReturning`)
- transaction 사용 여부
- nested REQUIRED 호출 여부
- HTTP method / path / query / content-type / request body
- validation / handled exception / resolver-based exception 분기

이 페이지에서 확인해야 할 핵심 질문:

- `@Transactional`은 정확히 어느 지점에서 begin / commit / rollback 되는가
- 예외가 발생하면 advice chain과 transaction chain은 어떤 순서로 반응하는가
- MVC 요청은 routing, binding, validation, controller, response writing 중 어디서 갈리는가

같이 보면 좋은 코드:

- `spring-lite-aop/src/main/java/lite/spring/aop/support/AspectBeanPostProcessor.java`
- `spring-lite-aop/src/main/java/lite/spring/aop/MethodInvocation.java`
- `spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionInterceptor.java`
- `spring-lite-web/src/main/java/lite/spring/web/support/DispatcherServlet.java`

같이 보면 좋은 테스트:

- `spring-lite-aop/src/test/java/.../AspectBeanPostProcessorTest.java`
- `spring-lite-tx/src/test/java/.../TransactionManagerTest.java`
- `spring-lite-web/src/test/java/.../DispatcherServletTest.java`

### 3. `spring-lite-container-lab.html`

컨테이너가 시작되고 빈이 만들어지는 과정을 보는 페이지다.

포함된 실습:

- `ApplicationContext Bootstrap`
- `Single Bean Lifecycle`

직접 조작하는 입력:

- configuration class 수
- classpath scan 방식
- component candidate 수
- conditional bean / AOP / JDBC / web infra 사용 여부
- bean origin (`component` / `factory`)
- `@Value`, `@PostConstruct`, proxy wrapping, destroy callback, prototype 여부

이 페이지에서 확인해야 할 핵심 질문:

- 컨테이너는 어떤 순서로 registry, post-processor, singleton, infra bean을 준비하는가
- 왜 post-processors가 일반 singleton보다 먼저 만들어져야 하는가
- raw target instance와 exposed bean instance는 언제 달라지는가
- singleton cache 등록과 lifecycle completion은 어떤 관계인가

같이 보면 좋은 코드:

- `spring-lite-context/src/main/java/lite/spring/context/support/AnnotationConfigApplicationContext.java`
- `spring-lite-context/src/main/java/lite/spring/context/scan/ClassPathScanner.java`
- `spring-lite-core/src/main/java/lite/spring/core/convert/DefaultConversionService.java`

같이 보면 좋은 테스트:

- `spring-lite-context/src/test/java/.../AnnotationConfigApplicationContextTest.java`
- `spring-lite-context/src/test/java/.../ClassPathScannerTest.java`
- `spring-lite-boot/src/test/java/.../SpringLiteApplicationTest.java`

### 4. `spring-lite-example-flow-lab.html`

실제 예제 앱의 한 요청이 프레임워크 전 계층을 통과하는 모습을 보는 페이지다.

직접 조작하는 입력:

- `POST /orders`, `GET /orders`, `GET /orders/{id}`
- malformed JSON
- validation failure
- unknown id
- service error
- rollback
- transaction 사용 여부
- seeded order 존재 여부
- SQL 상세 표시 여부

이 페이지에서 확인해야 할 핵심 질문:

- 어떤 400은 routing 때문이고, 어떤 400은 validation 때문이고, 어떤 400은 domain error 때문인가
- service layer error와 repository rollback error는 어디서 갈리는가
- JDBC 작업이 실제로 시작된 뒤의 실패와, 시작 전에 끝난 실패는 어떻게 다른가

같이 보면 좋은 코드:

- `example-app/src/main/java/lite/spring/example/order/OrderController.java`
- `example-app/src/main/java/lite/spring/example/order/DefaultOrderService.java`
- `example-app/src/main/java/lite/spring/example/order/JdbcOrderRepository.java`
- `spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionManager.java`

같이 보면 좋은 테스트/문서:

- `example-app/src/test/java/.../ExampleApplicationTest.java`
- `example-app/src/test/java/.../ExampleApplicationWebTest.java`
- `docs/architecture/example-app-request-flow.md`

### 5. `spring-lite-vs-spring-dashboard.html`

`spring-lite`에서 배운 개념을 실제 Spring Boot와 비교하는 마지막 페이지다.

비교 축:

- DI
- MVC
- Transaction

직접 조작하는 입력:

- detail level
- scenario strength
- internal engine 표시 여부
- code snippet 표시 여부
- tradeoff 강조 여부

이 페이지에서 확인해야 할 핵심 질문:

- 어떤 개념이 1:1로 그대로 옮겨가고, 어떤 부분부터 Spring Boot 특유의 인프라 층이 생기는가
- 왜 Spring Lite에서는 드러나는 것이 Spring Boot에서는 보이지 않게 되는가
- 실제 Spring 소스를 읽으러 갈 때 가장 먼저 대응시켜야 할 개념은 무엇인가

같이 보면 좋은 문서:

- `docs/architecture/spring-lite-to-real-spring-code-map.md`
- `docs/architecture/official-spring-doc-study-map.md`
- `docs/architecture/code-level-comparison-with-spring.md`
- `sample-scenarios/*`

## 어떤 질문에 어느 페이지를 열어야 하나

- "`@Transactional`이 왜 동작하지?" -> `spring-lite-playground.html`
- "빈은 언제 프록시가 되지?" -> `spring-lite-container-lab.html`
- "한 요청이 어디서 400/500으로 갈리는지 보고 싶다" -> `spring-lite-example-flow-lab.html`
- "실제 Spring과 뭐가 같고 뭐가 다른지 정리하고 싶다" -> `spring-lite-vs-spring-dashboard.html`

## 함께 열어두면 좋은 문서

- `visual-lab-app/README.md`
- `docs/codex/visual-lab-frontend-separation-plan.md`
- `docs/architecture/visual-architecture-guide.md`
- `docs/architecture/runtime-sequence-diagrams.md`
- `docs/architecture/example-app-request-flow.md`
- `docs/architecture/spring-lite-module-code-guide.md`
- `docs/testing/detailed-test-guide.md`

## 학습 팁

- 실습 페이지를 먼저 조작한 뒤 코드를 읽는 편이, 순서를 거꾸로 하는 것보다 훨씬 빠르게 구조를 잡게 해준다.
- 각 페이지의 `Scenario Snapshot`이나 `Next Recommended Pages`는 단순 설명이 아니라, 다음에 열어야 할 코드와 문서를 압축한 탐색 안내다.
- 분기가 복잡해질수록 먼저 `timeline`, 그 다음 `lane`, 마지막으로 `summary`를 읽는 순서가 좋다.
- 실습에서 본 내용을 테스트 코드로 다시 확인하면 "의도된 동작"과 "구현된 동작"을 함께 잡을 수 있다.
