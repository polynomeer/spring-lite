# Spring Core Principles And Code Guide

이 문서는 Spring Framework의 핵심 원리를 설명하고, 그 원리가 `spring-lite`에서 어떤 코드로 구현되어 있는지 함께 연결해서 정리한 문서다. 목표는 개념을 외우는 것이 아니라, 런타임이 실제로 어떤 순서로 움직이는지 이해하는 것이다.

## 1. Spring이 해결하려는 문제

Spring의 핵심 가치는 "객체를 잘 만드는 것"이 아니라 "객체들이 협력하는 방식을 프레임워크가 관리하게 만드는 것"에 있다.

전통적인 자바 애플리케이션에서는 다음 문제가 반복된다.

- 객체 생성 책임이 비즈니스 코드 안에 섞인다.
- 의존 관계가 고정돼 테스트가 어려워진다.
- 공통 기능 로깅, 트랜잭션, 보안이 서비스 메서드 안으로 침투한다.
- 웹 요청을 메서드로 연결하는 규칙이 흩어진다.

Spring은 이를 다음 네 축으로 정리한다.

1. IoC/DI: 객체 생성과 의존 관계를 컨테이너가 관리한다.
2. Bean Lifecycle: 객체 생성 이후 초기화/후처리/소멸도 컨테이너가 관리한다.
3. AOP: 공통 관심사를 프록시로 분리한다.
4. Web MVC: HTTP 요청을 컨트롤러 메서드로 매핑한다.

`spring-lite`도 같은 축으로 구성되어 있다.

## 2. IoC와 DI

### 2.1 IoC란 무엇인가

IoC(Inversion of Control)는 제어의 역전이다. 원래 애플리케이션 코드가 직접 하던 객체 생성, 객체 연결, 생명주기 관리의 제어권을 컨테이너 쪽으로 넘기는 것이다.

Spring에서 중요한 점은 IoC가 추상 구호가 아니라 "ApplicationContext가 Bean을 등록하고 생성한다"는 매우 구체적인 런타임 동작이라는 점이다.

`spring-lite`에서는 이 역할을 [AnnotationConfigApplicationContext](../../spring-lite-context/src/main/java/lite/spring/context/support/AnnotationConfigApplicationContext.java)가 맡는다.

### 2.2 DI란 무엇인가

DI(Dependency Injection)는 의존성 주입이다. 객체가 필요한 협력 객체를 스스로 생성하지 않고, 외부에서 주입받는다.

예를 들어 `DefaultOrderService`는 `OrderRepository`를 직접 `new` 하지 않는다. 생성자를 통해 받는다. 이 구조 덕분에 구현이 바뀌어도 서비스 코드는 유지된다.

관련 코드는 [DefaultOrderService](../../example-app/src/main/java/lite/spring/example/order/DefaultOrderService.java)에 있다.

### 2.3 `spring-lite`에서 DI가 동작하는 방식

컨테이너는 다음 순서로 움직인다.

1. 설정 클래스와 스캔 대상 패키지를 등록한다.
2. 컴포넌트 후보를 찾는다.
3. 각 후보를 `BeanDefinition`으로 변환한다.
4. 생성자를 선택한다.
5. 생성자 파라미터 타입을 기준으로 의존 Bean을 다시 조회한다.
6. 필요한 Bean이 없으면 예외를 던진다.
7. 생성이 끝난 Bean을 싱글톤 캐시에 저장한다.

핵심 코드 연결:

- Bean 메타데이터: [BeanDefinition](../../spring-lite-context/src/main/java/lite/spring/context/bean/BeanDefinition.java)
- 패키지 스캔: [ClassPathScanner](../../spring-lite-context/src/main/java/lite/spring/context/scan/ClassPathScanner.java)
- Bean 이름 생성: [BeanNameGenerator](../../spring-lite-context/src/main/java/lite/spring/context/support/BeanNameGenerator.java)
- 생성자 선택/의존성 해결/Bean 생성: [AnnotationConfigApplicationContext](../../spring-lite-context/src/main/java/lite/spring/context/support/AnnotationConfigApplicationContext.java)

