# Detailed Test Guide

이 문서는 `spring-lite` 테스트 코드를 읽을 때 "이 테스트가 실제로 어떤 동작을 실행하고 무엇을 검증하는가"를 상세히 따라가기 위한 해설서다. `docs/testing/test-catalog.md`가 빠른 색인이라면, 이 문서는 테스트의 의도, 런타임 시나리오, 실패 시 의심해야 할 코드 지점을 함께 설명한다.

## 1. 테스트 스위트를 읽는 관점

`spring-lite`의 테스트는 단순한 API 확인보다 "프레임워크 계약 고정"에 더 가깝다. 각 테스트는 보통 아래 네 가지 중 하나를 보호한다.

1. 컨테이너가 빈을 등록하고 조립하는 규칙
2. 프록시, 트랜잭션, MVC처럼 여러 모듈이 함께 동작할 때의 호출 순서
3. 예외나 경계 조건에서 상태 코드, 롤백, 라이프사이클이 어떻게 결정되는지
4. 실제 예제 앱이나 비교 샘플에서 사용자 흐름이 끝까지 유지되는지

이 관점으로 보면 테스트 파일 이름만 봐도 범위를 빠르게 분류할 수 있다.

- `core`: 변환, 리플렉션, 프로퍼티, 검증 같은 기반 유틸리티 계약
- `context`: 빈 정의, 스캔, 주입, 스코프, 이벤트, 라이프사이클
- `aop` / `tx`: 프록시 체인, 트랜잭션 경계, 후처리기 적용 여부
- `web`: 라우팅, 바인딩, 검증, 예외 처리, JSON 응답
- `jdbc`: SQL 실행과 트랜잭션 참여
- `boot`: 자동 조립과 애플리케이션 시작
- `test`: 테스트 전용 컨텍스트 로딩과 롤백 보장
- `example-app` / `comparison-*`: 사용자가 실제로 겪는 종단 간 시나리오

## 2. `spring-lite-core`

### `DefaultConversionServiceTest`

이 테스트는 문자열 기반 입력이 프레임워크 내부에서 어떻게 목표 타입으로 바뀌는지를 검증한다. 주로 `@Value`, `@RequestParam`, `@PathVariable`, JSON 바인딩 이후의 후속 변환이 이 서비스에 기대고 있기 때문에, 작은 변경도 전체 프레임워크에 연쇄적인 영향을 준다.

- 실행하는 동작
  - 문자열을 원시 타입, 래퍼 타입, 불리언, 숫자, enum 등으로 변환한다.
  - null 또는 빈 문자열이 들어왔을 때 허용 가능한 타입인지 확인한다.
- 검증하는 내용
  - 컨테이너와 웹 계층이 기대하는 기본 타입 변환 규칙이 유지된다.
  - enum 이름 매칭과 숫자 파싱이 안정적으로 동작한다.
- 실패가 의미하는 것
  - `@Value` 주입, 요청 파라미터 바인딩, 프로파일 기반 프로퍼티 주입 중 하나 이상이 동시에 깨질 가능성이 높다.
  - 특히 enum 변환 실패는 `PropertyResolver`나 `ArgumentResolver` 문제가 아니라 변환 서비스 자체의 회귀일 가능성이 크다.

### `ReflectionUtilsTest`

리플렉션 도우미는 생성자 선택, 필드 접근, 메서드 호출, 애너테이션 탐색의 하위 기반이다. 이 테스트는 단순 유틸리티 테스트처럼 보이지만, 실제로는 DI 컨테이너와 AOP의 안전망 역할을 한다.

- 실행하는 동작
  - private 필드/메서드 접근 보조
  - 선언 메서드/필드 탐색
  - 호출 가능한 멤버 노출 처리
- 검증하는 내용
  - 컨테이너가 접근 제어자에 막히지 않고 필요한 생성자와 필드를 읽을 수 있다.
  - 후처리기나 프록시 코드가 메서드 메타데이터를 안정적으로 얻는다.
