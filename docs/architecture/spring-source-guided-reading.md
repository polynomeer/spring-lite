# Spring Source Guided Reading

이 문서는 실제 Spring Framework와 Spring Boot 소스를 읽을 때 따라갈 실습 체크리스트다. 목표는 전체 저장소를 넓게 훑는 것이 아니라, `spring-lite`에서 이미 본 책임을 실제 Spring 코드에서 찾아내는 것이다.

## 1. 컨테이너 시작점: `AbstractApplicationContext.refresh()`

실습:

1. `refresh()` 메서드를 연다.
2. 아래 단계가 어떤 메서드 이름으로 분해되어 있는지 찾는다.
   - 빈 팩토리 준비
   - post-processor 개입
   - bean post-processor 등록
   - 남은 singleton 초기화
   - refresh 완료 이벤트
3. `spring-lite`의 `AnnotationConfigApplicationContext.refresh()`와 비교해, 어떤 단계가 더 잘게 나뉘었는지 적어 본다.

질문:

- 왜 실제 Spring은 refresh를 더 많은 hook point로 쪼갰는가
- 어떤 확장 포인트가 이 분해 덕분에 가능해지는가

## 2. 생성 알고리즘: `AbstractAutowireCapableBeanFactory`

실습:

1. `doCreateBean(...)` 계열 메서드를 연다.
2. 아래 책임을 수행하는 지점을 찾는다.
   - 인스턴스 생성
   - 의존성 주입
   - 초기화 전후 후처리
   - 조기 노출 또는 캐싱
3. `spring-lite`의 `createBean(...)`, `initializeBean(...)`와 대응시켜 본다.

질문:

- 왜 실제 Spring은 생성과 초기화를 여러 보호 메서드로 나누는가
- 순환 참조나 프록시 조기 노출 같은 문제는 어디서 다루는가

## 3. 설정 메타데이터: `ConfigurationClassPostProcessor`

실습:

1. 설정 클래스 처리 진입점을 찾는다.
2. 아래 주제가 어느 계층에서 분기되는지 본다.
   - `@Configuration`
   - `@ComponentScan`
   - `@Import`
   - 조건부 등록
3. `spring-lite`의 `registerBeanMethods(...)`와 비교해, 왜 실제 Spring이 별도 후처리기를 두는지 정리한다.

질문:

- 설정 클래스가 "그 자체가 빈"이면서 "다른 빈 정의를 만드는 메타 계층"이라는 말은 실제 코드에서 어떻게 드러나는가

## 4. AOP 시작점: `AbstractAutoProxyCreator`

실습:

1. 대상 빈이 어떤 조건에서 프록시 후보가 되는지 찾는다.
2. advice/advisor 선택과 프록시 생성 지점을 찾는다.
3. `spring-lite`의 `AspectBeanPostProcessor`와 어떤 점이 같은지 적는다.

질문:

- 실제 Spring은 왜 advisor abstraction을 별도로 두는가
- 후처리기 단계와 프록시 생성 단계가 왜 분리되어야 하는가

## 5. 트랜잭션: `TransactionInterceptor`와 주변 클래스

실습:

1. `TransactionInterceptor` 또는 `TransactionAspectSupport` 진입점을 연다.
2. 아래 질문에 답할 수 있는 코드를 찾는다.
   - 메타데이터는 어디서 읽는가
   - begin/commit/rollback은 누가 호출하는가
   - rollback-only 상태는 어디에 저장되는가
3. `spring-lite`의 `TransactionalBeanPostProcessor`와 `TransactionManager`를 나란히 놓고 비교한다.

질문:

- 실제 Spring은 왜 메타데이터 해석과 실행 경계 제어를 다른 객체들로 나누는가

## 6. MVC: `DispatcherServlet`과 `RequestMappingHandlerAdapter`

실습:

1. `DispatcherServlet.doDispatch(...)`를 연다.
2. 아래 단계의 대응 메서드를 찾는다.
   - 핸들러 찾기
   - 어댑터 선택
   - 인자 해석/바인딩
   - 컨트롤러 호출
   - 반환값 처리
   - 예외 처리
3. `RequestMappingHandlerAdapter`에서 인자 해석기와 반환값 처리기 목록을 찾는다.

질문:

- 왜 실제 Spring MVC는 전략 객체 수가 훨씬 많은가
- 404, 400, 500이 서로 다른 계층 실패라는 사실이 코드에서 어떻게 보이는가

## 7. Boot 시작점: `SpringApplication`

실습:

1. `run(...)` 호출 흐름을 연다.
2. 환경 준비, 컨텍스트 생성, refresh, runner 실행, 서버 시작 전후 순서를 찾는다.
3. `spring-lite`의 `SpringLiteApplication.run(...)`과 비교해 어떤 단계가 생략되었는지 적는다.

질문:

- 실제 Spring Boot는 왜 환경 준비와 auto-configuration 선택에 큰 비용을 쓰는가

## 읽는 방식

- 한 번에 모든 줄을 이해하려 하지 않는다.
- 먼저 `spring-lite`에서 본 책임 이름을 메모한다.
- 실제 Spring 코드에서 그 책임이 어느 클래스와 메서드에 분산되었는지 찾는다.
- 마지막에 "왜 더 많은 추상화가 필요해졌는가"를 적는다.