### 2.4 왜 `BeanDefinition`이 중요한가

Spring 계열 컨테이너는 실제 객체보다 먼저 "객체를 어떻게 만들 것인가"를 메타데이터로 관리한다. 이게 `BeanDefinition`의 역할이다.

`spring-lite`의 `BeanDefinition`은 아래 정보를 가진다.

- Bean 이름
- Bean 타입
- Bean 종류 `COMPONENT`, `CONFIGURATION`, `FACTORY_METHOD`
- 설정 클래스 정보
- 팩토리 메서드 정보

이 구조 덕분에 컨테이너는 아직 객체를 만들지 않아도, 나중에 어떤 방식으로 만들지 결정할 수 있다.

## 3. 컴포넌트 스캔과 Bean 등록

### 3.1 왜 스캔이 필요한가

Spring은 개발자가 모든 객체를 XML이나 코드로 일일이 등록하지 않게 하려고 애노테이션 기반 스캔을 도입했다.

`@Component`, `@Service`, `@Repository`, `@Controller`는 "이 타입은 컨테이너가 관리해야 한다"는 선언이다.

### 3.2 `spring-lite`의 스캔 방식

`ClassPathScanner`는 패키지 경로를 파일 시스템 디렉터리로 바꾼 뒤 `.class` 파일을 재귀적으로 탐색한다. 내부 클래스는 제외하고, 로딩 가능한 클래스만 수집한다.

이 구현은 학습용으로 단순하고 이해하기 쉽지만, 다음 제한이 있다.

- 파일 시스템 기반 클래스패스만 다룬다.
- JAR 내부 스캔은 지원하지 않는다.
- 클래스 로딩 시점 부작용을 정교하게 제어하지 않는다.

이 제한은 현재 [README.md](../../README.md)에도 문서화되어 있다.

### 3.3 메타 애노테이션 처리

실제 Spring에서 중요한 포인트는 애노테이션을 직접만 보지 않는다는 점이다. 예를 들어 `@Service`는 결국 `@Component`의 한 변형이다.

`spring-lite`에서도 [AnnotationUtils](../../spring-lite-context/src/main/java/lite/spring/context/support/AnnotationUtils.java)가 메타 애노테이션을 따라가며 관리 대상인지 판단한다.

이 때문에 `@MiniSpringBootApplication`처럼 여러 애노테이션을 합성한 경우도 컨테이너가 정상적으로 읽을 수 있다.

## 4. Bean Lifecycle

Spring에서 Bean은 단순히 생성만 되는 것이 아니다. 생성 이후 초기화, 후처리, 소멸까지 전부 라이프사이클에 포함된다.

### 4.1 라이프사이클 단계

`spring-lite` 기준으로 한 Bean의 흐름은 아래와 같다.

```text
BeanDefinition 등록
-> 생성자 선택
-> 의존성 해결
-> 인스턴스 생성
-> BeanPostProcessor before
-> @PostConstruct 호출
-> BeanPostProcessor after
-> 싱글톤 캐시 저장
-> 종료 시 @PreDestroy / AutoCloseable close
```

핵심 로직은 [AnnotationConfigApplicationContext](../../spring-lite-context/src/main/java/lite/spring/context/support/AnnotationConfigApplicationContext.java)에 들어 있다.

### 4.2 `@Configuration`과 `@Bean`

Spring은 클래스 단위 컴포넌트만 관리하는 것이 아니라, 설정 클래스의 메서드를 통해 Bean을 등록할 수 있게 한다.

`spring-lite`에서는 다음 흐름으로 구현했다.

1. `@Configuration` 클래스 자체를 먼저 Bean으로 만든다.
2. 그 클래스의 메서드 중 `@Bean`이 붙은 메서드를 탐색한다.
3. 메서드 반환 타입과 메서드 정보를 이용해 `FACTORY_METHOD` 타입 `BeanDefinition`을 등록한다.
4. 해당 Bean이 필요해지면 설정 클래스 인스턴스를 가져와 팩토리 메서드를 호출한다.

