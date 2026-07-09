# Book Outline

## 가제

`Build Your Own Spring Lite`

부제 후보:

- 스프링을 직접 만들며 IoC, Bean Lifecycle, AOP, MVC, Transaction의 핵심을 이해하는 방법
- 스프링 내부 동작을 코드로 해부하고 실무 감각까지 연결하는 구현형 안내서

## 책의 목표

이 책의 목표는 두 가지다.

1. 독자가 `spring-lite`를 직접 따라 만들거나 읽어가며 Spring Framework의 핵심 원리를 내부 구현 관점에서 이해하도록 돕는다.
2. 그 이해를 실제 Spring과 Spring Boot 실무 활용으로 연결해, 설정을 외우는 수준이 아니라 구조를 이해하고 판단할 수 있는 개발자가 되도록 돕는다.

이 책은 "Spring 사용법 입문서"가 아니라 "Spring 내부 구조를 이해하기 위한 구현형 해설서"를 지향한다.

## 대상 독자

- Spring Boot로 개발하고 있지만 내부 동작이 막연한 개발자
- `@Transactional`, `@Bean`, `DispatcherServlet`, AOP 프록시가 실제로 어떻게 동작하는지 알고 싶은 개발자
- 프레임워크 설계와 런타임 구조를 좋아하는 백엔드 개발자
- Spring 면접, 아키텍처 설계, 장애 분석에서 깊이 있는 설명이 필요한 개발자

## 비대상 독자

- 자바 문법 자체가 아직 익숙하지 않은 초급자
- Spring MVC CRUD 사용법만 빠르게 배우고 싶은 독자
- 운영용 완성 프레임워크를 만드는 튜토리얼을 기대하는 독자

## 핵심 차별점

- Spring 비슷한 API를 흉내 내는 데서 멈추지 않고, 왜 그런 구조가 필요한지까지 설명한다.
- 실제 코드 구현과 실제 Spring 구조 비교를 각 장에 함께 둔다.
- IoC, Lifecycle, AOP, MVC, JDBC, Transaction, Boot를 하나의 일관된 런타임 흐름으로 연결한다.
- 실무에서 흔히 마주치는 오해와 설정 문제를 내부 원리와 연결해 해설한다.

## 권장 독서 방식

이 책은 아래 두 가지 방식으로 읽을 수 있다.

1. 구현 중심 독서: 각 장의 코드를 따라 만들며 테스트를 통과시키는 방식
2. 구조 이해 중심 독서: 이미 완성된 `spring-lite` 코드를 읽으며 런타임 구조를 해부하는 방식

출간 시에는 각 장마다 아래 섹션을 공통으로 둔다.

- 이 장에서 해결할 문제
- 먼저 알아야 할 Spring 개념
- `spring-lite`에서 직접 구현할 구조
- 핵심 코드 해설
- 테스트로 검증하기
- 실제 Spring은 여기서 어떻게 더 확장되는가
- 실무에서 자주 만나는 오해
- 다음 장으로 연결

## 전체 구성

이 책은 총 7부 27장, 부록으로 구성한다.

---

## Part 1. 왜 Spring을 직접 만들어봐야 하는가

### Chapter 1. 프레임워크를 사용하는 사람에서 이해하는 사람으로

목표:

- 왜 Spring을 "배운다"가 아니라 "구조를 이해한다"로 접근해야 하는지 설명한다.
- 이 책에서 만들 `spring-lite`의 범위와 철학을 소개한다.

핵심 내용:

- Spring이 해결한 문제
- 프레임워크를 직접 구현해보는 학습 방식의 장점
- `spring-lite`의 모듈 구성과 최종 완성 그림
- 이 책이 다루는 것과 다루지 않는 것

### Chapter 2. Spring의 큰 그림: IoC, Lifecycle, AOP, MVC, Transaction

목표:

- 전체 구현 여정을 시작하기 전에 Spring의 5대 축을 큰 그림으로 잡는다.

핵심 내용:

- IoC/DI
- Bean lifecycle
- AOP와 프록시
- Web MVC
- JDBC와 선언적 트랜잭션
- Bootstrapping과 자동 설정