- 실패가 의미하는 것
  - 컨테이너 초기화 중 `IllegalAccessException` 류 예외가 늘어날 수 있다.
  - 특정 테스트만이 아니라 여러 모듈에서 산발적으로 실패할 수 있다.

### `ClassUtilsTest`

클래스 유틸리티는 프록시 생성 전략, 타입 판정, 클래스 이름 처리에 사용된다. 특히 JDK 프록시와 클래스 기반 프록시를 나누는 조건을 검증하는 데 중요하다.

- 실행하는 동작
  - 인터페이스/구현 클래스 판별
  - 프록시 가능성 판단
  - 클래스명 관련 보조 연산
- 검증하는 내용
  - AOP 계층이 인터페이스 프록시를 선택해야 할 때와 클래스 프록시를 써야 할 때를 안정적으로 구분한다.
- 실패가 의미하는 것
  - `AspectBeanPostProcessorTest`, `TransactionalBeanPostProcessorTest`의 실패로 이어질 가능성이 높다.

### `PropertyResolverTest`

이 테스트는 `application.yml`, `application-{profile}.yml`, 시스템 프로퍼티, 기본값 문법이 어떤 우선순위로 합쳐지는지 검증한다. Spring Lite에서 설정 체계의 기준점 역할을 한다.

- 실행하는 동작
  - 기본 프로퍼티 로딩
  - 활성 프로파일 파일 병합
  - 시스템 프로퍼티 또는 명령행 인자 오버라이드
  - `${key:default}` 형태의 기본값 해석
- 검증하는 내용
  - 설정값 조회가 환경에 따라 예측 가능하게 동작한다.
  - 없는 키에 대해 적절한 기본값이 적용되거나 실패해야 할 지점에서 실패한다.
- 실패가 의미하는 것
  - `@Value` 주입과 Boot 프로파일 테스트가 함께 흔들린다.
  - 사용자 입장에서는 "분명 설정을 넣었는데 반영되지 않는다"는 증상으로 나타난다.

### `SimpleValidatorTest`

이 테스트는 웹 계층과 설정 객체 검증의 공통 기반인 검증기 동작을 고정한다. Spring Lite는 축소된 제약 조건 세트를 사용하므로, 지원 범위가 좁은 대신 동작을 명확히 보장해야 한다.

- 실행하는 동작
  - `@NotNull`, `@Min`, `@Size` 검증
  - 중첩 객체에 대한 `@Valid` 전파
  - 에러 경로(path) 수집
- 검증하는 내용
  - 어떤 제약이 어떤 메시지와 경로로 보고되는지
  - 중첩 객체 검증이 누락되지 않는지
- 실패가 의미하는 것
  - `DispatcherServletTest`, `ArgumentResolverTest`, 예제 앱 웹 테스트의 400 응답 포맷이 무너질 수 있다.

## 3. `spring-lite-context`

### `AnnotationConfigApplicationContextTest`

이 프로젝트에서 가장 중요한 테스트 중 하나다. 하나의 파일 안에서 DI 컨테이너의 핵심 사용 시나리오 대부분을 묶어서 검증한다. 실제로는 "빈 등록기", "생성자 주입기", "값 주입기", "스코프 관리자", "이벤트 발행기", "종료 콜백 처리기"에 대한 통합 테스트라고 보는 편이 맞다.

- 실행하는 동작
  - `@Configuration`과 `@Bean` 메서드로 빈을 등록하고 조회한다.
  - 생성자 파라미터를 기준으로 의존성을 해결한다.
  - `ApplicationContext` 자체를 의존성으로 주입한다.
  - 동일 타입 다건 조회와 단건 조회 실패를 구분한다.
  - `@Qualifier`를 이름 기반과 애너테이션 기반 두 방식으로 해석한다.
  - `@Value`를 생성자 파라미터와 필드에 주입한다.
  - 필수 설정값 누락 시 컨텍스트 생성 자체를 실패시킨다.
  - `@PreDestroy`와 `AutoCloseable` 콜백을 호출한다.
  - 프록시로 감싼 빈에도 종료 콜백이 전달되는지 확인한다.
  - 순환 의존성을 탐지한다.
  - 클래스패스 스캔과 메타 애너테이션 인식을 검증한다.
  - singleton/prototype 스코프 차이를 검증한다.
  - `ContextRefreshedEvent`, `ContextClosedEvent`를 발행한다.
  - 활성 프로파일 오버라이드와 enum 변환을 함께 검증한다.
  - `@ConditionalOnBean`, `@ConditionalOnMissingBean`의 등록 시점을 검증한다.