이 구조는 `AppConfig` 같은 설정 클래스를 가능하게 만든다.

관련 코드는 [AppConfig](../../example-app/src/main/java/lite/spring/example/config/AppConfig.java)에 있다.

### 4.3 `BeanPostProcessor`의 역할

Spring의 강력함은 "Bean을 만든 뒤 가로채서 바꿀 수 있다"는 확장 지점에 있다. `BeanPostProcessor`가 바로 그 지점이다.

실제 Spring의 AOP, 트랜잭션, 프레임워크 확장도 이 구조를 많이 활용한다.

`spring-lite`의 `BeanPostProcessor` 인터페이스는 [BeanPostProcessor](../../spring-lite-context/src/main/java/lite/spring/context/factory/BeanPostProcessor.java)에 있고, 트랜잭션 프록시 적용 구현은 [TransactionalBeanPostProcessor](../../spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionalBeanPostProcessor.java)에 있다.

## 5. 싱글톤과 컨테이너 캐시

Spring 기본 스코프는 싱글톤이다. 여기서 말하는 싱글톤은 JVM 전체에서 하나라는 뜻보다, "컨테이너당 하나"라는 의미에 가깝다.

`spring-lite`에서는 `singletons` 맵이 그 역할을 한다. `getBean()`이 호출되면 먼저 캐시를 보고, 없을 때만 생성한다.

이 설계는 다음 장점을 가진다.

- 같은 타입을 여러 곳에 주입해도 동일 인스턴스를 사용한다.
- 초기화 비용을 줄일 수 있다.
- 라이프사이클 제어가 쉬워진다.

대신 현재 구현은 프로토타입 스코프나 요청 스코프를 지원하지 않는다.

## 6. 순환 참조와 생성자 주입

Spring의 어려운 주제 중 하나가 순환 참조다. A가 B를 필요로 하고, B가 다시 A를 필요로 하면 단순 생성자 주입에서는 끊기지 않는다.

`spring-lite`는 이 문제를 우회적으로 해결하지 않고, 현재 단계에서는 명시적으로 실패시킨다. `beansInCreation` 집합으로 생성 중인 Bean을 추적하고, 같은 Bean을 다시 만들려 하면 예외를 던진다.

이 선택은 학습용 프레임워크로서는 합리적이다. 생성자 주입 모델이 명확해지고, 복잡한 조기 노출 early exposure 로직을 만들지 않아도 되기 때문이다.

## 7. AOP와 프록시

### 7.1 왜 AOP가 필요한가

트랜잭션, 로깅, 보안은 서비스 메서드의 핵심 도메인 로직이 아니다. 그런데 모든 메서드 안에 직접 넣기 시작하면 비즈니스 코드가 오염된다.

AOP는 이런 공통 관심사를 별도 계층으로 빼고, 실제 메서드 호출 직전에 끼워 넣는 방식이다.

### 7.2 Spring에서 프록시가 중요한 이유

Spring AOP의 핵심은 "대상 객체를 직접 호출하지 않고 프록시를 통해 호출한다"는 점이다. 프록시는 대상 객체를 감싸고 있다가, 메서드 호출 전후에 부가 로직을 실행한다.

`spring-lite`도 같은 전략을 쓴다.

- 프록시 생성: [ProxyFactory](../../spring-lite-aop/src/main/java/lite/spring/aop/support/ProxyFactory.java)
- 메서드 인터셉터 계약: [MethodInterceptor](../../spring-lite-aop/src/main/java/lite/spring/aop/MethodInterceptor.java)
- 호출 컨텍스트: [MethodInvocation](../../spring-lite-aop/src/main/java/lite/spring/aop/MethodInvocation.java)

### 7.3 `spring-lite`의 프록시 동작

`ProxyFactory`는 대상 객체가 구현한 인터페이스 목록을 가져와 JDK 동적 프록시를 만든다. 인터셉터가 여러 개라면 체인처럼 순서대로 실행하고, 마지막에 실제 타깃 메서드를 호출한다.

