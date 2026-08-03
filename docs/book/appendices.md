# 부록

## Appendix A. 장별 소스 코드 맵

이 부록의 목적은 본문 장과 실제 저장소 코드를 빠르게 왕복하도록 돕는 데 있다. 책을 읽다가 구현 세부가 궁금해질 때, 아래 표를 기준으로 바로 관련 모듈과 클래스로 이동하면 된다.

| 장 | 핵심 모듈 | 중심 클래스/파일 |
| --- | --- | --- |
| 3장 | `spring-lite-context` | `BeanDefinition`, `AnnotationConfigApplicationContext` |
| 4장 | `spring-lite-context` | 생성자 선택/의존성 해석 관련 메서드 |
| 5장 | `spring-lite-context` | `ClassPathScanner`, `AnnotationUtils`, `BeanNameGenerator` |
| 6장 | `spring-lite-context` | `@Configuration`, `@Bean`, factory method registration |
| 7장 | `spring-lite-context`, `spring-lite-core` | `PropertyResolver`, `ConversionService`, `@Qualifier`, `@Value` |
| 8장 | `spring-lite-context` | scope 처리, `ApplicationListener`, refresh/close 이벤트 |
| 9장 | `spring-lite-context` | lifecycle initialization, `@PostConstruct`, `@PreDestroy` |
| 10장 | `spring-lite-context` | `BeanPostProcessor` |
| 12장 | `spring-lite-aop` | `ProxyFactory`, `MethodInvocation`, class proxy support |
| 13장 | `spring-lite-aop`, `spring-lite-tx` | 인터셉터 체인, `@Order` 기반 합성 |
| 14장 | `spring-lite-aop` | `AspectBeanPostProcessor`, aspect 애너테이션 |
| 15장 | `spring-lite-tx` | `TransactionalBeanPostProcessor`, `TransactionManager` |
| 17장 | `spring-lite-web` | `DispatcherServlet`, `HandlerMapping`, `HandlerAdapter` |
| 18장 | `spring-lite-web` | 인자 해석기, request mapping handler |
| 19장 | `spring-lite-web` | `JsonMapper`, `ResponseEntity`, exception resolver |
| 20장 | `spring-lite-web`, `spring-lite-core` | validation, request conditions |
| 21장 | `spring-lite-jdbc` | `JdbcTemplate`, `RowMapper`, `SingleConnectionProxy` |
| 23장 | `spring-lite-boot` | `SpringLiteApplication`, auto-config classes, `WebServer` |
| 24장 | `spring-lite-test` | `SpringLiteTestExtension`, `MockMvc` |

### 빠른 읽기 순서

1. `spring-lite-context`
2. `spring-lite-aop`
3. `spring-lite-tx`
4. `spring-lite-web`
5. `spring-lite-jdbc`
6. `spring-lite-boot`
7. `spring-lite-test`
8. `example-app`

이 순서는 런타임 의존 방향과도 거의 일치한다. 책을 구현형으로 읽는 독자라면 이 순서를 유지하는 편이 이해 속도가 가장 빠르다.

## Appendix B. 실제 Spring 소스 읽기 가이드

책을 다 읽은 뒤 실제 Spring 소스로 넘어갈 때는 한 번에 너무 넓게 보지 않는 것이 중요하다. 저장소 규모가 압도적으로 크기 때문이다. 아래 순서를 권한다.

### 1. 컨테이너

- `AbstractApplicationContext.refresh()`
- `DefaultListableBeanFactory`
- `AutowiredAnnotationBeanPostProcessor`

여기서는 refresh 순서, 빈 정의 처리, post-processor 개입 지점을 보는 것이 핵심이다.

### 2. Java Config와 스캔

- `ConfigurationClassPostProcessor`
- 클래스패스 스캐닝 관련 패키지

여기서는 `@Configuration`, `@Bean`, component scan이 어떻게 더 풍부한 메타데이터 모델로 확장되는지 살핀다.

### 3. AOP와 트랜잭션