- 검증하는 내용
  - 컨텍스트가 "빈을 만들 수 있다" 수준이 아니라, 스프링스러운 조립 규칙을 갖고 있다는 점을 보장한다.
  - 생성, 사용, 종료까지의 전 생명주기가 정상적으로 이어진다.
- 실패가 의미하는 것
  - 가장 먼저 의심해야 하는 곳은 [AnnotationConfigApplicationContext](/Users/hammac/Projects/spring-lite/spring-lite-context/src/main/java/lite/spring/context/support/AnnotationConfigApplicationContext.java)다.
  - `@Qualifier` 관련 실패는 의존성 후보 선택 로직, `@Value` 실패는 프로퍼티 해석과 변환 서비스, destroy 콜백 실패는 원본 타깃 추적 로직을 함께 봐야 한다.
  - 이 파일이 깨지면 다른 모듈 테스트도 연쇄적으로 깨질 가능성이 매우 높다.

### `ClassPathScannerTest`

컴포넌트 스캔은 개발 중에는 파일 시스템에서, 패키징 후에는 JAR 내부에서 동작해야 한다. 이 테스트는 두 환경 차이 때문에 생기는 회귀를 막는다.

- 실행하는 동작
  - 지정 패키지 경로에서 클래스 후보를 찾는다.
  - JAR 리소스 형태로 존재하는 클래스도 스캔한다.
- 검증하는 내용
  - 로컬 개발 환경과 배포 아카이브 환경에서 스캔 결과가 달라지지 않는다.
- 실패가 의미하는 것
  - IDE에서는 되는데 패키징 후에는 `@Component` 빈이 보이지 않는 문제가 발생할 수 있다.

### `AnnotationSupportTest`

메타 애너테이션 판정은 `@Service`, `@Repository`, 커스텀 스테레오타입을 인식하는 기반이다.

- 실행하는 동작
  - 어떤 애너테이션이 다른 핵심 애너테이션을 메타 수준으로 포함하는지 탐색한다.
- 검증하는 내용
  - 직접 붙인 애너테이션뿐 아니라 간접적으로 구성된 스테레오타입도 동일하게 인식한다.
- 실패가 의미하는 것
  - 스캔은 되는데 컨테이너가 빈으로 등록하지 않는 이상 현상이 생길 수 있다.

## 4. `spring-lite-aop`

### `AspectBeanPostProcessorTest`

이 테스트는 AOP가 실제로 advice 체인을 조립하고, 그 체인이 기대한 순서로 실행되는지 검증한다. 단순히 프록시가 생기는지만 보는 것이 아니라 before, around, after-returning이 서로 어떤 순서로 관여하는지까지 고정한다.

- 실행하는 동작
  - `@Aspect` 빈을 탐지하고 대상 빈을 프록시로 감싼다.
  - `@Before`, `@Around`, `@AfterReturning` advice를 하나의 호출 체인으로 조합한다.
  - `@Order`에 따라 advice 순서를 정한다.
  - 메서드명 또는 애너테이션 기반 포인트컷이 실제 대상에만 적용되는지 확인한다.
- 검증하는 내용
  - advice가 누락되지 않고, 반환값 변경과 부수효과 기록이 기대대로 일어난다.
  - 대상 메서드에 조건이 맞지 않으면 advice가 불필요하게 적용되지 않는다.
- 실패가 의미하는 것
  - 가장 먼저 [AspectBeanPostProcessor](/Users/hammac/Projects/spring-lite/spring-lite-aop/src/main/java/lite/spring/aop/support/AspectBeanPostProcessor.java)와 프록시 팩토리, 인터셉터 정렬 로직을 봐야 한다.
  - 증상은 "AOP가 안 먹는다"일 수도 있고, 더 위험하게는 "일부만 먹는다" 또는 "순서가 뒤집혔다"일 수도 있다.