이 설계의 의미는 다음과 같다.

- 인터페이스 기반 서비스에는 간단하고 명확하다.
- CGLIB 없이도 자바 표준만으로 AOP 개념을 설명할 수 있다.
- 대신 인터페이스가 없는 클래스에는 프록시를 만들지 못한다.

이 제한 때문에 `spring-lite`에서는 서비스 계층 인터페이스를 두는 방식이 자연스럽다. `OrderService` / `DefaultOrderService` 구조가 그 예다.

## 8. 선언적 트랜잭션

### 8.1 `@Transactional`의 핵심 개념

Spring의 선언적 트랜잭션은 "메서드에 애노테이션만 붙이면 프레임워크가 트랜잭션 경계를 열고 닫는다"는 것이다.

중요한 포인트는 메서드 자체가 트랜잭션을 시작하는 것이 아니라, 그 메서드를 감싼 프록시가 시작한다는 점이다.

### 8.2 `spring-lite`에서의 동작 순서

1. 컨테이너가 Bean을 생성한다.
2. `TransactionalBeanPostProcessor`가 `@Transactional`이 붙은 Bean 또는 메서드를 찾는다.
3. 대상이 맞으면 프록시를 생성해 원래 Bean 대신 반환한다.
4. 이후 사용자는 프록시를 호출하게 된다.
5. 프록시는 `transactionManager.begin()` 호출 후 실제 메서드를 실행한다.
6. 성공하면 `commit()`, 예외가 나면 `rollback()` 한다.

핵심 코드는 [TransactionalBeanPostProcessor](../../spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionalBeanPostProcessor.java)에 있다.

### 8.3 `TransactionManager`

`TransactionManager`는 현재 스레드에 연결된 JDBC `Connection`을 `ThreadLocal`로 보관한다.

관련 코드는 [TransactionManager](../../spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionManager.java)에 있다.

핵심 동작은 다음과 같다.

- `begin()`: 커넥션을 얻고 `autoCommit=false`로 전환
- `commit()`: 커밋 후 정리
- `rollback()`: 롤백 후 정리
- `currentConnection()`: 현재 트랜잭션 커넥션 조회

이 구조는 Spring의 `TransactionSynchronizationManager`보다 훨씬 단순하지만, "현재 실행 흐름에 트랜잭션 자원을 묶는다"는 핵심 개념은 같다.

## 9. JDBC 추상화

### 9.1 왜 `JdbcTemplate`이 필요한가

순수 JDBC는 반복 코드가 많다.

- 커넥션 획득
- `PreparedStatement` 생성
- 파라미터 바인딩
- `ResultSet` 순회
- 예외 처리
- 자원 해제

Spring의 `JdbcTemplate`은 이 반복을 템플릿 메서드 형태로 감춘다.

### 9.2 `spring-lite`의 `JdbcTemplate`

구현은 [JdbcTemplate](../../spring-lite-jdbc/src/main/java/lite/spring/jdbc/JdbcTemplate.java)에 있다.

핵심 포인트는 두 가지다.

1. 트랜잭션이 없으면 `DataSource`에서 새 커넥션을 얻는다.
2. 트랜잭션이 있으면 `TransactionManager.currentConnection()`을 재사용한다.

`SingleConnectionProxy`는 트랜잭션 중인 커넥션을 `try-with-resources` 안에서 안전하게 다루기 위한 어댑터다. `close()`를 무시해서, 템플릿 코드가 커넥션을 닫아버리지 않게 한다.

관련 코드는 [SingleConnectionProxy](../../spring-lite-jdbc/src/main/java/lite/spring/jdbc/SingleConnectionProxy.java)에 있다.

## 10. Web MVC

### 10.1 MVC의 핵심 개념

Spring MVC는 HTTP 요청을 컨트롤러 메서드로 보내는 디스패치 파이프라인이다. 핵심은 "URL 하나당 함수 하나"가 아니라, 중간에 매핑과 바인딩 계층이 존재한다는 점이다.

전형적인 흐름은 아래와 같다.

