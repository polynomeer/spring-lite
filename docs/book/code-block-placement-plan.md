# Code Block Placement Plan

## 문서 목적

이 문서는 [책 전체 완성 원고](./complete-manuscript.md)를 출간 편집본으로 옮길 때, 각 장에 어떤 코드 블록을 어디에 삽입할지 세분화한 배치 계획이다. 목표는 아래 세 가지다.

- 설명 직후 바로 대응 코드를 보여준다.
- 블록 크기를 과하게 키우지 않는다.
- 테스트 코드를 "부록"이 아니라 본문 증거로 활용한다.

## 편집 공통 원칙

- 장당 코드 블록 권장 수: 4~8개
- 블록 길이 권장: 8~35줄
- 하나의 블록에는 하나의 메시지만 담는다.
- 긴 클래스 전체를 싣지 말고, 책임 경계 기준으로 잘라 싣는다.
- 가능하면 "구현 코드 2~3개 + 테스트 코드 1~2개 + 비교/의사코드 1개" 리듬을 유지한다.

## 블록 전후 캡션 원칙

- 각 코드 블록 바로 앞에는 "이 블록에서 무엇을 볼지"를 1~2문장으로 먼저 적는다.
- 블록 직후에는 가능하면 "이 코드가 앞 문단의 어떤 주장과 연결되는지"를 한 문장으로 닫는다.
- 구현 블록은 책임, 분기점, 예외 조건 중 최소 하나를 미리 예고한다.
- 테스트 블록은 무엇을 검증하는지와 왜 그 검증이 중요한지 먼저 적는다.
- 비교적 긴 블록은 "이 메서드를 통째로 보는 이유"를 먼저 설명한다.
- 같은 장 안에서는 "설명 -> 코드 -> 해석" 리듬이 반복되도록 유지한다.

## Part 1

### Chapter 1

- 삽입 위치 1:
  "현재 저장소는 다음과 같은 모듈로 구성되어 있다." 문단 뒤
- 블록 내용:
  `settings.gradle.kts`의 `include(...)` 일부
- 목적:
  독자가 책의 실습 범위를 저장소 구조와 바로 연결하도록 돕는다.

- 삽입 위치 2:
  "이 책에서 만들 `spring-lite`는 학습용 경량 프레임워크다." 문단 뒤
- 블록 내용:
  `README.md`의 구현 기능 요약 일부
- 목적:
  책이 다루는 범위를 한눈에 고정한다.

### Chapter 2

- 삽입 위치 1:
  "애플리케이션은 대략 다음 순서로 올라온다." 목록 뒤
- 블록 내용:
  `SpringLiteApplication.run()` 핵심 흐름 의사코드
- 목적:
  전체 실행 순서를 도표와 텍스트 사이에서 코드 수준으로 연결한다.

- 삽입 위치 2:
  시퀀스 다이어그램 뒤
- 블록 내용:
  `example-app`의 `OrderController -> OrderService -> OrderRepository` 최소 경로
- 목적:
  큰 그림이 실제 코드 호출로 이어진다는 점을 보여준다.

## Part 2

### Chapter 3

- 삽입 위치 1:
  "컨테이너가 실제로 먼저 관리하는 것은 객체가 아니다." 문단 뒤
- 블록 내용:
  `BeanDefinition` 레코드/핵심 필드
- 목적:
  메타데이터 개념을 가장 먼저 코드로 고정한다.

- 삽입 위치 2:
  "빈 정의 등록소 / 싱글톤 캐시" 설명 뒤
- 블록 내용:
  `AnnotationConfigApplicationContext`의 `beanDefinitions`, `singletons` 필드와 `getBean()`
- 목적:
  등록소와 캐시 분리를 구조적으로 보여준다.

- 삽입 위치 3:
  장 마무리 직전
- 블록 내용:
  `AnnotationConfigApplicationContextTest`의 이름/타입 조회 테스트 일부
- 목적:
  설계가 테스트로 어떤 계약을 가지는지 보여준다.

### Chapter 4

- 삽입 위치 1:
  "DI는 해석 알고리즘이다." 문단 뒤
- 블록 내용:
  `selectConstructor()` 일부
- 목적:
  생성자 선택 규칙을 명시한다.

- 삽입 위치 2:
  "파라미터 타입마다 후보 빈을 탐색한다." 문단 뒤
- 블록 내용:
  `resolveDependency()` 일부
- 목적:
  타입 탐색, qualifier, 예외 전략을 한 블록으로 보여준다.

- 삽입 위치 3:
  "건강한 실패 전략이다." 문단 뒤