## 5. `spring-lite-tx`

### `TransactionManagerTest`

트랜잭션 테스트의 핵심은 시작/커밋/롤백 호출 여부보다 "중첩 호출에서 언제 실제 커넥션에 commit 또는 rollback이 내려가야 하는가"를 검증하는 데 있다.

- 실행하는 동작
  - 트랜잭션 시작 시 커넥션을 바인딩한다.
  - 중첩 depth를 증가시키고 내부 호출 종료 시 즉시 commit하지 않는다.
  - rollback-only 마킹 후 외부 경계 종료 시 rollback이 일어나는지 본다.
  - 테스트용 프록시 데이터소스로 commit/rollback/close 호출 횟수를 측정한다.
- 검증하는 내용
  - `REQUIRED` 전파의 기본 의미가 유지된다.
  - 내부 호출이 성공해도 외부에서 rollback-only면 최종 결과는 rollback이 된다.
- 실패가 의미하는 것
  - 데이터 정합성에 직접적인 영향을 준다.
  - [TransactionManager](/Users/hammac/Projects/spring-lite/spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionManager.java)의 depth 관리나 thread-local 정리 로직을 우선 확인해야 한다.

### `TransactionalBeanPostProcessorTest`

이 테스트는 `@Transactional`이 선언된 빈이 실제로 프록시 대상이 되는지 검증한다.

- 실행하는 동작
  - 후처리기 적용 후 대상 빈이 원본 구현체가 아닌 프록시로 노출되는지 확인한다.
  - 메서드 호출 시 트랜잭션 인터셉터가 개입하는지 본다.
- 검증하는 내용
  - 선언적 트랜잭션이 단순 애너테이션 표시에 머물지 않고 런타임 동작으로 연결된다.
- 실패가 의미하는 것
  - 서비스 계층에 `@Transactional`을 붙여도 아무 효과가 없게 된다.

### `TransactionalAspectChainTest`

이 테스트는 AOP와 트랜잭션이 동시에 적용될 때 체인이 꼬이지 않는지 본다.

- 실행하는 동작
  - 하나의 빈에 일반 AOP advice와 트랜잭션 인터셉터를 함께 적용한다.
  - 호출 순서와 최종 결과를 함께 검증한다.
- 검증하는 내용
  - 트랜잭션 인터셉터가 다른 advice 때문에 사라지거나 순서가 꼬이지 않는다.
- 실패가 의미하는 것
  - 로깅, 보안, 감사와 같은 일반 AOP를 추가하는 순간 트랜잭션이 비정상화될 수 있다.

## 6. `spring-lite-web`

### `DispatcherServletTest`

웹 계층에서 가장 넓은 범위를 덮는 통합 테스트다. 라우팅, 조건 매칭, 파라미터 추출, JSON 바인딩, 검증, 예외 처리, 응답 직렬화를 한 파일에서 확인한다.

- 실행하는 동작
  - GET 요청에 대해 path variable과 query parameter를 읽고 핸들러를 호출한다.
  - POST 요청 본문을 record 객체로 역직렬화하고 컨트롤러 메서드에 전달한다.
  - 매칭되는 핸들러가 없을 때 404를 반환한다.
  - `IllegalArgumentException`을 400으로 변환한다.
  - 컨트롤러 내부 `@ExceptionHandler`를 우선 적용한다.
  - `ResponseEntity`의 상태 코드, 헤더, 본문을 응답으로 반영한다.
  - 본문이 없는 204 응답을 올바르게 처리한다.
  - `params`, `headers`, `consumes`, `produces` 조건으로 서로 다른 핸들러를 선택한다.
  - URL 디코딩된 요청 파라미터 조건을 판정한다.
  - `@Valid`가 붙은 요청 본문과 요청 파라미터를 검증하고 400 에러 본문을 만든다.
  - 검증 통과 시 정상 응답으로 이어진다.