- `ProxyFactory`
- `AbstractAutoProxyCreator`
- `TransactionInterceptor`

여기서는 실제 Spring이 advisor, pointcut, auto-proxy creator를 통해 얼마나 일반화된 구조를 사용하는지 확인한다.

### 4. Web MVC

- `DispatcherServlet`
- `RequestMappingHandlerAdapter`
- `ExceptionHandlerExceptionResolver`

여기서는 디스패처 중심 파이프라인이 얼마나 많은 전략 객체로 분해되어 있는지를 본다.

### 5. Boot

- auto-configuration 진입점
- 환경/프로퍼티 바인딩 계층

여기서는 Spring Boot가 왜 "한 줄 실행" 뒤에 거대한 조건부 조립 시스템을 두는지 확인한다.

## Appendix C. 자주 묻는 질문

### 왜 프록시가 필요한가

공통 관심사를 비즈니스 코드 밖에서 메서드 호출 경계에 삽입하려면, 원본 객체 앞에 다른 객체를 둘 수 있어야 한다. 프록시는 이 개입 지점을 제공한다.

### 왜 자기 호출(self-invocation)이 문제인가

프록시 기반 기능은 프록시를 통과하는 호출에서만 동작한다. 같은 클래스 안에서 `this`로 호출하면 프록시를 우회하므로, 트랜잭션이나 AOP가 기대대로 적용되지 않을 수 있다.

### 왜 `BeanPostProcessor`가 중요한가

컨테이너가 생성한 빈을 다시 변형할 수 있기 때문이다. 프록시, 선언형 기능, 메타데이터 기반 확장의 상당수가 이 지점에 기대고 있다.

### 왜 Spring은 이렇게 복잡해졌는가

더 다양한 환경, 더 많은 확장, 더 긴 하위 호환성을 동시에 감당해야 했기 때문이다. 이 책에서 만든 `spring-lite`는 같은 문제의 더 작은 축소판이다.

## Appendix D. 독자를 위한 확장 과제

### 과제 1. `HttpMessageConverter` 도입

- 목표: JSON 고정 응답/요청 처리를 더 일반적인 메시지 변환 계층으로 끌어올린다.
- 학습 포인트: MVC가 왜 콘텐츠 협상과 직렬화 전략을 따로 가지는지 이해할 수 있다.

### 과제 2. 더 풍부한 pointcut 모델

- 목표: 메서드 이름과 애너테이션을 넘어 더 일반적인 매칭 규칙을 만든다.
- 학습 포인트: 실제 Spring AOP가 advisor abstraction을 왜 필요로 하는지 이해할 수 있다.

### 과제 3. 정적 리소스 서빙

- 목표: `/static/**`를 클래스패스에서 제공하는 단순 리소스 핸들러를 구현한다.
- 학습 포인트: MVC가 JSON API만이 아니라 리소스 전달 파이프라인도 다뤄야 함을 이해할 수 있다.

### 과제 4. 더 풍부한 auto-configuration

- 목표: 조건부 등록 모델을 더 풍부하게 만들고, 설정 조합 전략을 확장한다.
- 학습 포인트: Spring Boot의 auto-configuration이 왜 강력하면서도 복잡한지 이해할 수 있다.

### 과제 5. 더 풍부한 테스트 fixture

- 목표: 데이터 초기화, 컨텍스트 캐싱 전략, 재사용 가능한 웹 fixture를 만든다.
- 학습 포인트: 테스트 지원도 프레임워크의 중요한 일부라는 사실을 더 깊게 체감할 수 있다.

## Appendix E. 증상별 디버깅 가이드

이 부록은 "어디를 먼저 볼 것인가"를 빠르게 정리하기 위한 실무용 표다. 핵심은 예외 메시지를 외우는 것이 아니라, 증상을 실행 단계로 번역하는 것이다.

### 1. `NoSuchBeanException`

- 먼저 볼 것:
  - 스캔 대상 패키지가 맞는가
  - `@Component`, `@Configuration`, `@Bean` 중 어떤 등록 경로를 기대했는가
  - 조건부 등록이 빈을 탈락시킨 것은 아닌가
