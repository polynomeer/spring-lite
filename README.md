# spring-lite

`spring-lite`는 Spring Framework의 핵심 원리를 직접 구현하는 학습용 경량 프레임워크 프로젝트다. 현재 저장소에는 IoC/DI, Bean Lifecycle, MVC Dispatcher, 프록시 기반 `@Transactional`, 경량 부트스트랩, 예제 앱까지 포함된 MVP와 그 이후 핵심 확장 기능이 구현되어 있다.

## 목표 범위

1. `@Component` 기반 Bean 등록과 생성자 주입
2. `ApplicationContext`와 `@Configuration` / `@Bean`
3. `@RestController`, `@GetMapping`, `@PostMapping` 기반 MVC
4. 프록시 기반 AOP
5. `@Transactional`과 JDBC 템플릿
6. `SpringLiteApplication.run()` 형태의 부트스트랩

## 구현된 기능

- 애노테이션 기반 컴포넌트 스캔
- 생성자 주입 기반 DI 컨테이너
- `@Configuration` / `@Bean`
- `@PostConstruct` / `@PreDestroy`
- `BeanPostProcessor`
- `@Qualifier`, `@Value`, 프로퍼티 해석
- `@Scope("prototype")`
- 파일 시스템 및 JAR 기반 클래스패스 스캔
- `ApplicationListener`, `ContextRefreshedEvent`, `ContextClosedEvent`
- JDK Dynamic Proxy 및 클래스 기반 프록시 AOP 인프라
- `@Aspect`, `@Before`, `@Around`, `@AfterReturning`, `@Order` 기반 AOP 체인
- `@Transactional` 기반 메서드 인터셉션
- `REQUIRED` 전파와 `rollbackFor` / `noRollbackFor`
- `JdbcTemplate`, `RowMapper`, `DriverManagerDataSource`
- H2 기반 JDBC/트랜잭션 통합 테스트
- `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`
- `@PathVariable`, `@RequestParam`, `@RequestBody`
- `consumes`, `produces`, `headers`, `params` 기반 요청 매핑 조건
- `@Valid`, `@NotNull`, `@Min`, `@Size` 기반 입력 검증
- `@ExceptionHandler`와 MVC 내부 역할 분리
- `@ControllerAdvice` 기반 전역 예외 처리
- `@SpringLiteTest`, `MockMvc` 스타일 테스트 지원
- `@Transactional` 테스트 롤백 지원
- 내장 JDK HTTP 서버 기반 `SpringLiteApplication.run()`
- 기본 인프라 자동 등록 기반 부트스트랩
- profile-aware `application-{profile}.yml` 로딩
- JDBC/H2 기반 주문 예제 앱과 통합 테스트

## 모듈 구성

- `spring-lite-core`: 공통 유틸리티, 메타데이터, 리플렉션 도우미
- `spring-lite-context`: BeanDefinition, ApplicationContext, scope, 이벤트, 스캐닝, 라이프사이클
- `spring-lite-aop`: `MethodInterceptor`, `MethodInvocation`, `ProxyFactory`
- `spring-lite-web`: DispatcherServlet, HandlerMapping, ArgumentResolver, JSON 응답
- `spring-lite-jdbc`: JdbcTemplate, RowMapper, DataSource 유틸리티
- `spring-lite-tx`: `@Transactional`, `TransactionManager`, `TransactionalBeanPostProcessor`
- `spring-lite-boot`: 자동 설정, 애플리케이션 실행, 내장 서버 연동 지점
- `spring-lite-test`: JUnit 확장, 컨텍스트 로딩, mock web 테스트 지원
- `example-app`: JDBC/H2와 설정 기반 정책을 사용하는 주문 예제 애플리케이션

## 문서 읽기 순서