---

## Part 2. IoC 컨테이너를 직접 만든다

### Chapter 3. 첫 번째 컨테이너: BeanDefinition과 Bean Registry

목표:

- 객체보다 먼저 "객체를 어떻게 만들 것인가"를 관리하는 이유를 이해한다.

핵심 내용:

- `BeanDefinition`의 의미
- Bean 이름, 타입, 생성 전략
- 싱글톤 저장소의 최소 구조
- Spring의 `BeanFactory`와 비교

### Chapter 4. 생성자 주입과 의존성 해석

목표:

- DI의 본질이 "외부에서 주입한다"는 말보다 구체적으로 어떤 알고리즘인지 이해한다.

핵심 내용:

- 생성자 선택 규칙
- 타입 기반 의존성 탐색
- 순환 참조가 생성자 주입에서 왜 어려운가
- `NoSuchBean`, `NoUniqueBean` 같은 예외가 왜 필요한가

### Chapter 5. 컴포넌트 스캔과 메타 애너테이션

목표:

- `@Component`, `@Service`, `@Repository`가 결국 어떤 식으로 해석되는지 이해한다.

핵심 내용:

- 클래스패스 스캔
- 파일 시스템과 JAR 스캔
- 메타 애너테이션 탐색
- Bean 이름 생성 전략

### Chapter 6. `@Configuration`과 `@Bean`으로 설정 클래스를 다루기

목표:

- 클래스 기반 컴포넌트 모델과 팩토리 메서드 기반 등록 모델의 차이를 이해한다.

핵심 내용:

- 설정 클래스의 역할
- `FACTORY_METHOD` 타입 BeanDefinition
- 설정 Bean과 일반 Bean의 차이
- Spring Java Config와 비교

### Chapter 7. `@Qualifier`, `@Value`, 설정 값 주입

목표:

- 단순 타입 주입을 넘어 "선택"과 "외부 설정"이 들어오면 컨테이너가 어떻게 복잡해지는지 이해한다.

핵심 내용:

- 다중 후보 중 선택
- qualifier 해석
- placeholder 해석
- YAML 기반 최소 property resolver

### Chapter 8. Scope와 컨테이너 이벤트

목표:

- 컨테이너가 단순 팩토리가 아니라 생명주기와 이벤트를 가진 런타임이라는 점을 이해한다.

핵심 내용:

- singleton vs prototype
- refresh/close 이벤트
- `ApplicationListener`
- Spring의 더 넓은 scope 모델과 비교

---

## Part 3. Bean Lifecycle과 확장 포인트를 이해한다

### Chapter 9. Bean Lifecycle의 전체 흐름

목표:

- Bean이 생성되고 끝나는 전체 순서를 런타임 관점에서 이해한다.

핵심 내용:

- 인스턴스 생성
- 의존성 해결
- 초기화 전/후 후처리
- `@PostConstruct`, `@PreDestroy`
- destroy callback과 `AutoCloseable`

### Chapter 10. `BeanPostProcessor`: Spring 확장의 핵심 관문

목표:

- Spring의 강력함이 어디서 나오는지, 왜 거의 모든 확장이 post-processing에 기대는지 이해한다.

핵심 내용:

- BPP의 역할
- 프록시 적용 지점
- 인프라 Bean과 애플리케이션 Bean의 차이
- Spring 내부 확장 구조와의 연결

### Chapter 11. 순환 참조, 실패 전략, 그리고 설계 판단

목표:

- "왜 안 되는가"를 설명할 수 있게 한다.

핵심 내용:

- 생성자 순환 의존
- 현재 `spring-lite`의 정책
- Spring의 조기 노출과 더 복잡한 모델
- 실무에서 순환 참조를 피하는 설계 원칙

---

## Part 4. 프록시, AOP, 트랜잭션을 직접 구현한다

### Chapter 12. 프록시의 본질: 왜 Spring은 객체 대신 프록시를 반환하는가

목표:

- AOP와 트랜잭션을 이해하기 위한 전제인 프록시 모델을 명확히 이해한다.

핵심 내용:

- JDK 동적 프록시
- 클래스 기반 프록시
- `MethodInvocation`
- 인터셉터 체인

### Chapter 13. 최소 AOP 인프라 만들기

목표:

- "공통 관심사 분리"가 실제로는 어떤 계약과 호출 순서로 구현되는지 이해한다.

핵심 내용:

- `MethodInterceptor`
- `ProxyFactory`
- 인터페이스 기반/클래스 기반 프록시
- 실무에서 프록시를 의식해야 하는 이유

### Chapter 14. `@Aspect` 스타일 AOP 확장

목표:

- 선언형 AOP가 어떻게 구성되는지, 인터셉터 인프라 위에 어떤 해석 계층이 올라가는지 이해한다.

핵심 내용:

- `@Aspect`, `@Before`, `@Around`, `@AfterReturning`
- 최소 포인트컷 모델
- advisor 체인으로 가기 전 단계
- 실제 Spring AOP와 `@AspectJ` 지원 비교

### Chapter 15. `@Transactional`은 실제로 어떻게 동작하는가

목표:

- 실무에서 가장 자주 쓰는 애너테이션 중 하나인 `@Transactional`의 실제 동작 원리를 설명한다.

핵심 내용:

- 메서드 자체가 아니라 프록시가 트랜잭션을 여는 구조
- `TransactionalBeanPostProcessor`
- begin/commit/rollback 순서
- self-invocation 문제의 본질

### Chapter 16. 트랜잭션 전파와 rollback 정책

목표:

- 선언적 트랜잭션이 단순 try/catch 감싸기가 아니라 정책 시스템이라는 점을 이해한다.

핵심 내용:

- `REQUIRED`
- rollback-only 상태
- `rollbackFor`, `noRollbackFor`
- Spring의 propagation/isolation/readOnly와 비교

---

## Part 5. Web MVC를 직접 구현한다

### Chapter 17. `DispatcherServlet`과 Front Controller 패턴

목표:

- Spring MVC가 단순 라우터가 아니라 전략 객체 집합이라는 점을 이해한다.

핵심 내용:

- Front controller
- `HandlerMapping`
- `HandlerAdapter`
- `ReturnValueHandler`

### Chapter 18. 요청을 컨트롤러 메서드로 바인딩하기

목표:

- HTTP 요청이 어떻게 자바 메서드 호출로 바뀌는지 이해한다.

핵심 내용:

- `@RequestMapping`, `@GetMapping`, `@PostMapping`
- `@PathVariable`, `@RequestParam`, `@RequestBody`
- type conversion
- handler method abstraction

### Chapter 19. JSON 직렬화, 응답 모델, 예외 처리

목표:

- 컨트롤러가 값을 반환한 뒤 HTTP 응답이 만들어지는 전 과정을 설명한다.

핵심 내용:

- `JsonMapper`
- `ResponseEntity`
- `@ExceptionHandler`
- status / header / body 제어

### Chapter 20. 조건 매핑과 검증

목표:

- 실무 웹 프레임워크에서 꼭 필요한 매핑 조건과 검증 계층이 어디에 붙는지 이해한다.

핵심 내용:

- `consumes`, `produces`, `headers`, `params`
- `@Valid`, `@NotNull`, `@Min`, `@Size`
- validation failure → 400 mapping
- 실제 Spring MVC의 Bean Validation 통합과 비교

---

## Part 6. JDBC, 예제 앱, Boot 계층으로 완성한다

### Chapter 21. `JdbcTemplate`과 데이터 접근 추상화

목표:

- 반복되는 JDBC 코드를 추상화하는 이유와 템플릿 패턴의 의미를 이해한다.

핵심 내용:

- SQL 실행 템플릿
- `RowMapper`
- transaction-aware connection reuse
- Spring JDBC와 비교

### Chapter 22. 예제 앱으로 모든 계층을 연결하기

목표:

- 지금까지 만든 조각들이 실제 애플리케이션에서 어떻게 한 흐름으로 연결되는지 보여준다.