- `spring-lite`에서 추적할 메서드:
  - `registerDiscoveredClass(...)`
  - `registerBeanMethods(...)`
  - `containsBeanDefinition(...)`
  - `getBean(...)`
- 실제 Spring에서 이어서 볼 클래스:
  - `ConfigurationClassPostProcessor`
  - `DefaultListableBeanFactory`

### 2. `NoUniqueBeanException`

- 먼저 볼 것:
  - 같은 타입의 구현이 둘 이상 등록되었는가
  - `@Qualifier`가 필요한데 빠진 것은 아닌가
  - 의도치 않은 `@Bean` 중복 등록은 없는가
- `spring-lite`에서 추적할 메서드:
  - `resolveDependency(...)`
  - `resolveQualifiedDependency(...)`
  - `getBeansOfType(...)`
- 실제 Spring에서 이어서 볼 클래스:
  - `DefaultListableBeanFactory`
  - `AutowiredAnnotationBeanPostProcessor`

### 3. 프록시가 붙지 않음

- 먼저 볼 것:
  - 대상 빈이 `BeanPostProcessor` 적용 이후 반환되었는가
  - 대상 메서드나 타입에 트랜잭션/어드바이스 메타데이터가 실제로 있는가
  - 같은 클래스 내부 호출로 프록시를 우회하지 않았는가
- `spring-lite`에서 추적할 메서드:
  - `initializeBean(...)`
  - `AspectBeanPostProcessor.postProcessAfterInitialization(...)`
  - `TransactionalBeanPostProcessor.postProcessAfterInitialization(...)`
- 실제 Spring에서 이어서 볼 클래스:
  - `AbstractAutoProxyCreator`
  - `TransactionInterceptor`

### 4. `@Transactional`이 기대대로 동작하지 않음

- 먼저 볼 것:
  - 프록시를 통과한 외부 호출인가
  - 예외 타입이 rollback 규칙과 맞는가
  - 이미 열린 트랜잭션에 참여한 것인가
  - rollback-only 상태가 중첩 호출에서 전파되었는가
- `spring-lite`에서 추적할 메서드:
  - `TransactionManager.begin()`
  - `TransactionManager.commit()`
  - `TransactionManager.rollback()`
  - `TransactionInterceptor.invoke(...)`
- 실제 Spring에서 이어서 볼 클래스:
  - `TransactionAspectSupport`
  - `TransactionSynchronizationManager`

### 5. MVC 404

- 먼저 볼 것:
  - URL과 HTTP 메서드가 등록된 매핑과 일치하는가
  - path variable 패턴은 맞는가
  - 조건 매핑이 요청을 탈락시킨 것은 아닌가
- `spring-lite`에서 추적할 메서드:
  - `DispatcherServlet.handle(...)`
  - `RequestMappingHandlerMapping.getHandler(...)`
- 실제 Spring에서 이어서 볼 클래스:
  - `DispatcherServlet`
  - `RequestMappingHandlerMapping`

### 6. MVC 400

- 먼저 볼 것:
  - `@RequestParam`, `@PathVariable`, `@RequestBody` 바인딩 중 어디서 실패했는가
  - 타입 변환 실패인가, 검증 실패인가
  - 요청 본문이 기대 JSON 구조와 맞는가
- `spring-lite`에서 추적할 메서드:
  - `RequestMappingHandlerAdapter.handle(...)`
  - 각 `HandlerMethodArgumentResolver.resolveArgument(...)`
  - `validateIfNecessary(...)`
- 실제 Spring에서 이어서 볼 클래스:
  - `RequestMappingHandlerAdapter`
  - `ExceptionHandlerExceptionResolver`

### 7. MVC 500

- 먼저 볼 것:
  - 컨트롤러 본문 예외인가
  - 로컬 `@ExceptionHandler` 또는 전역 `@ControllerAdvice`가 매핑되었는가
  - 예외가 응답 바디로 변환되는 마지막 지점이 어디인가