- 검증하는 내용
  - DispatcherServlet이 단순 라우터가 아니라 HTTP 요청을 프레임워크 내부 호출 모델로 변환하는 중심 오케스트레이터라는 점을 고정한다.
  - 상태 코드와 응답 포맷이 에러/성공 모두에서 일관된다.
- 실패가 의미하는 것
  - [DispatcherServlet](/Users/hammac/Projects/spring-lite/spring-lite-web/src/main/java/lite/spring/web/support/DispatcherServlet.java), 핸들러 매핑, 인자 해석기, 예외 해석기 중 최소 하나가 깨졌다는 뜻이다.
  - 404 관련 실패는 매핑 조건 계산, 400 관련 실패는 검증 또는 예외 해석, 응답 헤더 실패는 반환값 처리기를 우선 의심하면 된다.

### `ArgumentResolverTest`

이 테스트는 DispatcherServlet 안에서도 특히 메서드 인자 준비 단계만 따로 떼어 고정한다.

- 실행하는 동작
  - `@PathVariable`, `@RequestParam`, `@RequestBody` 값을 메서드 파라미터에 바인딩한다.
  - 문자열 입력을 숫자/불리언/enum 등으로 변환한다.
  - `@Valid` 적용 시 검증 오류를 수집한다.
- 검증하는 내용
  - 컨트롤러 메서드 시그니처가 곧 계약이라는 점을 유지한다.
  - 요청 데이터가 컨트롤러에 들어오기 전에 필요한 변환과 검증이 끝난다.
- 실패가 의미하는 것
  - 라우팅은 맞는데 컨트롤러 호출 직전에 터지는 문제로 나타난다.

### `DefaultExceptionResolverTest`

예외 해석 순서는 웹 프레임워크에서 자주 깨지는 지점이다. 이 테스트는 로컬 핸들러와 전역 핸들러의 우선순위를 고정한다.

- 실행하는 동작
  - 컨트롤러 내부 `@ExceptionHandler`가 있는 경우 이를 우선 사용한다.
  - 없으면 `@ControllerAdvice` 전역 처리기로 위임한다.
  - 처리 불가 예외는 기본 에러 응답 규칙으로 보낸다.
- 검증하는 내용
  - 예외 처리 범위가 예측 가능하다.
  - 같은 예외라도 로컬 처리기가 있으면 전역 처리기가 덮어쓰지 않는다.
- 실패가 의미하는 것
  - 사용자 정의 예외 응답 정책이 컨트롤러마다 달라지거나 전역 정책이 먹지 않게 된다.

### `JsonMapperTest`

JSON 직렬화/역직렬화는 웹 계층의 가장 아래쪽 계약이다.

- 실행하는 동작
  - 단순 객체, record, 컬렉션 같은 구조를 JSON으로 직렬화한다.
  - JSON 문자열을 자바 객체로 역직렬화한다.
- 검증하는 내용
  - 요청 본문과 응답 본문이 동일한 JSON 규칙을 공유한다.
- 실패가 의미하는 것
  - 웹 테스트가 광범위하게 실패할 수 있지만, 실제 원인은 MVC가 아니라 JSON 매퍼일 수 있다.

### `JsonReturnValueHandlerTest`

컨트롤러 반환값을 HTTP 응답으로 쓰는 마지막 단계를 검증한다.

- 실행하는 동작
  - 객체 반환값을 JSON 문자열로 쓰고 콘텐츠 타입을 설정한다.
  - 비어 있는 응답 처리 여부를 확인한다.
- 검증하는 내용
  - 컨트롤러가 객체를 반환하면 사용자가 HTTP 응답 본문으로 받게 되는 변환 규칙이 유지된다.
- 실패가 의미하는 것
  - 컨트롤러 로직은 정상인데 응답 형식만 이상해질 수 있다.

## 7. `spring-lite-jdbc`

### `JdbcTemplateTest`

이 테스트는 JDBC 저수준 보일러플레이트를 `JdbcTemplate`이 올바르게 감추는지 검증한다.

