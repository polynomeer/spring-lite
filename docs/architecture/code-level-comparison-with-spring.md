# Code-Level Comparison With Spring

이 문서는 `spring-lite`의 핵심 메서드를 실제 Spring / Spring Boot의 대응 메서드와 코드 레벨에서 비교하기 위한 문서다. 목표는 구현을 그대로 복사해 보는 것이 아니라, 같은 책임이 왜 실제 Spring에서는 더 많은 단계와 더 많은 추상화로 분해되는지 이해하는 것이다.

비교 원칙은 단순하다.

1. `spring-lite` 메서드를 먼저 읽는다.
2. 실제 Spring의 대응 메서드 이름을 찾는다.
3. 둘 다 "무슨 일을 하는가"를 단계로 풀어 쓴다.
4. 실제 Spring이 추가한 추상화의 이유를 적는다.

## 1. `refresh()` 비교

### `spring-lite`

- 클래스:
  - `lite.spring.context.support.AnnotationConfigApplicationContext`
- 메서드:
  - `refresh()`

핵심 단계:

1. 이미 refresh 되었는지 확인
2. BeanPostProcessor 인스턴스화
3. 설정 클래스 bean 인스턴스화
4. BeanPostProcessor 재수집
5. 나머지 singleton 인스턴스화
6. refresh 이벤트 발행

### 실제 Spring

- 클래스:
  - `org.springframework.context.support.AbstractApplicationContext`
- 메서드:
  - `refresh()`

핵심 단계 축:

1. refresh 준비
2. fresh bean factory 확보
3. bean factory 준비
4. post-processor 계층 개입
5. bean post-processor 등록
6. 메시지 소스 / 이벤트 멀티캐스터 준비
7. 남은 singleton 초기화
8. refresh 완료 처리

### 비교 포인트

| 관점 | `spring-lite` | 실제 Spring |
| --- | --- | --- |
| 단계 수 | 적다 | 많다 |
| 역할 분리 | 컨텍스트가 직접 많이 담당 | 컨텍스트, bean factory, post-processor 계층으로 분산 |
| 이벤트 인프라 | refresh/close 최소 이벤트 | 더 넓은 컨텍스트 인프라 |
| 학습 포인트 | 핵심 순서를 한눈에 본다 | hook point가 왜 필요한지 본다 |

### 왜 실제 Spring이 더 복잡한가

- 설정 메타데이터 처리 시점이 더 세밀하다.
- 확장 포인트가 많아, refresh 중간에 개입할 수 있는 지점이 필요하다.
- 국제화, 이벤트, 환경, 후처리기, listener 같은 인프라가 더 많이 얹힌다.

### 같이 읽을 링크