- `spring-lite`에서 추적할 메서드:
  - `DispatcherServlet.handle(...)`
  - `DefaultExceptionResolver.resolve(...)`
- 실제 Spring에서 이어서 볼 클래스:
  - `ExceptionHandlerExceptionResolver`
  - `ResponseEntityExceptionHandler`

### 8. Boot 자동 설정이 기대와 다름

- 먼저 볼 것:
  - 어떤 기본 설정 클래스가 등록되었는가
  - `@ConditionalOnBean`, `@ConditionalOnMissingBean`, `@ConditionalOnProperty`, `@ConditionalOnClass` 중 무엇이 결과를 바꿨는가
  - 사용자 정의 빈이 기본 등록을 대체했는가
- `spring-lite`에서 추적할 메서드:
  - `BootInfrastructureRegistrar.registerDefaults(...)`
  - `isBeanEligible(...)`

## Appendix F. 도판 인덱스

출간 편집본에서 반복해서 참조할 핵심 도판 목록이다. 본문을 다시 펼치지 않고도 어떤 그림이 어떤 책임을 설명하는지 빠르게 찾을 수 있다.

권장 활용 방식:

1. 처음 읽을 때는 장 본문에서 그림을 함께 본다.
2. 두 번째 읽을 때는 이 인덱스를 기준으로 그림만 빠르게 훑으며 실행 단계를 복기한다.
3. 실제 Spring 소스를 읽을 때는 대응 장의 그림을 먼저 보고, 그 다음 관련 클래스를 여는 편이 좋다.

| 그림 번호 | 파일 | 설명 |
| --- | --- | --- |
| 그림 3-1 | `docs/book/figures/container-metadata-lifecycle.svg` | 빈 정의 수집, 생성 전략 선택, 초기화, 싱글톤 캐시까지의 컨테이너 기본 흐름 |
| 그림 15-1 | `docs/book/figures/transaction-boundary.svg` | 프록시 기반 선언형 트랜잭션 호출 경계 |
| 그림 17-1 | `docs/book/figures/dispatcher-pipeline.svg` | `DispatcherServlet` 중심 MVC 파이프라인과 404/400/500 분기 |
| 그림 21-1 | `docs/book/figures/jdbc-template-skeleton.svg` | `JdbcTemplate`의 불변 실행 골격과 트랜잭션 커넥션 재사용 |
| 그림 23-1 | `docs/book/figures/boot-orchestration.svg` | `SpringLiteApplication.run()`의 부트스트랩 조립 순서 |
| 그림 24-1 | `docs/book/figures/test-extension-lifecycle.svg` | `SpringLiteTestExtension`의 컨텍스트/트랜잭션 라이프사이클 |

## Appendix G. 용어집

이 부록은 책 전체에서 반복되는 핵심 용어를 같은 의미로 읽도록 돕기 위한 최소 용어집이다.

### BeanDefinition

빈 인스턴스 자체가 아니라, 빈을 어떻게 만들지 설명하는 메타데이터다. 이름, 타입, 생성 전략, 스코프, 한정자 같은 정보를 담는다.

### Bean Registry

빈 정의를 등록하고 조회하는 저장소다. 인스턴스 캐시와 구분해서 보는 것이 중요하다.

### Dependency Resolution

생성자나 메서드 파라미터를 보고 어떤 빈을 연결할지 결정하는 과정이다. 타입 탐색, 한정자 선택, 실패 전략이 모두 여기에 속한다.

### Bean Lifecycle

인스턴스 생성, 의존성 주입, 초기화, 후처리, 소멸까지 이어지는 전체 흐름이다.

### BeanPostProcessor

생성된 빈에 초기화 전후로 개입해 변경하거나 감쌀 수 있게 하는 확장 포인트다. 프록시 적용의 핵심 관문이다.

### Proxy

원본 객체 대신 앞단에 배치되어 메서드 호출 경계에 개입하는 객체다. AOP와 선언형 트랜잭션이 여기에 의존한다.