- 실행하는 동작
  - `update`, `query`, `queryForObject` 흐름을 실행한다.
  - `RowMapper`가 결과 집합을 원하는 객체로 바꾸는지 확인한다.
  - 내부 JDBC 예외가 프레임워크 예외로 감싸지는지 확인한다.
- 검증하는 내용
  - 연결 획득, statement 준비, 결과 순회, 자원 반환이 표준화돼 있다.
- 실패가 의미하는 것
  - 데이터 접근 코드가 반복적으로 깨지거나 자원 누수가 생길 수 있다.

### `JdbcIntegrationTest`

단위 테스트 수준의 더블이 아니라 실제 H2 데이터베이스를 사용해 JDBC와 트랜잭션 계층이 맞물리는지 본다.

- 실행하는 동작
  - 실제 테이블 생성, 삽입, 조회를 수행한다.
  - 트랜잭션 문맥 안에서 같은 커넥션이 재사용되는지 확인한다.
- 검증하는 내용
  - `TransactionManager`와 `JdbcTemplate`의 연결이 추상 설계 수준이 아니라 실제 JDBC 환경에서도 성립한다.
- 실패가 의미하는 것
  - 트랜잭션은 시작됐다고 보이는데 실제 SQL은 별도 커넥션에서 실행되는 치명적 문제가 숨어 있을 수 있다.

## 8. `spring-lite-boot`

### `SpringLiteApplicationTest`

이 테스트는 Boot 계층이 여러 모듈을 자동으로 조립하는지 본다. 실제로는 "자동 설정 통합 테스트"에 가깝다.

- 실행하는 동작
  - `SpringLiteApplication.run()`으로 애플리케이션을 부팅한다.
  - 트랜잭션 인프라, AOP 후처리기, DispatcherServlet, WebServerFactory, WebServer가 자동 등록되는지 본다.
  - 사용자 정의 `JsonMapper`가 있으면 기본 빈이 물러나는지 확인한다.
  - `DataSource`가 있을 때만 `JdbcTemplate`이 등록되는지 검증한다.
  - `@ConditionalOnClass`, `@ConditionalOnProperty`가 애플리케이션 빈에도 적용되는지 확인한다.
  - 사용자 정의 `WebServer` 빈이 있으면 이를 우선 사용하는지 검증한다.
  - 명령행 인자로 들어온 프로파일과 속성 오버라이드가 bootstrap 단계부터 반영되는지 본다.
- 검증하는 내용
  - "실행 진입점 하나로 애플리케이션이 올라온다"는 사용자 경험이 보장된다.
  - 자동 등록과 사용자 커스터마이징의 우선순위가 일관된다.
- 실패가 의미하는 것
  - [SpringLiteApplication](/Users/hammac/Projects/spring-lite/spring-lite-boot/src/main/java/lite/spring/boot/SpringLiteApplication.java)과 boot 자동 설정 클래스들을 함께 확인해야 한다.
  - 증상은 보통 특정 모듈 단독 실패가 아니라 "애플리케이션이 뜨긴 뜨는데 무엇인가 빠져 있다" 형태로 나타난다.

### `ApplicationPropertiesTest`

이 테스트는 부트 계층 전용 설정 래퍼가 실제 프로퍼티 병합 규칙을 정확히 반영하는지 검증한다.

- 실행하는 동작
  - 기본 파일과 프로파일 파일을 읽어 병합한다.
  - override가 최종 조회값에 반영되는지 본다.
- 검증하는 내용
  - Boot 계층이 `PropertyResolver`의 결과를 왜곡 없이 노출한다.

### `JdkWebServerFactoryTest`

내장 JDK HTTP 서버와 웹 디스패처 연결 지점을 검증한다.

- 실행하는 동작
  - 포트 설정을 반영해 서버를 만들고 디스패처를 연결한다.
- 검증하는 내용
  - Boot와 Web 계층의 조립점이 끊어지지 않는다.
- 실패가 의미하는 것
  - 컨트롤러는 등록돼 있어도 실제 HTTP 서버가 요청을 위임하지 못할 수 있다.

