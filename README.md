# spring-lite

`spring-lite`는 Spring Framework의 핵심 원리를 직접 구현하는 학습용 경량 프레임워크 프로젝트다. 현재 저장소에는 IoC/DI, Bean Lifecycle, MVC Dispatcher, 프록시 기반 `@Transactional`, 경량 부트스트랩, 예제 앱까지 포함된 MVP와 그 이후 핵심 확장 기능이 구현되어 있다.

## 목표 범위

1. `@Component` 기반 Bean 등록과 생성자 주입
2. `ApplicationContext`와 `@Configuration` / `@Bean`
3. `@RestController`, `@GetMapping`, `@PostMapping` 기반 MVC
4. 프록시 기반 AOP
5. `@Transactional`과 JDBC 템플릿
6. `MiniSpringApplication.run()` 형태의 부트스트랩

## 구현된 기능

- 애노테이션 기반 컴포넌트 스캔
- 생성자 주입 기반 DI 컨테이너
- `@Configuration` / `@Bean`
- `@PostConstruct` / `@PreDestroy`
- `BeanPostProcessor`
- `@Qualifier`, `@Value`, 프로퍼티 해석
- 파일 시스템 및 JAR 기반 클래스패스 스캔
- JDK Dynamic Proxy 및 클래스 기반 프록시 AOP 인프라
- `@Transactional` 기반 메서드 인터셉션
- `JdbcTemplate`, `RowMapper`, `DriverManagerDataSource`
- H2 기반 JDBC/트랜잭션 통합 테스트
- `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`
- `@PathVariable`, `@RequestParam`, `@RequestBody`
- `@ExceptionHandler`와 MVC 내부 역할 분리
- 내장 JDK HTTP 서버 기반 `MiniSpringApplication.run()`
- 기본 인프라 자동 등록 기반 부트스트랩
- 주문 예제 앱과 기본 테스트

## 모듈 구성

- `spring-lite-core`: 공통 유틸리티, 메타데이터, 리플렉션 도우미
- `spring-lite-context`: BeanDefinition, BeanFactory, ApplicationContext, 스캐닝, 라이프사이클
- `spring-lite-aop`: `MethodInterceptor`, `MethodInvocation`, `ProxyFactory`
- `spring-lite-web`: DispatcherServlet, HandlerMapping, ArgumentResolver, JSON 응답
- `spring-lite-jdbc`: JdbcTemplate, RowMapper, DataSource 유틸리티
- `spring-lite-tx`: `@Transactional`, `TransactionManager`, `TransactionalBeanPostProcessor`
- `spring-lite-boot`: 자동 설정, 애플리케이션 실행, 내장 서버 연동 지점
- `spring-lite-test`: 테스트 지원 모듈
- `example-app`: 주문 조회/생성 예제 애플리케이션

## 문서 읽기 순서

1. [프로젝트 개요](./docs/codex/project-brief.md)
2. [아키텍처 개요](./docs/architecture/overview.md)
3. [스프링 핵심 원리와 코드 가이드](./docs/architecture/spring-core-principles-and-code-guide.md)
4. [실제 Spring 비교 아키텍처 가이드](./docs/architecture/spring-framework-comparison-and-architecture-guide.md)
5. [Post-MVP 구현 계획](./docs/codex/post-mvp-implementation-plan.md)
6. [추가 구현 백로그](./docs/codex/next-implementation-backlog.md)
7. [구현 로드맵](./docs/codex/implementation-roadmap.md)
8. [작업 백로그](./docs/codex/task-backlog.md)
9. [모듈 맵](./docs/codex/module-map.md)
10. [개발 규칙](./docs/guides/development-conventions.md)
11. [커밋 규칙](./docs/guides/commit-conventions.md)

## 현재 상태

현재는 실행 가능한 MVP를 넘어서 컨테이너, AOP, MVC, JDBC, Boot 계층의 핵심 확장까지 반영된 상태다. 다만 다음 항목은 아직 축소되어 있거나 다음 단계 과제로 남아 있다.

- Boot 자동 설정은 조건부 등록과 모듈 분리까지 반영됐지만, 더 다양한 조건과 조립 전략은 남아 있다.
- 웹 계층은 JSON API 중심이며 응답 모델과 검증 기능이 더 필요하다.
- 트랜잭션은 단일 데이터소스와 단순 전파 정책을 기준으로 설계되어 있다.
- 테스트 지원 모듈은 아직 실체화 전이며, 향후 별도 DSL과 헬퍼를 추가할 계획이다.

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