```text
HTTP Request
-> Dispatcher
-> Handler Mapping
-> Argument Resolution
-> Controller Method Invocation
-> Return Value Handling
-> HTTP Response
```

`spring-lite`는 이 흐름을 [DispatcherServlet](../../spring-lite-web/src/main/java/lite/spring/web/support/DispatcherServlet.java) 안에 단순화해서 담고 있다.

### 10.2 핸들러 발견

컨테이너에서 관리 중인 전체 Bean을 조회한 뒤, `@RestController`가 붙은 Bean만 골라낸다. 그런 다음 메서드를 훑어서 `@GetMapping`, `@PostMapping`을 수집한다.

실제 Spring에서는 `RequestMappingHandlerMapping`, `HandlerMethod`, `HandlerAdapter`로 더 정교하게 분리돼 있지만, `spring-lite`는 이해를 위해 한 클래스에 응축했다.

### 10.3 경로 매핑

`/orders/{id}` 같은 패턴은 정규식으로 변환된다. 요청이 들어오면 HTTP 메서드와 정규식을 함께 비교해서 맞는 핸들러를 찾는다.

이 구조는 "URL 문자열 비교"를 넘어서 "템플릿을 런타임 매처로 바꾸는 과정"이 필요하다는 점을 보여준다.

### 10.4 파라미터 바인딩

`DispatcherServlet`은 메서드 파라미터를 보고 다음 규칙으로 인자를 만든다.

- `@PathVariable`: 경로 변수에서 추출
- `@RequestParam`: 쿼리 스트링에서 추출
- `@RequestBody`: 요청 본문 JSON 파싱 후 바인딩
- `HttpExchange`: 원시 HTTP 객체 직접 주입

이 아이디어는 실제 Spring의 `HandlerMethodArgumentResolver`와 대응된다.

### 10.5 JSON 직렬화/역직렬화

`spring-lite`는 학습용으로 자체 JSON 매퍼를 구현했다.

- 직렬화: [JsonMapper](../../spring-lite-web/src/main/java/lite/spring/web/json/JsonMapper.java)
- 파싱: [JsonParser](../../spring-lite-web/src/main/java/lite/spring/web/json/JsonParser.java)

현재 구현은 다음 범위를 다룬다.

- 문자열, 숫자, 불리언, null
- `Map`
- `Collection`
- record 기반 DTO
- 단순 POJO 필드 직렬화

이는 Spring의 `HttpMessageConverter`보다 단순하지만, "컨트롤러 반환값을 HTTP 응답 바디로 변환한다"는 핵심 개념은 충분히 보여준다.

## 11. Bootstrapping

### 11.1 Spring Boot의 핵심 아이디어

Spring Boot의 중요한 가치는 애플리케이션 실행을 간결하게 만드는 것이다.

- 설정 클래스 하나로 시작
- 컴포넌트 스캔 자동화
- 웹 서버 자동 기동
- 기본 설정 자동화

### 11.2 `spring-lite`의 부트스트랩

`spring-lite`에서는 [MiniSpringApplication](../../spring-lite-boot/src/main/java/lite/spring/boot/MiniSpringApplication.java)이 이 역할을 맡는다.

흐름은 아래와 같다.

1. `AnnotationConfigApplicationContext` 생성
2. 애플리케이션 클래스 기준 스캔/Bean 생성
3. `DispatcherServlet` 생성
4. `application.yml`에서 포트 읽기
5. JDK `HttpServer` 시작
6. 모든 요청을 DispatcherServlet로 연결

`@MiniSpringBootApplication`은 설정과 스캔을 합친 합성 애노테이션이다. 관련 코드는 [MiniSpringBootApplication](../../spring-lite-boot/src/main/java/lite/spring/boot/annotation/MiniSpringBootApplication.java)에 있다.

### 11.3 설정 로딩

현재 `application.yml` 파서는 아주 가볍다. [ApplicationProperties](../../spring-lite-boot/src/main/java/lite/spring/boot/support/ApplicationProperties.java)가 YAML을 단순 계층 키로 읽는다.