## 9. `spring-lite-test`

### `SpringLiteTestExtensionTest`

이 테스트는 프레임워크 사용자 관점에서 가장 중요한 개발 경험 하나를 검증한다. 즉, 테스트 클래스에 애너테이션만 붙이면 컨텍스트와 `MockMvc`가 준비되는지 확인한다.

- 실행하는 동작
  - JUnit 5 확장이 컨텍스트를 생성한다.
  - 테스트 필드와 파라미터에 빈을 주입한다.
  - `MockMvc` 스타일 호출로 JSON POST와 검증 오류 시나리오를 실행한다.
- 검증하는 내용
  - 애플리케이션 통합 테스트를 실제 서버 없이 빠르게 작성할 수 있다.
  - 테스트 인프라가 웹 계층과 컨텍스트 계층을 올바르게 조립한다.
- 실패가 의미하는 것
  - 프레임워크는 실행되더라도 테스트 작성 경험이 크게 나빠진다.
  - 보통 [SpringLiteTestExtension](/Users/hammac/Projects/spring-lite/spring-lite-test/src/main/java/lite/spring/test/SpringLiteTestExtension.java)이나 테스트 컨텍스트 부트스트랩 로직을 확인해야 한다.

### `TransactionalSpringLiteTestExtensionTest`

테스트 간 데이터 격리를 보장하는 확장 기능을 검증한다.

- 실행하는 동작
  - 테스트 시작 전에 트랜잭션을 열고 종료 후 롤백한다.
  - 테스트 내부에서 데이터가 생성되더라도 다음 테스트에 남지 않는지 확인한다.
- 검증하는 내용
  - 반복 실행해도 테스트 순서 의존성이 줄어든다.
- 실패가 의미하는 것
  - 특정 테스트가 단독으로는 통과하지만 전체 스위트에서는 깨지는 비결정적 문제가 생길 수 있다.

## 10. `example-app`

### `ExampleApplicationTest`

이 테스트는 예제 앱의 서비스, 저장소, 정책 조합이 실제 도메인 동작으로 이어지는지 본다.

- 실행하는 동작
  - 주문 생성/조회 같은 핵심 유스케이스를 서비스 계층을 통해 실행한다.
  - JDBC 저장소와 트랜잭션 경계를 함께 통과한다.
- 검증하는 내용
  - 프레임워크 기능이 장난감 수준이 아니라 실제 애플리케이션 조립에 충분하다는 점을 보여준다.
- 실패가 의미하는 것
  - 프레임워크 코어보다 예제 앱 설정, 저장소 SQL, 서비스 조합 중 하나가 깨졌을 가능성이 있다.

### `ExampleApplicationWebTest`

사용자 요청이 HTTP 엔드포인트부터 JSON 응답까지 종단 간으로 이어지는지 검증한다.

- 실행하는 동작
  - `/orders` 계열 요청을 `MockMvc`로 호출한다.
  - 정상 주문 생성과 검증 실패 요청을 모두 실행한다.
- 검증하는 내용
  - 컨트롤러, 검증기, 서비스, 저장소, JSON 응답이 함께 기대한 결과를 만든다.
- 실패가 의미하는 것
  - 사용자 입장에서 바로 보이는 API 계약이 깨졌다는 뜻이다.

## 11. 비교 샘플 테스트

### `comparison-spring-lite-app`

이 모듈은 Spring Lite 버전의 비교 예제를 실행 가능한 형태로 고정한다.

#### `ComparisonSpringLiteDiTest`

- 실행하는 동작
  - 컨텍스트를 올리고 서비스 빈을 조회해 DI 결과를 확인한다.
- 검증하는 내용
  - DI 예제가 문서와 동일하게 동작한다.

#### `ComparisonSpringLiteWebTest`

- 실행하는 동작
  - 인사 API와 주문 API를 테스트 클라이언트로 호출한다.
- 검증하는 내용
  - 비교 문서에 실린 MVC 예제가 실제로도 실행 가능하다.

#### `ComparisonSpringLiteTransactionTest`

