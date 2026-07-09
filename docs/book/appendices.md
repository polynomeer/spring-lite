# Appendices

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
| 13장 | `spring-lite-aop`, `spring-lite-tx` | interceptor chain, ordered composition |
| 14장 | `spring-lite-aop` | `AspectBeanPostProcessor`, aspect annotations |
| 15장 | `spring-lite-tx` | `TransactionalBeanPostProcessor`, `TransactionManager` |
| 17장 | `spring-lite-web` | `DispatcherServlet`, `HandlerMapping`, `HandlerAdapter` |
| 18장 | `spring-lite-web` | argument resolvers, request mapping handler |
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

여기서는 refresh 순서, bean definition 처리, post-processor 개입 지점을 보는 것이 핵심이다.

### 2. Java Config와 스캔

- `ConfigurationClassPostProcessor`
- classpath scanning 관련 패키지

여기서는 `@Configuration`, `@Bean`, component scan이 어떻게 더 풍부한 메타데이터 모델로 확장되는지 본다.

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

### 왜 self-invocation이 문제인가

프록시 기반 기능은 프록시를 통과하는 호출에서만 동작한다. 같은 클래스 안에서 `this`로 호출하면 프록시를 우회하므로, 트랜잭션이나 AOP가 기대대로 적용되지 않을 수 있다.

### 왜 `BeanPostProcessor`가 중요한가

컨테이너가 생성한 빈을 다시 변형할 수 있기 때문이다. 프록시, 선언형 기능, 메타데이터 기반 확장의 상당수가 이 지점에 기대고 있다.

### 왜 Spring은 이렇게 복잡해졌는가

더 다양한 환경, 더 많은 확장, 더 긴 하위 호환성을 동시에 감당해야 했기 때문이다. 이 책에서 만든 `spring-lite`는 같은 문제의 더 작은 축소판이다.

## Appendix D. 독자를 위한 확장 과제

### 과제 1. `HttpMessageConverter` 도입

- 목표: JSON 고정 응답/요청 처리를 더 일반적인 메시지 변환 계층으로 끌어올린다.
- 학습 포인트: MVC가 왜 콘텐츠 협상과 직렬화 전략을 따로 가지는지 이해할 수 있다.

### 과제 2. richer pointcut 모델

- 목표: 메서드 이름과 애너테이션을 넘어 더 일반적인 매칭 규칙을 만든다.
- 학습 포인트: 실제 Spring AOP가 advisor abstraction을 왜 필요로 하는지 이해할 수 있다.

### 과제 3. 정적 리소스 서빙

- 목표: `/static/**`를 클래스패스에서 제공하는 단순 리소스 핸들러를 구현한다.
- 학습 포인트: MVC가 JSON API만이 아니라 리소스 전달 파이프라인도 다뤄야 함을 이해할 수 있다.

### 과제 4. richer auto-configuration

- 목표: 조건부 등록 모델을 더 풍부하게 만들고, 설정 조합 전략을 확장한다.
- 학습 포인트: Spring Boot의 auto-configuration이 왜 강력하면서도 복잡한지 이해할 수 있다.

### 과제 5. 더 풍부한 테스트 fixture

- 목표: 데이터 초기화, 컨텍스트 캐싱 전략, reusable web fixture를 만든다.
- 학습 포인트: 테스트 지원도 프레임워크의 중요한 일부라는 사실을 더 깊게 체감할 수 있다.