이 역시 실제 Spring Boot의 강력한 `Environment`/`Binder`와 비교하면 축소 구현이지만, 외부 설정이 런타임에 반영된다는 구조 자체는 보여준다.

## 12. 예제 앱으로 보는 전체 흐름

예제 앱은 `OrderController -> OrderService -> OrderRepository`의 전형적인 계층형 구조를 갖는다.

관련 코드는 아래에 있다.

- 진입점: [ExampleApplication](../../example-app/src/main/java/lite/spring/example/ExampleApplication.java)
- 설정: [AppConfig](../../example-app/src/main/java/lite/spring/example/config/AppConfig.java)
- 컨트롤러: [OrderController](../../example-app/src/main/java/lite/spring/example/order/OrderController.java)
- 서비스: [DefaultOrderService](../../example-app/src/main/java/lite/spring/example/order/DefaultOrderService.java)
- 저장소: [InMemoryOrderRepository](../../example-app/src/main/java/lite/spring/example/order/InMemoryOrderRepository.java)

실행 중 요청 흐름은 아래처럼 이해하면 된다.

```text
ExampleApplication.main()
-> MiniSpringApplication.run()
-> AnnotationConfigApplicationContext refresh
-> OrderController / DefaultOrderService / Repository 생성
-> TransactionalBeanPostProcessor가 Service 프록시 적용
-> HttpServer 시작
-> /orders 요청 수신
-> DispatcherServlet가 핸들러 탐색
-> OrderController 메서드 실행
-> OrderService 프록시를 통해 @Transactional 적용
-> 결과를 JSON으로 직렬화해 응답
```

## 13. 실제 Spring과 비교했을 때의 차이

`spring-lite`는 Spring의 축소 모형이다. 핵심 원리를 보여주는 데 초점을 두고 있고, 실제 Spring과는 다음 차이가 있다.

- Bean scope, profile, condition, environment 체계가 매우 단순하다.
- 프록시는 인터페이스 기반이다.
- MVC 파이프라인이 세밀하게 분리되지 않았다.
- JSON 처리와 타입 변환이 제한적이다.
- 예외 처리, 검증, 데이터 바인딩, 메시지 컨버터 확장이 아직 없다.
- 클래스패스 스캔이 JAR 친화적이지 않다.

하지만 아래 핵심은 이미 유지된다.

- 컨테이너가 객체를 만든다.
- 의존성은 생성자 주입으로 연결된다.
- 설정 클래스와 팩토리 메서드가 지원된다.
- 후처리기를 통해 프록시가 적용된다.
- 웹 요청이 컨트롤러 메서드로 연결된다.
- 트랜잭션이 메서드 경계에 선언적으로 적용된다.

## 14. 이 문서를 읽은 뒤 추천 코드 읽기 순서

가장 이해가 잘 되는 순서는 아래다.

1. [ExampleApplication](../../example-app/src/main/java/lite/spring/example/ExampleApplication.java)
2. [MiniSpringApplication](../../spring-lite-boot/src/main/java/lite/spring/boot/MiniSpringApplication.java)
3. [AnnotationConfigApplicationContext](../../spring-lite-context/src/main/java/lite/spring/context/support/AnnotationConfigApplicationContext.java)
4. [BeanDefinition](../../spring-lite-context/src/main/java/lite/spring/context/bean/BeanDefinition.java)
5. [TransactionalBeanPostProcessor](../../spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionalBeanPostProcessor.java)
6. [ProxyFactory](../../spring-lite-aop/src/main/java/lite/spring/aop/support/ProxyFactory.java)
7. [DispatcherServlet](../../spring-lite-web/src/main/java/lite/spring/web/support/DispatcherServlet.java)
8. [JsonMapper](../../spring-lite-web/src/main/java/lite/spring/web/json/JsonMapper.java)

이 순서로 보면 "애플리케이션 시작 -> 컨테이너 생성 -> 프록시 적용 -> 웹 요청 처리"까지 한 흐름으로 이어진다.
