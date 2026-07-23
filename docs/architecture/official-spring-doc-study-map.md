# Official Spring Doc Study Map

이 문서는 `spring-lite`를 기준으로 Spring Framework / Spring Boot 공식 문서를 어떻게 대응해서 읽을지 정리한 학습 가이드다. 목표는 공식 문서를 넓게 훑는 것이 아니라, `spring-lite`에서 이미 구현한 구조를 발판으로 공식 문서와 실제 Spring 코드를 함께 읽는 것이다.

학습 단위는 항상 아래 4단계로 고정한다.

1. `spring-lite` 코드에서 시작 메서드나 클래스를 연다.
2. 대응되는 공식 문서 장을 읽는다.
3. 실제 Spring / Spring Boot 클래스에서 같은 책임을 찾는다.
4. 왜 실제 Spring이 더 많은 추상화와 단계를 가졌는지 정리한다.

## 1. 전체 대응표

| 학습 축 | `spring-lite` 시작점 | 공식 문서 | 실제 Spring 코드 축 |
| --- | --- | --- | --- |
| IoC 컨테이너 | `AnnotationConfigApplicationContext` | `The IoC Container`, `Bean Overview` | `AbstractApplicationContext`, `DefaultListableBeanFactory` |
| 의존성 주입 | `resolveDependency(...)` | `Dependencies`, `Annotation-based Container Configuration` | dependency resolution 계층 |
| 스캔과 설정 | `ClassPathScanner`, `registerBeanMethods(...)` | `Classpath Scanning and Managed Components`, `Using @Configuration Classes and @Bean Methods` | `ClassPathBeanDefinitionScanner`, `ConfigurationClassPostProcessor` |
| 라이프사이클과 확장 포인트 | `initializeBean(...)`, `BeanPostProcessor` | `Customizing the Nature of a Bean`, `Container Extension Points` | initialization / post-processing pipeline |
| AOP | `ProxyFactory`, `AspectBeanPostProcessor` | `Spring AOP`, `Spring AOP APIs` | `ProxyFactory`, `AbstractAutoProxyCreator` |
| 트랜잭션 | `TransactionalBeanPostProcessor`, `TransactionManager` | `Transaction Management`, `Declarative Transaction Management` | `TransactionInterceptor`, `TransactionAspectSupport` |
| MVC | `DispatcherServlet`, `RequestMappingHandlerAdapter` | `Spring Web MVC`, `DispatcherServlet`, `Processing` | `DispatcherServlet`, `RequestMappingHandlerAdapter` |
| JDBC | `JdbcTemplate` | `Data Access with JDBC` | `org.springframework.jdbc.core.JdbcTemplate` |
| Boot | `SpringLiteApplication` | `SpringApplication` | `org.springframework.boot.SpringApplication` |
| 테스트 | `SpringLiteTestExtension`, `MockMvc` | `Testing` | `SpringExtension`, `TestContextManager`, `MockMvc` |

## 2. 1회차 학습 원칙

- 공식 문서를 처음부터 끝까지 읽지 않는다.
- 먼저 `spring-lite` 구현으로 작은 모델을 잡는다.
- 공식 문서에서는 개념과 용어를 정렬한다.
- 실제 Spring 코드는 "모든 줄"이 아니라 "같은 책임을 맡는 메서드"만 찾는다.
- 마지막에 반드시 아래 질문에 답한다.
  - 입력은 무엇인가
  - 책임은 어디서 시작되는가
  - 확장 포인트는 어디에 끼어드는가
  - 왜 `spring-lite`보다 클래스 수가 늘어났는가

## 3. IoC 컨테이너 루틴

### `spring-lite`에서 먼저 볼 코드

- `spring-lite-context/src/main/java/lite/spring/context/support/AnnotationConfigApplicationContext.java`
- 특히:
  - `register(...)`
  - `scan(...)`
  - `refresh()`
  - `createBean(...)`
  - `resolveDependency(...)`

### 공식 문서 순서