- [Spring IoC Container and Beans](https://docs.spring.io/spring-framework/reference/core/beans.html)
- [AbstractApplicationContext Javadoc](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/support/AbstractApplicationContext.html)

## 2. `createBean(...)` 비교

### `spring-lite`

- 클래스:
  - `lite.spring.context.support.AnnotationConfigApplicationContext`
- 메서드:
  - `createBean(...)`

핵심 단계:

1. singleton 캐시 확인
2. 순환 참조 감지 마커 등록
3. 생성 전략 선택
   - 생성자 인스턴스화
   - 팩토리 메서드 호출
4. `initializeBean(...)` 호출
5. singleton 캐시에 저장
6. 생성 중 마커 제거

### 실제 Spring

- 클래스 축:
  - `org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory`
- 대응 메서드 축:
  - `createBean(...)`
  - `doCreateBean(...)`
  - `populateBean(...)`
  - `initializeBean(...)`

핵심 단계 축:

1. bean 인스턴스 생성
2. merged definition 준비
3. 필요 시 조기 노출
4. 의존성 주입 / 프로퍼티 채우기
5. 초기화 콜백
6. before/after post-process
7. singleton 등록 / 후속 정리

### 비교 포인트

| 관점 | `spring-lite` | 실제 Spring |
| --- | --- | --- |
| 의존성 모델 | 생성자 주입 중심 | 생성자, 필드, 세터, 다양한 해석 규칙 |
| 조기 노출 | 거의 없음 | 순환 참조/프록시 대응 위해 존재 |
| 메서드 분해 | 상대적으로 적음 | 생성, 주입, 초기화, 노출이 세분화 |
| 디버깅 난이도 | 낮음 | 높지만 확장 가능성 큼 |

### 왜 실제 Spring이 더 복잡한가

- 다양한 주입 방식과 lifecycle 규칙을 지원해야 한다.
- 순환 참조, 프록시, FactoryBean, aware 인터페이스 같은 케이스를 처리해야 한다.
- bean 생성 자체가 하나의 정책 엔진이기 때문이다.

### 같이 읽을 링크

- [Bean Overview](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)
- [The BeanFactory API](https://docs.spring.io/spring-framework/reference/core/beans/beanfactory.html)

## 3. `DispatcherServlet.handle(...)` 비교

### `spring-lite`

- 클래스:
  - `lite.spring.web.support.DispatcherServlet`
- 메서드:
  - `handle(HttpExchange)`

핵심 단계:

1. 핸들러 조회
2. 핸들러가 없으면 404 응답
3. `HandlerAdapter`로 컨트롤러 호출
4. 반환값을 응답으로 기록
5. 예외가 나면 `ExceptionResolver`로 변환
6. 교환 객체 종료

### 실제 Spring

- 클래스:
  - `org.springframework.web.servlet.DispatcherServlet`
- 대응 메서드 축:
  - `doService(...)`
  - `doDispatch(...)`

핵심 단계 축:

1. 요청 속성 준비
2. 핸들러 조회
3. 적절한 adapter 선택
4. 인터셉터 전처리
5. 핸들러 실행
6. 비동기 여부 확인
7. 반환값 / 모델 처리
8. 예외 처리
9. 인터셉터 후처리 / 완료 처리

### 비교 포인트

| 관점 | `spring-lite` | 실제 Spring |
| --- | --- | --- |
| 처리 흐름 | 직선형 | 전략 + 인터셉터 + 후처리 |
| 비동기 처리 | 없음 | 있음 |
| view/model 개념 | 최소 | 풍부 |
| 학습 포인트 | MVC 핵심 파이프라인 | 웹 프레임워크 일반화 구조 |

### 왜 실제 Spring이 더 복잡한가

- handler adapter와 mapping 전략 종류가 많다.
- 인터셉터, 비동기, locale/theme, multipart, view rendering 같은 문제가 얹힌다.
- HTTP 요청 처리 전반을 일반화해야 한다.

### 같이 읽을 링크

- [DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
- [Processing Sequence](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/sequence.html)

## 4. `RequestMappingHandlerAdapter` 비교

### `spring-lite`

- 클래스:
  - `lite.spring.web.handler.RequestMappingHandlerAdapter`
- 핵심 메서드 축:
  - `handle(...)`
  - 내부 인자 해석 루프
  - `validateIfNecessary(...)`

핵심 단계:

1. 컨트롤러 메서드 파라미터 순회
2. 각 파라미터를 처리할 resolver 선택
3. 인자 값 생성
4. 필요 시 검증
5. 실제 컨트롤러 메서드 호출

### 실제 Spring

- 클래스:
  - `org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter`

핵심 단계 축:

1. handler method 준비
2. 데이터 바인딩/변환 준비
3. 인자 해석기 선택
4. validation / binder 개입
5. 메서드 호출
6. 반환값 처리기 선택

### 비교 포인트

| 관점 | `spring-lite` | 실제 Spring |
| --- | --- | --- |
| 인자 해석기 | 소수 | 매우 많음 |
| binder/validator | 최소 | 일반화된 바인딩 계층 |
| 반환값 처리 | 단순 JSON 중심 | 다양한 반환 모델 |
| 디버깅 포인트 | resolver 선택과 validation | resolver, binder, converter, return handler |

### 왜 실제 Spring이 더 복잡한가

- 파라미터 타입과 애너테이션 조합이 훨씬 다양하다.
- 메시지 컨버터, 바인더, 검증기, 반환값 처리기를 느슨하게 합성한다.
- 같은 MVC라도 다양한 프로그래밍 모델을 지원해야 한다.

### 같이 읽을 링크

- [Spring Web MVC](https://docs.spring.io/spring/reference/web/webmvc.html)
- [Annotated Controllers](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html)

## 5. 트랜잭션 비교

### `spring-lite`

- 클래스:
  - `lite.spring.tx.support.TransactionManager`
  - `lite.spring.tx.support.TransactionalBeanPostProcessor`

핵심 메서드:

- `begin()`
- `commit()`
- `rollback()`
- 내부 트랜잭션 인터셉터의 `invoke(...)`

핵심 구조:

1. 후처리기가 `@Transactional` 대상 식별
2. 프록시 생성
3. 호출 시 begin
4. 정상/예외에 따라 commit 또는 rollback
5. 현재 스레드의 커넥션 상태 정리

### 실제 Spring

- 클래스 축:
  - `TransactionInterceptor`
  - `TransactionAspectSupport`
  - `PlatformTransactionManager`
  - `TransactionSynchronizationManager`

핵심 구조 축:

1. 트랜잭션 속성 메타데이터 해석
2. 인터셉터가 호출 경계 진입
3. 적절한 transaction manager 선택
4. begin / participation / rollback-only 판단
5. commit / rollback / synchronization 정리

### 비교 포인트

| 관점 | `spring-lite` | 실제 Spring |
| --- | --- | --- |
| 상태 저장 | 단순 thread-local | 더 일반화된 thread-bound resource 관리 |
| propagation | 최소 `REQUIRED` | 다양한 propagation |
| rollback 정책 | 기본 + 일부 규칙 | 더 풍부한 규칙 |
| 메타데이터 해석 | 후처리기 내부에 가까움 | 별도 추상화로 분리 |

### 왜 실제 Spring이 더 복잡한가

- 여러 종류의 transaction manager를 지원해야 한다.
- 리소스 동기화와 propagation 규칙이 훨씬 풍부하다.
- 선언형 트랜잭션 메타데이터와 실행 엔진을 분리해 재사용성을 높인다.

### 같이 읽을 링크

- [Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction.html)
- [Declarative Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html)

## 6. `SpringLiteApplication.run(...)` 비교

### `spring-lite`

- 클래스:
  - `lite.spring.boot.SpringLiteApplication`
- 메서드:
  - `run(...)`

핵심 단계:

1. command line override 준비
2. 컨텍스트 생성
3. 애플리케이션 클래스 등록
4. 기본 auto-config 등록
5. refresh
6. `WebServer` 시작

### 실제 Spring Boot

- 클래스:
  - `org.springframework.boot.SpringApplication`
- 메서드 축:
  - `run(...)`

핵심 단계 축:

1. 애플리케이션 타입 추론
2. environment 준비
3. context 생성
4. initializer / listener 개입
5. bean 등록과 refresh
6. runner 실행
7. 서버 및 애플리케이션 lifecycle 완료

### 비교 포인트

| 관점 | `spring-lite` | 실제 Spring Boot |
| --- | --- | --- |
| 부트스트랩 단계 | 적음 | 많음 |
| 환경 모델 | 단순 오버라이드 + 프로파일 | 훨씬 풍부한 environment / property source |
| auto-config | 소수 등록기 | 대규모 조건부 조립 |
| listener / initializer | 최소 | 풍부 |

### 왜 실제 Spring Boot가 더 복잡한가

- 다양한 실행 환경과 패키징 모델을 지원해야 한다.
- 조건부 자동 설정과 외부 설정 모델이 훨씬 크다.
- 운영 인프라와 lifecycle 이벤트가 더 많다.

### 같이 읽을 링크

- [SpringApplication](https://docs.spring.io/spring-boot/reference/features/spring-application.html)

## 7. 코드 비교를 가장 잘하는 방법

한 메서드를 비교할 때는 아래 순서를 고정하면 된다.

1. `spring-lite` 메서드를 먼저 읽는다.
2. 직접 단계 목록을 적는다.
3. 공식 문서에서 같은 흐름 설명을 찾는다.
4. 실제 Spring 메서드에서 그 단계가 어떤 메서드 호출로 갈라지는지 찾는다.
5. 마지막에 "왜 이 분해가 필요했는가"를 적는다.

좋은 첫 비교 순서는 아래와 같다.

1. `refresh()`
2. `createBean(...)`
3. `DispatcherServlet.handle(...)`
4. `TransactionManager` / transaction interceptor
5. `RequestMappingHandlerAdapter`

## 8. 같이 보면 좋은 문서

- [Spring Lite -> 실제 Spring 코드 대응표](./spring-lite-to-real-spring-code-map.md)
- [공식 Spring 문서 학습 맵](./official-spring-doc-study-map.md)
- [실제 Spring 소스 읽기 실습](./spring-source-guided-reading.md)
- [런타임 시퀀스 다이어그램](./runtime-sequence-diagrams.md)
