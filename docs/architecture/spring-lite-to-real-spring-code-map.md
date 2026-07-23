# Spring Lite To Real Spring Code Map

이 문서는 `spring-lite`의 실제 코드가 Spring Framework / Spring Boot의 어느 클래스와 메서드 축에 대응되는지 정리한 문서다. 목적은 "비슷한 기능이 있다"는 수준이 아니라, 로컬 코드에서 보고 있는 책임이 실제 Spring 코드베이스에서는 어디로 분산되어 있는지 빠르게 찾게 만드는 것이다.

기준은 두 가지다.

1. 현재 저장소의 `spring-lite` 구현
2. 2026년 7월 기준 공식 Spring 문서와 공개 소스 구조

핵심 원칙은 하나다. 대응은 이름보다 책임으로 본다. 실제 Spring은 같은 문제를 더 많은 클래스와 더 많은 확장 포인트로 푼다.

## 1. 먼저 읽는 법

한 번에 모든 클래스를 비교하지 않는 편이 좋다. 아래 순서대로 읽는 것을 권한다.

1. 컨테이너 시작점
2. Bean 생성과 의존성 해석
3. 설정 클래스와 메타데이터 처리
4. AOP / 트랜잭션
5. MVC 디스패치
6. JDBC
7. Boot 부트스트랩
8. 테스트 지원

## 2. 최상위 대응표

| `spring-lite` 코드 | 실제 Spring 코드 | 왜 대응되는가 |
| --- | --- | --- |
| `spring-lite-context/.../AnnotationConfigApplicationContext` | `AbstractApplicationContext`, `AnnotationConfigApplicationContext`, `DefaultListableBeanFactory`, `AbstractAutowireCapableBeanFactory` | 컨텍스트 진입, refresh, bean 생성, 의존성 해석, lifecycle orchestration |
| `spring-lite-context/.../BeanDefinition` | `BeanDefinition`, `RootBeanDefinition` 계열 | 객체 생성 계획을 메타데이터로 보관 |
| `spring-lite-context/.../ClassPathScanner` | classpath scanning infrastructure, `ClassPathBeanDefinitionScanner` 축 | 스캔 결과를 bean definition 후보로 수집 |
| `spring-lite-aop/.../ProxyFactory` | `org.springframework.aop.framework.ProxyFactory` | 프록시 생성 전략 선택과 인터셉터 합성 |
| `spring-lite-aop/.../AspectBeanPostProcessor` | `AbstractAutoProxyCreator`, `AnnotationAwareAspectJAutoProxyCreator` 축 | 후처리 단계에서 프록시 후보를 만들고 advice를 적용 |
| `spring-lite-tx/.../TransactionalBeanPostProcessor` | `TransactionInterceptor`, `TransactionAspectSupport`, transaction advisor infrastructure | 선언형 트랜잭션 메타데이터를 읽고 호출 경계에 적용 |
| `spring-lite-tx/.../TransactionManager` | `PlatformTransactionManager`, `TransactionSynchronizationManager` | begin/commit/rollback과 현재 스레드의 트랜잭션 상태 관리 |
| `spring-lite-web/.../DispatcherServlet` | `org.springframework.web.servlet.DispatcherServlet` | Front Controller와 공통 디스패치 알고리즘 |
| `spring-lite-web/.../RequestMappingHandlerMapping` | `RequestMappingHandlerMapping` | 요청을 컨트롤러 메서드로 매핑 |
| `spring-lite-web/.../RequestMappingHandlerAdapter` | `RequestMappingHandlerAdapter` | 인자 해석, 검증, 메서드 호출, 반환값 처리 축 |
| `spring-lite-web/.../DefaultExceptionResolver` | `ExceptionHandlerExceptionResolver`, `ResponseEntityExceptionHandler` 축 | 예외를 HTTP 응답 모델로 변환 |
| `spring-lite-jdbc/.../JdbcTemplate` | `org.springframework.jdbc.core.JdbcTemplate` | 반복 JDBC 보일러플레이트 제거 |
| `spring-lite-boot/.../SpringLiteApplication` | `org.springframework.boot.SpringApplication` | 애플리케이션 시작, 컨텍스트 준비, 서버 기동 |
| `spring-lite-test/.../SpringLiteTestExtension` | `SpringExtension`, `TestContextManager` 축 | 테스트 컨텍스트 준비, 주입, 트랜잭션 테스트 지원 |

## 3. 컨테이너 대응

### `AnnotationConfigApplicationContext`

로컬 코드:

- `spring-lite-context/src/main/java/lite/spring/context/support/AnnotationConfigApplicationContext.java`

