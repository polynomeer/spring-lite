# Project Brief

## 목적

`spring-lite`는 Spring의 핵심 기능을 학습 가능한 단위로 분해해 직접 구현하는 프로젝트다. 프레임워크 사용자 관점보다 프레임워크 제작자 관점에 초점을 두며, 구현 과정에서 IoC, DI, MVC, AOP, Transaction, Bootstrapping의 내부 동작을 코드로 설명 가능해야 한다.

## 비목표

- Spring과 100% 호환되는 API 제공
- 운영 환경 수준의 완성도 확보
- 초기 단계에서 모든 애노테이션/확장 포인트 지원

## 1차 MVP

- `@Component` 기반 컴포넌트 스캔
- 생성자 주입 기반 DI
- 싱글톤 Bean 저장소와 `ApplicationContext`
- `@RestController`, `@GetMapping`, `@PostMapping`
- JSON 응답 처리
- `JdbcTemplate`
- `@Transactional`
- `MiniSpringApplication.run()`

## 설계 원칙

1. 작은 인터페이스를 먼저 정의하고 구현은 단계적으로 확장한다.
2. Spring의 용어를 차용하되 기능 수준은 명확히 축소한다.
3. 모듈 간 순환 의존을 금지한다.
4. 리플렉션과 프록시 사용 지점은 문서화한다.
5. 구현 순서는 테스트 가능한 최소 단위로 끊는다.

## 권장 첫 구현 순서

1. `spring-lite-core`: 리플렉션 유틸, 애노테이션 메타모델
2. `spring-lite-context`: `BeanDefinition`, `BeanFactory`, 스캐너, 생성자 주입
3. `spring-lite-context`: `ApplicationContext`, `@Configuration`, `@Bean`
4. `spring-lite-web`: 간단한 Dispatcher + HandlerMapping
5. `spring-lite-aop`: JDK Dynamic Proxy 기반 Advice 체인
6. `spring-lite-tx`, `spring-lite-jdbc`: 트랜잭션과 JDBC 템플릿
7. `spring-lite-boot`: 부트스트랩과 자동 설정