- 블록 내용:
  `NoSuchBeanException`, `NoUniqueBeanException`가 발생하는 테스트
- 목적:
  실패 정책을 설명이 아니라 증거로 제시한다.

### Chapter 5

- 삽입 위치 1:
  "클래스패스를 스캔해 이를 자동 등록한다." 문단 뒤
- 블록 내용:
  `ClassPathScanner.scan(...)` 골격
- 목적:
  스캔이 실제로 어떤 반복 구조를 갖는지 보여준다.

- 삽입 위치 2:
  "메타 애너테이션 탐색" 문단 뒤
- 블록 내용:
  `AnnotationUtils.hasAnnotation(...)` 또는 관련 메서드
- 목적:
  `@Service`가 `@Component`처럼 동작하는 근거를 보여준다.

- 삽입 위치 3:
  JAR 스캔 설명 뒤
- 블록 내용:
  JAR fixture 기반 테스트 일부
- 목적:
  단순 파일 시스템 스캔이 아니라는 점을 증명한다.

### Chapter 6

- 삽입 위치 1:
  "팩토리 메서드 빈은 설정 빈을 먼저 만들고" 문단 뒤
- 블록 내용:
  `registerBeanMethods()` 일부
- 목적:
  `@Bean` 메서드가 어떻게 `BeanDefinition`으로 바뀌는지 보여준다.

- 삽입 위치 2:
  "팩토리 메서드 빈은 설정 빈을 먼저 만들고" 문단 뒤 두 번째 블록
- 블록 내용:
  `invokeFactoryMethod()` 일부
- 목적:
  클래스 생성과 팩토리 메서드 생성의 차이를 분명히 한다.

### Chapter 7

- 삽입 위치 1:
  `@Qualifier` 설명 뒤
- 블록 내용:
  `resolveQualifiedDependency()` 일부
- 목적:
  같은 타입 다중 후보 해석 규칙을 보여준다.

- 삽입 위치 2:
  "`@Value`는 또 다른 차원의 확장" 문단 뒤
- 블록 내용:
  `PropertyResolver.resolveRequiredPlaceholder(...)`
- 목적:
  placeholder 해석 규칙을 분명히 한다.

- 삽입 위치 3:
  profile 설명을 보강하는 위치
- 블록 내용:
  `PropertyResolver.loadApplicationProperties()` 일부
- 목적:
  기본 설정과 profile override 병합 규칙을 보여준다.

- 삽입 위치 4:
  장 마무리 직전
- 블록 내용:
  enum 변환과 profile override를 검증하는 테스트 일부
- 목적:
  공통 `ConversionService`의 의미를 테스트로 닫는다.

### Chapter 8

- 삽입 위치 1:
  scope 설명 뒤
- 블록 내용:
  `@Scope("prototype")` 처리 코드 일부
- 목적:
  singleton/prototype 차이를 구현 관점으로 보여준다.

- 삽입 위치 2:
  이벤트 설명 뒤
- 블록 내용:
  `publishEvent(...)`와 listener generic 검사 일부
- 목적:
  컨텍스트 이벤트가 어떻게 전달되는지 보여준다.

- 삽입 위치 3:
  장 말미
- 블록 내용:
  refresh/close 이벤트 테스트
- 목적:
  런타임적 성격을 증명한다.

## Part 3

### Chapter 9

- 삽입 위치 1:
  라이프사이클 설명 직후
- 블록 내용:
  `initializeBean(...)` 전체 골격
- 목적:
  후처리기, `@PostConstruct`, destroy callback 등록 순서를 한 블록으로 보여준다.

- 삽입 위치 2:
  파괴 설명 뒤
- 블록 내용:
  `registerDestroyCallback(...)`과 `close()` 일부
- 목적:
  종료 시점 처리를 설명한다.

### Chapter 10

- 삽입 위치 1:
  "후처리기는 초기화 전과 후 두 단계" 문단 뒤
- 블록 내용:
  `BeanPostProcessor` 인터페이스
- 목적:
  확장 계약을 최소 형태로 보여준다.

- 삽입 위치 2:
  "트랜잭션과 AOP는 둘 다 이 단계에서" 문단 뒤
- 블록 내용:
  BPP 등록/정렬 코드 일부
- 목적:
  확장이 컨테이너 내부 빈으로 조립된다는 점을 보여준다.

### Chapter 11

- 삽입 위치 1:
  순환 참조 설명 뒤
- 블록 내용:
  `beansInCreation` 검사와 예외 발생 코드