1. [프로젝트 개요](./docs/codex/project-brief.md)
2. [아키텍처 개요](./docs/architecture/overview.md)
3. [스프링 핵심 원리와 코드 가이드](./docs/architecture/spring-core-principles-and-code-guide.md)
4. [책 문서 안내](./docs/book/README.md)
5. [책 전체 완성 원고](./docs/book/complete-manuscript.md)
6. [부록](./docs/book/appendices.md)
7. [코드 블록 삽입 계획](./docs/book/code-block-placement-plan.md)
8. [책 전체 목차 설계](./docs/book/book-outline.md)
9. [장별 시놉시스와 집필 분량 계획](./docs/book/chapter-synopsis-and-writing-plan.md)
10. [실제 Spring 비교 아키텍처 가이드](./docs/architecture/spring-framework-comparison-and-architecture-guide.md)
11. [Spring Lite -> 실제 Spring 코드 대응표](./docs/architecture/spring-lite-to-real-spring-code-map.md)
12. [공식 Spring 문서 학습 맵](./docs/architecture/official-spring-doc-study-map.md)
13. [코드 레벨 Spring 비교](./docs/architecture/code-level-comparison-with-spring.md)
14. [모듈 코드 가이드](./docs/architecture/spring-lite-module-code-guide.md)
15. [런타임 시퀀스 다이어그램](./docs/architecture/runtime-sequence-diagrams.md)
16. [시각적 아키텍처 가이드](./docs/architecture/visual-architecture-guide.md)
17. [실제 Spring 소스 읽기 실습](./docs/architecture/spring-source-guided-reading.md)
18. [의도적 단순화와 구현 한계](./docs/architecture/intentional-simplifications-and-limitations.md)
19. [예제 앱 요청 흐름 추적](./docs/architecture/example-app-request-flow.md)
20. [테스트 카탈로그](./docs/testing/test-catalog.md)
21. [상세 테스트 해설](./docs/testing/detailed-test-guide.md)
22. [Post-MVP 구현 계획](./docs/codex/post-mvp-implementation-plan.md)
23. [추가 구현 백로그](./docs/codex/next-implementation-backlog.md)
24. [구현 로드맵](./docs/codex/implementation-roadmap.md)
25. [작업 백로그](./docs/codex/task-backlog.md)
26. [모듈 맵](./docs/codex/module-map.md)
27. [개발 규칙](./docs/guides/development-conventions.md)
28. [커밋 규칙](./docs/guides/commit-conventions.md)

## 비교 샘플

- [샘플 시나리오 모음](./sample-scenarios/README.md)
- [01. DI 비교](./sample-scenarios/01-di/README.md)
- [02. MVC 비교](./sample-scenarios/02-mvc/README.md)
- [03. 트랜잭션 비교](./sample-scenarios/03-transaction/README.md)
- [04. 테스트 비교](./sample-scenarios/04-testing/README.md)
- [실행 가능한 spring-lite 비교 앱](./comparison-spring-lite-app/README.md)
- [실행 가능한 Spring Boot 비교 앱](./comparison-spring-boot-app/README.md)

## Visual Lab

- [Visual Lab 안내](./visual-lab/README.md)
- [Spring Lite Playground](./visual-lab/spring-lite-playground.html)
- [Spring Lite Container Lab](./visual-lab/spring-lite-container-lab.html)

## 책 초안 문서

- [Part 1 원고 초안](./docs/book/part-1-draft.md)
- [Part 2 원고 초안](./docs/book/part-2-draft.md)
- [Part 3 원고 초안](./docs/book/part-3-draft.md)
- [Part 4 원고 초안](./docs/book/part-4-draft.md)
- [Part 5 원고 초안](./docs/book/part-5-draft.md)
- [Part 6 원고 초안](./docs/book/part-6-draft.md)
- [Part 7 원고 초안](./docs/book/part-7-draft.md)

## 현재 상태

현재는 실행 가능한 MVP를 넘어서 컨테이너, AOP, MVC, JDBC, Boot 계층의 핵심 확장까지 반영된 상태다. 다만 다음 항목은 아직 축소되어 있거나 다음 단계 과제로 남아 있다.

- Boot 자동 설정은 조건부 등록, 모듈 분리, profile-aware property loading까지 반영됐지만, 더 다양한 조건과 조립 전략은 남아 있다.
- 웹 계층은 JSON API 중심이며 검증은 최소 애노테이션 세트 기준으로 제공된다.
- 컨테이너는 singleton/prototype scope와 기본 컨텍스트 이벤트를 제공하지만, 더 고급 생명주기 훅은 남아 있다.
- 트랜잭션은 단일 데이터소스 기준이지만 `REQUIRED` 전파와 예외별 rollback 정책까지 반영되어 있다.
- 테스트 지원 모듈은 JUnit 확장, mock web 호출기, transactional rollback 지원을 제공하며, 향후 fixture 확장은 남아 있다.

## 실행 방법

```bash
./gradlew test
./gradlew :example-app:run
```

기본 포트는 `8080`이며, 예제 API는 아래처럼 확인할 수 있다.

```bash
curl http://localhost:8080/orders
curl http://localhost:8080/orders/1
curl -X POST http://localhost:8080/orders \
  -H 'Content-Type: application/json' \
  -d '{"product":"book","quantity":2}'
```