실제 Spring 코드:

- `org.springframework.context.support.AbstractApplicationContext`
- `org.springframework.context.annotation.AnnotationConfigApplicationContext`
- `org.springframework.beans.factory.support.DefaultListableBeanFactory`
- `org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory`

핵심 메서드 대응:

| `spring-lite` | 실제 Spring 축 | 읽을 포인트 |
| --- | --- | --- |
| `refresh()` | `AbstractApplicationContext.refresh()` | 컨텍스트 시작 순서와 주요 hook point |
| `register(...)` | `AnnotationConfigApplicationContext.register(...)` | 구성 클래스 등록 진입점 |
| `scan(...)` | `AnnotationConfigApplicationContext.scan(...)` | 스캔 시작점 |
| `createBean(...)` | `doCreateBean(...)` 계열 | 인스턴스 생성, 초기화, 후처리, 캐시 저장 |
| `resolveDependency(...)` | `resolveDependency(...)` 계열 | 타입 후보 선택, qualifier, 주입 규칙 |
| `close()` | `doClose()` 축 | 종료 이벤트와 destroy callback |

의미:

- `spring-lite`는 위 책임 대부분을 한 클래스에 모아 둔다.
- 실제 Spring은 컨텍스트 orchestration, bean registry, 실제 생성 알고리즘을 다른 계층으로 분해한다.

공식 참고:

- [Spring IoC Container and Beans](https://docs.spring.io/spring-framework/reference/core/beans/introduction.html)
- [Bean Overview](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)

## 4. Bean 메타데이터와 생성 모델 대응

### `BeanDefinition`

로컬 코드:

- `spring-lite-context/src/main/java/lite/spring/context/bean/BeanDefinition.java`

실제 Spring 코드:

- `org.springframework.beans.factory.config.BeanDefinition`
- `org.springframework.beans.factory.support.RootBeanDefinition`

대응 이유:

- 둘 다 "객체 자체"보다 "객체를 어떻게 만들 것인가"를 먼저 모델링한다.
- 생성 방식, 타입, 스코프, 라이프사이클 관련 설정이 bean metadata에 실린다.

차이:

- `spring-lite`는 학습용 최소 필드만 가진다.
- 실제 Spring은 constructor args, property values, parent/child definition, lazy, role, synthetic, autowire mode 등 훨씬 풍부한 메타데이터를 가진다.

공식 참고:

- [Bean Overview](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)

## 5. 스캔과 설정 클래스 대응

### `ClassPathScanner`

로컬 코드:

- `spring-lite-context/src/main/java/lite/spring/context/scan/ClassPathScanner.java`

실제 Spring 코드 축:

- `ClassPathBeanDefinitionScanner`
- component scanning infrastructure

대응 이유:

- 패키지에서 후보 클래스를 찾고, 이를 bean definition으로 연결하는 역할을 담당한다.

### `registerBeanMethods(...)`

로컬 코드:

- `AnnotationConfigApplicationContext.registerBeanMethods(...)`

실제 Spring 코드 축:

- `ConfigurationClassPostProcessor`

대응 이유:

- `@Bean`, `@Configuration`, `@ComponentScan`, import 계열 메타데이터를 해석해 추가 bean definition을 등록하는 문제를 푼다.

차이:

- `spring-lite`는 `@Bean` 메서드 등록을 직접 수행한다.
- 실제 Spring은 설정 클래스 처리를 별도 후처리기 파이프라인으로 분리한다.

공식 참고:

- [Using @Configuration Classes and @Bean Methods](https://docs.spring.io/spring-framework/reference/core/beans/java.html)

## 6. 라이프사이클과 후처리기 대응

### `BeanPostProcessor`

로컬 코드:

- `spring-lite-context/src/main/java/lite/spring/context/factory/BeanPostProcessor.java`

실제 Spring 코드:

- `org.springframework.beans.factory.config.BeanPostProcessor`

대응 이유:

- 둘 다 생성된 bean을 초기화 전후에 가로채서 변형하거나 감싸는 확장 포인트다.

### `initializeBean(...)`

로컬 코드 축:

- `AnnotationConfigApplicationContext.initializeBean(...)`

실제 Spring 코드 축:

- `initializeBean(...)`
- initialization callbacks and post-processing pipeline

대응 이유:

- `@PostConstruct`, before/after post-process, destroy callback 등록 같은 lifecycle의 핵심 단계가 여기에 모인다.

공식 참고:

- [Spring IoC Container and Beans](https://docs.spring.io/spring-framework/reference/core/beans/introduction.html)

## 7. AOP 대응

### `ProxyFactory`

로컬 코드:

- `spring-lite-aop/src/main/java/lite/spring/aop/support/ProxyFactory.java`

실제 Spring 코드:

- [Spring `ProxyFactory` Javadoc](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/aop/framework/ProxyFactory.html)

대응 이유:

- 프록시를 생성하고, 인터셉터 체인을 타깃 객체 앞에 배치한다.

### `MethodInvocation`

로컬 코드:

- `spring-lite-aop/src/main/java/lite/spring/aop/MethodInvocation.java`

실제 Spring 코드 축:

- `ReflectiveMethodInvocation`

대응 이유:

- 현재 호출 대상, 메서드, 인자, `proceed()` 상태를 하나의 객체로 묶는다.

### `AspectBeanPostProcessor`

로컬 코드:

- `spring-lite-aop/src/main/java/lite/spring/aop/support/AspectBeanPostProcessor.java`

실제 Spring 코드 축:

- `AbstractAutoProxyCreator`
- `AnnotationAwareAspectJAutoProxyCreator`

대응 이유:

- 후처리 단계에서 advice 적용 대상을 판단하고 프록시를 합성한다.

차이:

- `spring-lite`는 최소 `@Aspect` 모델과 `@Order` 정렬 중심이다.
- 실제 Spring은 advisor, pointcut, auto-proxy creator 계층을 더 일반화한다.

공식 참고:

- [Spring AOP Overview](https://docs.spring.io/spring-framework/reference/core/aop.html)

## 8. 트랜잭션 대응

### `TransactionalBeanPostProcessor`

로컬 코드:

- `spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionalBeanPostProcessor.java`

실제 Spring 코드 축:

- `TransactionInterceptor`
- `TransactionAspectSupport`
- transaction advisor infrastructure

대응 이유:

- 선언형 트랜잭션 메타데이터를 읽고, 호출 경계에서 begin/commit/rollback 정책을 적용한다.

### `TransactionManager`

로컬 코드:

- `spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionManager.java`

실제 Spring 코드 축:

- `PlatformTransactionManager`
- `TransactionSynchronizationManager`

핵심 메서드 대응:

| `spring-lite` | 실제 Spring 축 | 읽을 포인트 |
| --- | --- | --- |
| `begin()` | transaction begin orchestration | 기존 문맥 참여 여부와 새 트랜잭션 시작 |
| `commit()` | commit orchestration | rollback-only, 최외곽 경계, 자원 정리 |
| `rollback()` | rollback orchestration | 예외 정책과 rollback-only 전파 |
| `currentConnection()` | thread-bound resource lookup | 현재 스레드 자원 재사용 |

공식 참고:

- [Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction.html)
- [Declarative Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html)

## 9. MVC 대응

### `DispatcherServlet`

로컬 코드:

- `spring-lite-web/src/main/java/lite/spring/web/support/DispatcherServlet.java`

실제 Spring 코드:

- [DispatcherServlet Reference](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
- [DispatcherServlet Processing Sequence](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/sequence.html)
- [DispatcherServlet Javadoc](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/DispatcherServlet.html)

핵심 메서드 대응:

| `spring-lite` | 실제 Spring 축 | 읽을 포인트 |
| --- | --- | --- |
| `handle(HttpExchange)` | `doService(...)`, `doDispatch(...)` | 공통 디스패치 알고리즘 |
| 생성자 내부 전략 조립 | default strategy initialization | mapping, adapter, exception resolver, return handling |

대응 이유:

- Front Controller로서 요청을 공통 파이프라인에 태운다.
- 핸들러 탐색, 실행, 예외 처리, 응답 작성이 한 알고리즘 아래 묶인다.

### `RequestMappingHandlerMapping`

로컬 코드:

- `spring-lite-web/src/main/java/lite/spring/web/handler/RequestMappingHandlerMapping.java`

실제 Spring 코드:

- `RequestMappingHandlerMapping`

대응 이유:

- URL, HTTP 메서드, 조건 매핑을 보고 컨트롤러 메서드를 찾는다.

### `RequestMappingHandlerAdapter`

로컬 코드:

- `spring-lite-web/src/main/java/lite/spring/web/handler/RequestMappingHandlerAdapter.java`

실제 Spring 코드:

- `RequestMappingHandlerAdapter`

대응 이유:

- 인자 해석기 선택, 바인딩, 검증, 실제 컨트롤러 호출을 담당한다.

### `DefaultExceptionResolver`

로컬 코드:

- `spring-lite-web/src/main/java/lite/spring/web/exception/DefaultExceptionResolver.java`

실제 Spring 코드 축:

- `ExceptionHandlerExceptionResolver`
- `ResponseEntityExceptionHandler`

대응 이유:

- 예외를 상태 코드와 응답 바디로 번역한다.

## 10. JDBC 대응

### `JdbcTemplate`

로컬 코드:

- `spring-lite-jdbc/src/main/java/lite/spring/jdbc/JdbcTemplate.java`

실제 Spring 코드:

- [Spring JDBC Core Classes](https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html)

대응 이유:

- connection / statement / resource cleanup을 공통화하고 SQL과 row mapping 책임만 남긴다.

### `SingleConnectionProxy`

로컬 코드:

- `spring-lite-jdbc/src/main/java/lite/spring/jdbc/SingleConnectionProxy.java`

실제 Spring 코드 축:

- `DataSourceUtils`를 통한 현재 트랜잭션 자원 재사용

대응 이유:

- 트랜잭션 경계 안에서 현재 스레드의 커넥션을 일관되게 재사용하게 만든다.

## 11. Boot 대응

### `SpringLiteApplication`

로컬 코드:

- `spring-lite-boot/src/main/java/lite/spring/boot/SpringLiteApplication.java`

실제 Spring Boot 코드:

- [SpringApplication Reference](https://docs.spring.io/spring-boot/reference/features/spring-application.html)

핵심 대응:

| `spring-lite` | 실제 Spring Boot 축 | 읽을 포인트 |
| --- | --- | --- |
| `run(...)` | `SpringApplication.run(...)` | 진입점, 환경 준비, 컨텍스트 생성, refresh, 서버 시작 |
| command line overrides | command line property source / environment integration | 실행 인자와 환경 병합 |
| `BootInfrastructureRegistrar.registerDefaults(...)` | auto-configuration import / default infrastructure registration | 어떤 기본 빈을 자동으로 올릴지 결정 |

### `@SpringLiteBootApplication`

로컬 코드:

- `spring-lite-boot/src/main/java/lite/spring/boot/annotation/SpringLiteBootApplication.java`

실제 Spring Boot 코드:

- [Using the `@SpringBootApplication` Annotation](https://docs.spring.io/spring-boot/reference/using/using-the-springbootapplication-annotation.html)

대응 이유:

- 실행 시작점이 어떤 구성 모델을 사용할지 한 애너테이션으로 선언한다.

## 12. 테스트 대응

### `SpringLiteTestExtension`

로컬 코드:

- `spring-lite-test/src/main/java/lite/spring/test/SpringLiteTestExtension.java`

실제 Spring 코드 축:

- `SpringExtension`
- `TestContextManager`

대응 이유:

- 테스트 컨텍스트를 준비하고, 테스트 인스턴스 주입과 트랜잭션 테스트 경계를 관리한다.

### `MockMvc`

로컬 코드:

- `spring-lite-test/src/main/java/lite/spring/test/web/MockMvc.java`

실제 Spring 코드 축:

- Spring MVC Test의 `MockMvc`

대응 이유:

- 서버를 실제로 띄우지 않고도 `DispatcherServlet` 파이프라인을 검증한다.

공식 참고:

- [Spring Framework Testing](https://docs.spring.io/spring-framework/reference/testing/index.html)

## 13. 가장 효율적인 비교 루틴

한 기능을 비교할 때는 아래 순서를 고정하는 편이 좋다.

1. `spring-lite`에서 시작 메서드를 연다.
2. "이 메서드가 맡는 책임"을 한 문장으로 적는다.
3. 실제 Spring에서 같은 책임을 가진 클래스를 연다.
4. 이름이 아니라 단계 수와 확장 포인트 수가 왜 늘어났는지 본다.

예:

- 컨테이너:
  - `AnnotationConfigApplicationContext.refresh()`
  - `AbstractApplicationContext.refresh()`
- 생성:
  - `createBean(...)`
  - `AbstractAutowireCapableBeanFactory`의 생성 파이프라인
- MVC:
  - `DispatcherServlet.handle(...)`
  - `DispatcherServlet.doDispatch(...)`
- 트랜잭션:
  - `TransactionalBeanPostProcessor` / `TransactionManager`
  - `TransactionInterceptor` / `TransactionAspectSupport`

## 14. 함께 보면 좋은 로컬 문서

- [실제 Spring 비교 아키텍처 가이드](./spring-framework-comparison-and-architecture-guide.md)
- [실제 Spring 소스 읽기 실습](./spring-source-guided-reading.md)
- [런타임 시퀀스 다이어그램](./runtime-sequence-diagrams.md)
- [의도적 단순화와 구현 한계](./intentional-simplifications-and-limitations.md)