### Advice / Interceptor

메서드 호출 전후 또는 도중에 실행되는 공통 관심사 로직이다. `spring-lite`에서는 인터셉터 체인 중심으로 설명한다.

### Dispatcher

HTTP 요청을 컨트롤러 메서드 실행으로 번역하는 조정자다. 매핑, 인자 구성, 예외 처리, 응답 변환을 통합한다.

### Transaction Boundary

트랜잭션이 시작되고 끝나는 호출 경계다. 선언형 트랜잭션에서는 대개 프록시가 이 경계를 만든다.

### Propagation

이미 열린 트랜잭션이 있을 때 새 호출이 그 문맥에 참여할지, 새 문맥을 만들지 정하는 규칙이다.

### Auto-configuration

사용자 설정과 클래스패스 상태를 보고 적절한 기본 빈을 자동으로 조립하는 부트스트랩 계층이다.

## Appendix H. 실제 Spring 공식 문서와 병행 읽기

이 책은 `spring-lite` 구현을 중심에 두지만, 실제 Spring 학습 효과를 높이려면 공식 문서를 Part 단위로 병행하는 편이 좋다.

### Part 1~2를 읽을 때

- Spring Framework Reference의 Core, IoC Container, Bean Overview, Classpath Scanning 관련 장을 함께 본다.
- 목표:
  - 공식 용어와 책의 용어를 일치시키기
  - 빈 정의, 컨테이너, 스캔, Java Config가 어디까지 표준 개념인지 확인하기

### Part 3을 읽을 때

- Bean lifecycle callbacks, BeanPostProcessor, container extension points 관련 문서를 함께 본다.
- 목표:
  - 라이프사이클과 후처리기가 어디서 개입하는지 공식 용어로 다시 확인하기
  - 학습용 단순화와 실제 확장 포인트의 차이를 파악하기

### Part 4를 읽을 때

- Spring AOP와 transaction management 문서를 병행한다.
- 목표:
  - 프록시 기반 AOP의 전제와 한계를 공식 설명으로 재확인하기
  - propagation, rollback rule, self-invocation 주의를 실제 문서 표현으로 익히기

### Part 5를 읽을 때

- Spring MVC, annotated controllers, method arguments, exception handling 문서를 함께 본다.
- 목표:
  - `DispatcherServlet` 중심 파이프라인을 실제 전략 인터페이스 관점에서 확장해 읽기
  - 인자 해석기, 메시지 변환기, 예외 처리기 계층을 공식 문서 언어로 다시 정리하기

### Part 6~7을 읽을 때

- Spring JDBC, Spring Boot externalized configuration, auto-configuration, testing support 문서를 함께 본다.
- 목표:
  - `spring-lite`의 단순화된 Boot 모델이 실제 Boot에서 어떻게 일반화되는지 비교하기
  - 테스트 지원이 프레임워크 본체의 일부라는 관점을 공식 문서와 연결하기

### 병행 읽기 원칙

1. 공식 문서를 처음부터 끝까지 연속해서 읽으려 하지 않는다.
2. 책에서 이미 구현한 주제와 대응되는 절만 골라 읽는다.
3. 기능 사용법보다 용어와 책임 경계를 먼저 확인한다.
4. 문서를 읽은 뒤에는 저장소 코드에서 대응 클래스를 바로 열어 본다.
  - 조건 메타데이터 해석 메서드
- 실제 Spring에서 이어서 볼 클래스:
  - `AutoConfigurationImportSelector`
  - 조건 평가 관련 인프라

### 디버깅 공통 원칙

- 예외를 기능 이름이 아니라 실행 단계로 바꿔서 본다.
- 로그를 읽기 전에 "이 증상은 등록, 생성, 후처리, 프록시, 디스패치 중 어디 문제인가"를 먼저 정한다.
- 테스트 한 개를 추가해 실패를 고정한 뒤 코드를 따라간다.
- 실제 Spring으로 넘어갈 때는 같은 책임을 가진 클래스부터 읽는다.