핵심 내용:

- 주문 도메인 예제
- 컨트롤러 → 서비스 → 저장소 흐름
- validation + transaction + JDBC 통합
- 테스트와 예제 앱이 갖는 학습 역할

### Chapter 23. `SpringLiteApplication`과 Bootstrapping

목표:

- 마지막으로 "실행 가능한 프레임워크"를 완성한다.

핵심 내용:

- `@SpringLiteBootApplication`
- `SpringLiteApplication.run()`
- 기본 인프라 자동 등록
- 내장 서버 구동
- Spring Boot auto-configuration과의 구조적 차이

### Chapter 24. 테스트 지원 모듈과 프레임워크 검증 전략

목표:

- 프레임워크는 왜 테스트 없이는 설명되기 어려운지 보여준다.

핵심 내용:

- `@SpringLiteTest`
- mock web testing
- 컨테이너 테스트와 통합 테스트의 역할
- 프레임워크 테스트와 애플리케이션 테스트의 차이

---

## Part 7. 실제 Spring과 실무 활용으로 연결한다

### Chapter 25. `spring-lite`와 실제 Spring Framework 비교

목표:

- 지금까지 만든 내용을 실제 Spring의 구조와 일대일 대응시켜 이해를 고정한다.

핵심 내용:

- `ApplicationContext`
- `DefaultListableBeanFactory`
- `DispatcherServlet`
- Spring AOP
- `PlatformTransactionManager`

### Chapter 26. 실무에서 이 원리를 어떻게 써먹을 것인가

목표:

- 내부 구현 지식을 실무 생산성으로 연결한다.

핵심 내용:

- `@Transactional` 오해 줄이기
- 빈 초기화/주입 문제 디버깅
- 자동 설정과 사용자 설정 충돌 이해
- MVC 요청 흐름 디버깅
- 프록시 기반 동작과 테스트 전략

### Chapter 27. `spring-lite` 이후 무엇을 더 만들 것인가

목표:

- 독자가 다음 확장 과제를 통해 더 깊이 공부할 방향을 제시한다.

핵심 내용:

- `@ControllerAdvice`
- conversion service
- advisor ordering
- 더 풍부한 auto-configuration
- 이벤트와 관측성
- profile / environment 확장

---

## 부록 구성

### Appendix A. 장별 소스 코드 맵

- 각 장에서 중심이 되는 패키지와 클래스 목록

### Appendix B. 실제 Spring 소스 읽기 가이드

- Spring Framework / Spring Boot에서 어떤 클래스부터 보면 좋은지

### Appendix C. 자주 묻는 질문

- 왜 프록시가 필요한가
- 왜 self-invocation이 문제인가
- 왜 `BeanPostProcessor`가 중요한가
- 왜 Spring은 이렇게 복잡해졌는가

### Appendix D. 독자를 위한 확장 과제

- 현재 `spring-lite`에 없는 기능을 직접 구현해보는 연습 문제

## 출간용 편집 메모

출간 단계에서 특히 신경 써야 할 점은 아래와 같다.

1. 각 장은 "개념 설명"과 "코드 구현"의 비중을 균형 있게 맞춰야 한다.
2. 실제 Spring 비교는 각 장 끝에 짧게 두고, 별도 심화 비교 장에서 다시 정리하는 구조가 좋다.
3. 코드 블록은 가능한 한 독자가 직접 따라 입력 가능한 크기로 분할해야 한다.
4. 테스트 코드는 단순 검증이 아니라 "왜 이 실패를 막는가"까지 설명해야 한다.
5. 후반부 실무 장은 사용법 나열보다 "원리를 알면 무엇을 더 잘 판단할 수 있는가"에 집중해야 한다.

## 요약 판단

현재 `spring-lite`를 기준으로 한 책은 충분히 출간 가능한 주제를 가진다. 가장 적합한 방향은 "직접 구현하며 Spring 내부 구조를 이해하는 책"이며, 이 문서의 목차는 그 목적에 맞춘 1차 출간용 설계안이다.