- 실행하는 동작
  - 실패하는 서비스 호출 후 데이터가 롤백되는지 본다.
- 검증하는 내용
  - 문서 속 `@Transactional` 설명이 코드와 일치한다.

### `comparison-spring-boot-app`

이 모듈은 동일 시나리오를 실제 Spring Boot로 검증한다. 목적은 Spring Lite의 결과가 "비슷해 보인다"가 아니라 "같은 학습 포인트를 실험할 수 있다"는 점을 보여주는 것이다.

#### `ComparisonSpringBootDiTest`

- 실행하는 동작
  - 실제 Spring 컨텍스트에서 동일한 DI 시나리오를 수행한다.
- 검증하는 내용
  - 비교 문서의 DI 대응 관계가 코드 수준에서도 유지된다.

#### `ComparisonSpringBootWebTest`

- 실행하는 동작
  - 동일한 REST 엔드포인트 시나리오를 실제 Spring MVC에서 실행한다.
- 검증하는 내용
  - 학습자가 두 프레임워크 결과를 직접 비교할 수 있다.

#### `ComparisonSpringBootTransactionTest`

- 실행하는 동작
  - 실제 Spring 트랜잭션 관리에서 rollback 동작을 검증한다.
- 검증하는 내용
  - Spring Lite의 축소 구현이 어떤 핵심 의미를 따라가고 있는지 비교 기준을 제공한다.

## 12. 샘플 시나리오 테스트

### `sample-scenarios/04-testing/spring-lite/OrderControllerTest`

이 테스트는 책과 비교 문서에서 사용하는 "Spring Lite 스타일 테스트 작성법"의 실행 예시다.

- 실행하는 동작
  - 테스트 확장과 `MockMvc`를 사용해 주문 컨트롤러를 호출한다.
- 검증하는 내용
  - 문서에 제시한 테스트 작성 패턴이 실제 코드와 일치한다.

### `sample-scenarios/04-testing/spring/GreetingApplicationTest`

실제 Spring에서도 비슷한 학습 루프를 수행할 수 있는지 보여준다.

- 실행하는 동작
  - 실제 Spring 테스트 지원으로 같은 형태의 검증을 수행한다.
- 검증하는 내용
  - Spring Lite에서 익힌 테스트 감각이 실제 Spring으로 옮겨질 수 있다.

## 13. 실패를 해석하는 실전 순서

테스트가 깨졌을 때는 파일 하나만 보고 고치기보다 계층별로 보는 편이 빠르다.

1. `core` 테스트가 깨졌다면 상위 모듈 실패는 대부분 2차 증상일 가능성이 높다.
2. `context`가 깨졌다면 DI, `@Value`, lifecycle, condition 관련 테스트를 함께 본다.
3. `aop`와 `tx`가 같이 깨지면 프록시 생성 전략과 인터셉터 체인을 먼저 확인한다.
4. `web`이 광범위하게 깨지면 라우팅보다 JSON, 검증, 인자 해석기부터 의심한다.
5. `boot`만 깨지고 하위 모듈은 정상이면 자동 등록 우선순위나 조건부 빈 로직 문제일 가능성이 높다.
6. `example-app`이나 비교 앱만 깨지면 프레임워크보다 설정, SQL, 샘플 조합 문제일 가능성이 높다.

## 14. 추천 읽기 순서

테스트를 처음부터 끝까지 읽을 필요는 없다. 학습 목적이라면 아래 순서가 가장 효율적이다.

1. `AnnotationConfigApplicationContextTest`
2. `AspectBeanPostProcessorTest`
3. `TransactionManagerTest`
4. `DispatcherServletTest`
5. `SpringLiteApplicationTest`
6. `SpringLiteTestExtensionTest`
7. `ExampleApplicationWebTest`
8. `ComparisonSpringLite*Test`와 `ComparisonSpringBoot*Test`

이 순서로 읽으면 "컨테이너 -> 프록시 -> 트랜잭션 -> 웹 -> 부트 -> 테스트 지원 -> 실제 앱 -> 실제 Spring 비교" 흐름이 자연스럽게 이어진다.
