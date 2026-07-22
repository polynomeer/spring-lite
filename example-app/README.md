# example-app

`example-app`은 `spring-lite`의 기능을 실제 요청 흐름으로 검증하는 주문 예제 애플리케이션이다. 웹, 서비스, 트랜잭션, JDBC, 설정이 한 번에 결합되는 통합 시나리오를 제공한다.

## 역할

- 주문 조회/생성 API 제공
- `@Transactional` 서비스 계층 검증
- JDBC/H2 기반 저장소 검증
- 프로퍼티 기반 기본 주문 상태와 데이터소스 설정 검증

## 핵심 패키지

- `lite.spring.example`
- `lite.spring.example.config`
- `lite.spring.example.order`

## 공개 진입점

- `ExampleApplication`
- `OrderController`

## 내부 핵심 클래스

- `OrderController`
  - HTTP 요청을 서비스 호출로 연결한다.
- `DefaultOrderService`
  - 주문 생성 비즈니스 로직과 트랜잭션 경계를 가진다.
- `JdbcOrderRepository`
  - `JdbcTemplate`을 통해 DB와 통신한다.
- `AppConfig`
  - 예제 앱 인프라를 조립한다.

## 요청 흐름

1. HTTP 요청이 `DispatcherServlet`로 들어온다.
2. `OrderController`가 요청 DTO를 받는다.
3. `DefaultOrderService` 프록시가 트랜잭션을 연다.
4. `JdbcOrderRepository`가 `JdbcTemplate`으로 SQL을 실행한다.
5. 결과가 도메인 객체와 JSON 응답으로 변환된다.

자세한 추적은 `docs/architecture/example-app-request-flow.md`를 본다.

## 테스트 포인트

- `ExampleApplicationTest`
  - 서비스/저장소 통합
- `ExampleApplicationWebTest`
  - 웹 요청부터 JSON 응답까지 전체 통합

## 실제 Spring 대응

- `@SpringBootApplication` 기반 REST API 예제와 같은 역할
- 컨트롤러, 서비스, 저장소, 트랜잭션, JDBC가 실제 Spring에서 어떻게 결합되는지 축소판으로 보여 준다.

## 현재 한계

- 도메인 시나리오는 주문에 집중
- 비동기, 이벤트, 다중 외부 시스템 연동 미포함