1. [The IoC Container](https://docs.spring.io/spring-framework/reference/core/beans.html)
2. [Bean Overview](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)
3. `Dependencies`
4. `Annotation-based Container Configuration`
5. `The BeanFactory API`

### 실제 Spring 코드 축

- `AbstractApplicationContext.refresh()`
- `AnnotationConfigApplicationContext`
- `DefaultListableBeanFactory`
- `AbstractAutowireCapableBeanFactory`

### 1회차 확인 질문

- refresh 단계는 몇 개로 쪼개지는가
- bean definition과 실제 bean instance는 어디서 분리되는가
- 의존성 해석은 어떤 계층에서 일어나는가
- `spring-lite`에서 한 메서드였던 것이 실제 Spring에서는 왜 여러 메서드로 갈라지는가

### 가장 좋은 읽기 순서

1. `spring-lite`의 `refresh()`를 읽는다.
2. 공식 문서에서 IoC 컨테이너 목차를 보고 용어를 맞춘다.
3. 실제 Spring의 `AbstractApplicationContext.refresh()`를 연다.
4. `createBean(...)`와 `doCreateBean(...)` 계열을 비교한다.

## 4. 스캔과 설정 클래스 루틴

### `spring-lite`에서 먼저 볼 코드

- `ClassPathScanner`
- `AnnotationUtils`
- `AnnotationConfigApplicationContext.registerBeanMethods(...)`

### 공식 문서 순서

1. [Classpath Scanning and Managed Components](https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html)
2. [Using @Configuration Classes and @Bean Methods](https://docs.spring.io/spring-framework/reference/core/beans/java.html)

### 실제 Spring 코드 축

- `ClassPathBeanDefinitionScanner`
- `ConfigurationClassPostProcessor`

### 1회차 확인 질문

- 스캔은 후보 수집과 빈 정의 생성 중 어디까지 담당하는가
- `@Bean` 메서드 처리가 왜 별도 메타데이터 파이프라인이 되는가
- 설정 클래스가 "빈이면서 동시에 정의 생성기"라는 말은 어디서 드러나는가

## 5. 라이프사이클과 확장 포인트 루틴

### `spring-lite`에서 먼저 볼 코드

- `initializeBean(...)`
- `BeanPostProcessor`
- `@PostConstruct`, `@PreDestroy` 처리 지점

### 공식 문서 순서

1. `Customizing the Nature of a Bean`
2. `Container Extension Points`

### 실제 Spring 코드 축

- initialization callbacks
- `BeanPostProcessor`
- destruction callbacks

### 1회차 확인 질문

- before / after post-process가 정확히 어디에 끼어드는가
- destroy callback은 어떤 시점에 등록되는가
- 프록시 같은 구조 변경은 왜 after-initialization 단계가 적합한가

## 6. AOP 루틴

### `spring-lite`에서 먼저 볼 코드

- `spring-lite-aop/src/main/java/lite/spring/aop/support/ProxyFactory.java`
- `spring-lite-aop/src/main/java/lite/spring/aop/MethodInvocation.java`
- `spring-lite-aop/src/main/java/lite/spring/aop/support/AspectBeanPostProcessor.java`

### 공식 문서 순서

1. [Spring AOP Overview](https://docs.spring.io/spring-framework/reference/core/aop.html)
2. [Spring AOP APIs](https://docs.spring.io/spring-framework/reference/core/aop-api.html)

### 실제 Spring 코드 축

- `org.springframework.aop.framework.ProxyFactory`
- `ReflectiveMethodInvocation`
- `AbstractAutoProxyCreator`

### 1회차 확인 질문

- 프록시는 누가 언제 생성하는가
- advice, advisor, pointcut이 왜 분리되는가
- `spring-lite`의 interceptor chain이 실제 Spring에서는 어떻게 일반화되는가

### 추천 학습 순서

1. `MethodInvocation.proceed()` 흐름을 이해한다.
2. 공식 문서에서 proxying, advice, advisor 용어를 정리한다.
3. 실제 Spring의 `ProxyFactory`와 auto-proxy creator 축을 읽는다.

## 7. 트랜잭션 루틴

### `spring-lite`에서 먼저 볼 코드

- `TransactionalBeanPostProcessor`
- `TransactionManager`

### 공식 문서 순서

1. [Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction.html)
2. [Declarative Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html)
3. `Synchronizing resources with transactions`

### 실제 Spring 코드 축

- `TransactionInterceptor`
- `TransactionAspectSupport`
- `PlatformTransactionManager`
- `TransactionSynchronizationManager`

### 1회차 확인 질문

- 메타데이터는 어디서 읽는가
- begin/commit/rollback은 누가 결정하는가
- 현재 스레드 자원은 어디에 저장되는가
- rollback-only는 어떤 구조로 전파되는가

### 추천 학습 순서

1. `TransactionManager.begin()/commit()/rollback()`을 읽는다.
2. 공식 문서에서 declarative transaction 장을 읽는다.
3. 실제 Spring에서 interceptor와 tx manager의 역할 분리를 확인한다.

## 8. MVC 루틴

### `spring-lite`에서 먼저 볼 코드

- `DispatcherServlet.handle(...)`
- `RequestMappingHandlerMapping`
- `RequestMappingHandlerAdapter`
- argument resolver들
- `DefaultExceptionResolver`

### 공식 문서 순서

1. [Spring Web MVC](https://docs.spring.io/spring/reference/web/webmvc.html)
2. [DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
3. [Processing](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/sequence.html)

### 실제 Spring 코드 축

- `DispatcherServlet`
- `RequestMappingHandlerMapping`
- `RequestMappingHandlerAdapter`
- `ExceptionHandlerExceptionResolver`

### 1회차 확인 질문

- 핸들러는 어떻게 선택되는가
- 인자 해석은 어떤 전략 객체들이 나누어 가지는가
- 404, 400, 500은 각각 어느 단계 실패인가
- 반환값 처리와 예외 처리 계층은 왜 분리되는가

### 추천 학습 순서

1. `DispatcherServlet.handle(...)`를 읽는다.
2. 공식 문서의 Processing 페이지를 본다.
3. 실제 Spring `DispatcherServlet.doDispatch(...)`와 `RequestMappingHandlerAdapter`를 본다.

## 9. JDBC 루틴

### `spring-lite`에서 먼저 볼 코드

- `JdbcTemplate`
- `SingleConnectionProxy`

### 공식 문서 순서

1. [Data Access](https://docs.spring.io/spring-framework/reference/data-access.html)
2. `Data Access with JDBC`

### 실제 Spring 코드 축

- `org.springframework.jdbc.core.JdbcTemplate`
- resource reuse / `DataSourceUtils` 축

### 1회차 확인 질문

- 어떤 반복 코드가 템플릿으로 숨겨지는가
- 트랜잭션 중에는 커넥션을 어떻게 재사용하는가
- SQL과 매핑 책임은 왜 남겨 두는가

## 10. Boot 루틴

### `spring-lite`에서 먼저 볼 코드

- `SpringLiteApplication.run(...)`
- `BootInfrastructureRegistrar.registerDefaults(...)`

### 공식 문서 순서

1. [SpringApplication](https://docs.spring.io/spring-boot/reference/features/spring-application.html)
2. `@SpringBootApplication` 설명

### 실제 Spring 코드 축

- `org.springframework.boot.SpringApplication`

### 1회차 확인 질문

- 실행 인자와 환경은 어디서 병합되는가
- 컨텍스트 생성과 refresh는 어디서 연결되는가
- 어떤 기본 인프라가 자동으로 올라오는가

## 11. 테스트 루틴

### `spring-lite`에서 먼저 볼 코드

- `SpringLiteTestExtension`
- `MockMvc`

### 공식 문서 순서

1. [Testing](https://docs.spring.io/spring-framework/reference/testing/index.html)
2. TestContext framework
3. MockMvc 관련 장

### 실제 Spring 코드 축

- `SpringExtension`
- `TestContextManager`
- `MockMvc`

### 1회차 확인 질문

- 컨텍스트는 누가 언제 준비하는가
- 필드 주입과 파라미터 주입은 어떤 단계에서 일어나는가
- 트랜잭션 테스트 롤백은 어떤 lifecycle에 연결되는가

## 12. 가장 좋은 주간 학습 방식

### 1주차

- IoC 컨테이너
- BeanDefinition
- 스캔과 설정 클래스

### 2주차

- 라이프사이클
- AOP
- 트랜잭션

### 3주차

- MVC
- JDBC
- example-app 요청 추적

### 4주차

- Boot
- 테스트
- 실제 Spring 소스 재독

## 13. 같이 보면 좋은 로컬 문서

- [Spring Lite -> 실제 Spring 코드 대응표](./spring-lite-to-real-spring-code-map.md)
- [실제 Spring 소스 읽기 실습](./spring-source-guided-reading.md)
- [런타임 시퀀스 다이어그램](./runtime-sequence-diagrams.md)
- [예제 앱 요청 흐름 추적](./example-app-request-flow.md)