- 목적:
  순환 참조 실패 정책을 한눈에 보여준다.

- 삽입 위치 2:
  장 말미
- 블록 내용:
  순환 참조 테스트
- 목적:
  "왜 안 되는가"를 테스트로 닫는다.

## Part 4

### Chapter 12

- 삽입 위치 1:
  프록시 종류 설명 뒤
- 블록 내용:
  `ProxyFactory.createProxy(...)` 상단부
- 목적:
  인터페이스 프록시와 클래스 프록시 분기점을 보여준다.

- 삽입 위치 2:
  `MethodInvocation` 설명 뒤
- 블록 내용:
  `SimpleMethodInvocation.proceed()`
- 목적:
  인터셉터 체인의 핵심 호출 구조를 보여준다.

### Chapter 13

- 삽입 위치 1:
  "`MethodInterceptor`는 그 계약의 최소 형태다." 문단 뒤
- 블록 내용:
  `MethodInterceptor` 인터페이스
- 목적:
  계약 자체를 고정한다.

- 삽입 위치 2:
  ordered chain 설명 뒤
- 블록 내용:
  `OrderUtils` + interceptor merge/정렬 일부
- 목적:
  여러 공통 관심사가 함께 붙을 때 순서가 어떻게 결정되는지 보여준다.

- 삽입 위치 3:
  장 마무리 직전
- 블록 내용:
  ordered aspect + transaction chain 테스트 일부
- 목적:
  설명한 체인이 실제로 합성된다는 증거를 제시한다.

### Chapter 14

- 삽입 위치 1:
  선언형 AOP 설명 뒤
- 블록 내용:
  `AdviceDescriptor` 생성부 일부
- 목적:
  애너테이션 선언이 내부 메타데이터로 바뀌는 과정을 보여준다.

- 삽입 위치 2:
  "ordered interceptor를 만든다." 문단 뒤
- 블록 내용:
  `toInterceptor(...)` 또는 `OrderedAdviceInterceptor`
- 목적:
  advice 타입별 동작 차이를 보여준다.

### Chapter 15

- 삽입 위치 1:
  "`@Transactional`은 ... 프록시가 메서드 호출 경로를 감싼다." 문단 뒤
- 블록 내용:
  `TransactionalBeanPostProcessor.postProcessAfterInitialization(...)`
- 목적:
  대상 빈 판별과 프록시 적용 위치를 보여준다.

- 삽입 위치 2:
  트랜잭션 경계 설명 뒤
- 블록 내용:
  `TransactionInterceptor.invoke(...)`
- 목적:
  begin/commit/rollback 흐름을 코드로 고정한다.

- 삽입 위치 3:
  self-invocation 설명 뒤
- 블록 내용:
  self-invocation 주석 예제 코드
- 목적:
  개념을 실무 코드 상황으로 연결한다.

### Chapter 16

- 삽입 위치 1:
  `REQUIRED` 설명 뒤
- 블록 내용:
  `TransactionManager.begin()/commit()/rollback()`의 depth, rollbackOnly 관련 부분
- 목적:
  전파와 중첩 호출 정책을 구현 수준에서 보여준다.

- 삽입 위치 2:
  rollback 정책 설명 뒤
- 블록 내용:
  `shouldRollback(...)`
- 목적:
  `rollbackFor`, `noRollbackFor` 해석 규칙을 명시한다.

## Part 5

### Chapter 17

- 삽입 위치 1:
  디스패처 설명 뒤
- 블록 내용:
  `DispatcherServlet.handle(...)`
- 목적:
  핸들러 조회, 실행, 예외 처리의 중심 흐름을 보여준다.

### Chapter 18

- 삽입 위치 1:
  `@RequestMapping` 설명 뒤
- 블록 내용:
  `RequestMappingHandlerMapping`의 등록/선택 일부
- 목적:
  매핑 메타데이터가 어떻게 수집되는지 보여준다.

- 삽입 위치 2:
  인자 리졸버 설명 뒤
- 블록 내용:
  `RequestParamArgumentResolver` 또는 `RequestBodyArgumentResolver`
- 목적:
  요청 데이터가 메서드 인자로 바뀌는 구체 과정을 보여준다.

### Chapter 19

- 삽입 위치 1:
  JSON/응답 모델 설명 뒤
- 블록 내용:
  `JsonReturnValueHandler.handleReturnValue(...)`
- 목적:
  일반 반환값과 `ResponseEntity`를 어떻게 분기하는지 보여준다.

- 삽입 위치 2:
  예외 처리 계층 설명 뒤
