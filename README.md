# spring-lite

`spring-lite`는 Spring Framework의 핵심 원리를 직접 구현하는 학습용 경량 프레임워크 프로젝트다. 현재 저장소에는 IoC/DI, Bean Lifecycle, MVC Dispatcher, 프록시 기반 `@Transactional`, 경량 부트스트랩, 예제 앱까지 동작 가능한 MVP가 포함되어 있다.

## 목표 범위

1. `@Component` 기반 Bean 등록과 생성자 주입
2. `ApplicationContext`와 `@Configuration` / `@Bean`
3. `@RestController`, `@GetMapping`, `@PostMapping` 기반 MVC
4. JDK Dynamic Proxy 기반 AOP
5. `@Transactional`과 JDBC 템플릿
6. `MiniSpringApplication.run()` 형태의 부트스트랩

## 구현된 기능

- 애노테이션 기반 컴포넌트 스캔
- 생성자 주입 기반 DI 컨테이너
- `@Configuration` / `@Bean`
- `@PostConstruct` / `@PreDestroy`
- `BeanPostProcessor`
- JDK Dynamic Proxy 기반 AOP 인프라
- `@Transactional` 기반 메서드 인터셉션
- `JdbcTemplate`, `RowMapper`, `DriverManagerDataSource`
- `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`
- `@PathVariable`, `@RequestParam`, `@RequestBody`
- 내장 JDK HTTP 서버 기반 `MiniSpringApplication.run()`
- 주문 예제 앱과 기본 테스트

## 모듈 구성

- `spring-lite-core`: 공통 유틸리티, 메타데이터, 리플렉션 도우미
- `spring-lite-context`: BeanDefinition, BeanFactory, ApplicationContext, 스캐닝, 라이프사이클
- `spring-lite-aop`: ProxyFactory, Advice, Advisor, Pointcut, AOP 후처리
- `spring-lite-web`: DispatcherServlet, HandlerMapping, ArgumentResolver, JSON 응답
- `spring-lite-jdbc`: JdbcTemplate, RowMapper, DataSource 유틸리티
- `spring-lite-tx`: TransactionManager, TransactionInterceptor, 트랜잭션 경계
- `spring-lite-boot`: 자동 설정, 애플리케이션 실행, 내장 서버 연동 지점
- `spring-lite-test`: 테스트 지원 모듈
- `example-app`: 주문/결제/재고 예제 애플리케이션

## 문서 읽기 순서

1. [프로젝트 개요](./docs/codex/project-brief.md)
2. [아키텍처 개요](./docs/architecture/overview.md)
3. [스프링 핵심 원리와 코드 가이드](./docs/architecture/spring-core-principles-and-code-guide.md)
4. [구현 로드맵](./docs/codex/implementation-roadmap.md)
5. [작업 백로그](./docs/codex/task-backlog.md)
6. [모듈 맵](./docs/codex/module-map.md)
7. [개발 규칙](./docs/guides/development-conventions.md)
8. [커밋 규칙](./docs/guides/commit-conventions.md)

## 현재 상태

현재는 실행 가능한 MVP까지 구현된 상태다. 다만 다음 항목은 의도적으로 축소되어 있다.

- AOP는 JDK Dynamic Proxy 기반이며 인터페이스 구현 Bean에 우선 대응한다.
- 클래스패스 스캔은 파일 시스템 기반이며 JAR 스캔은 다루지 않는다.
- JSON 바인딩은 경량 자체 구현으로, 복잡한 객체 그래프나 고급 직렬화 규칙은 지원하지 않는다.
- 트랜잭션은 단일 데이터소스/단순 경계를 기준으로 설계되어 있다.

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
