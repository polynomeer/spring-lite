# spring-lite

`spring-lite`는 Spring Framework의 핵심 원리를 직접 구현하는 학습용 경량 프레임워크 프로젝트다. 목표는 IoC/DI, Bean Lifecycle, MVC Dispatcher, AOP, Transaction, Auto Configuration을 단계적으로 구현하면서 각 계층의 책임을 명확하게 분리하는 것이다.

## 목표 범위

1. `@Component` 기반 Bean 등록과 생성자 주입
2. `ApplicationContext`와 `@Configuration` / `@Bean`
3. `@RestController`, `@GetMapping`, `@PostMapping` 기반 MVC
4. JDK Dynamic Proxy 기반 AOP
5. `@Transactional`과 JDBC 템플릿
6. `MiniSpringApplication.run()` 형태의 부트스트랩

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
3. [구현 로드맵](./docs/codex/implementation-roadmap.md)
4. [작업 백로그](./docs/codex/task-backlog.md)
5. [모듈 맵](./docs/codex/module-map.md)
6. [개발 규칙](./docs/guides/development-conventions.md)
7. [커밋 규칙](./docs/guides/commit-conventions.md)

## 현재 상태

현재 저장소는 구현을 시작하기 위한 문서화와 멀티모듈 구조를 먼저 잡아둔 상태다. 실제 코드 구현은 `spring-lite-context`의 Bean 등록/조회 흐름부터 시작하는 것이 우선순위다.