- 블록 내용:
  `DefaultExceptionResolver.resolve(...)`
- 목적:
  로컬 `@ExceptionHandler`와 `@ControllerAdvice` 우선순위를 보여준다.

### Chapter 20

- 삽입 위치 1:
  요청 조건 설명 뒤
- 블록 내용:
  조건 매핑 검사 코드 일부
- 목적:
  path 외 조건들이 실제로 평가된다는 점을 보여준다.

- 삽입 위치 2:
  검증 설명 뒤
- 블록 내용:
  validator 호출 지점 또는 검증 테스트 일부
- 목적:
  검증이 컨트롤러 본문 밖에서 수행된다는 점을 증명한다.

## Part 6

### Chapter 21

- 삽입 위치 1:
  JDBC 반복 설명 뒤
- 블록 내용:
  순수 JDBC 의사코드 1개
- 목적:
  `JdbcTemplate`가 줄여주는 반복을 먼저 보여준다.

- 삽입 위치 2:
  템플릿 설명 뒤
- 블록 내용:
  `JdbcTemplate.update/query(...)`
- 목적:
  불변 골격과 가변 전략 분리를 보여준다.

### Chapter 22

- 삽입 위치 1:
  예제 앱 전체 흐름 설명 뒤
- 블록 내용:
  `OrderController`, `DefaultOrderService`, `JdbcOrderRepository` 핵심 메서드 발췌
- 목적:
  계층 연결을 코드 수준에서 고정한다.

- 삽입 위치 2:
  장 마무리 직전
- 블록 내용:
  example-app 통합 테스트 일부
- 목적:
  전체 런타임 흐름을 테스트로 닫는다.

### Chapter 23

- 삽입 위치 1:
  부트스트랩 설명 뒤
- 블록 내용:
  `SpringLiteApplication.run()` 핵심 흐름
- 목적:
  "한 줄 실행" 뒤에 있는 조립 순서를 보여준다.

- 삽입 위치 2:
  auto-configuration 설명 뒤
- 블록 내용:
  `BootInfrastructureRegistrar` 또는 대표 auto-config 일부
- 목적:
  자동 등록이 실제로 어떻게 이뤄지는지 보여준다.

### Chapter 24

- 삽입 위치 1:
  테스트 지원 설명 뒤
- 블록 내용:
  `SpringLiteTestExtension` 컨텍스트 생성부
- 목적:
  테스트 컨텍스트가 어떻게 올라오는지 보여준다.

- 삽입 위치 2:
  transactional test support 설명 뒤
- 블록 내용:
  `beforeEach()/afterEach()`의 트랜잭션 처리 부분
- 목적:
  테스트 롤백 지원을 코드로 명시한다.

- 삽입 위치 3:
  장 말미
- 블록 내용:
  `MockMvc` 또는 transactional extension 테스트 일부
- 목적:
  테스트 지원이 실제로 생산성 기능임을 보여준다.

## Part 7

### Chapter 25

- 삽입 위치 1:
  구조 대응 설명 뒤
- 블록 내용:
  Spring 대 `spring-lite` 비교표 재배치
- 목적:
  소스 대응을 한 번에 보이게 한다.

- 삽입 위치 2:
  소스 읽기 가이드 설명 뒤
- 블록 내용:
  `AbstractApplicationContext.refresh()` 의사코드와 `AnnotationConfigApplicationContext.refresh()` 요약 비교
- 목적:
  실제 Spring 소스 진입 장벽을 낮춘다.

### Chapter 26

- 삽입 위치 1:
  실무 오해 목록 뒤
- 블록 내용:
  self-invocation, 빈 생성 실패, 예외 처리 우선순위에 대한 짧은 "문제 코드 vs 원인" 블록 2~3개
- 목적:
  실무 활용 장의 체감도를 높인다.

### Chapter 27

- 삽입 위치 1:
  확장 과제 목록 뒤
- 블록 내용:
  다음 구현 후보의 인터페이스 스케치 2~3개
- 목적:
  독자가 직접 확장 실습을 시작하기 쉽게 만든다.

## 권장 편집 순서

1. 본문의 mermaid 다이어그램 바로 아래에 "대표 코드 블록 1개"를 우선 배치한다.
2. 각 장의 가장 중요한 구현 코드 2개를 먼저 넣고, 이후 테스트 블록을 배치한다.
3. 비교 장은 표 중심으로 유지하고, 긴 코드 블록은 부록 또는 각주 후보로 밀어낸다.
4. 최종 편집 단계에서 블록 길이가 35줄을 넘으면 분할한다.
