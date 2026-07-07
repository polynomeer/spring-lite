# Next Implementation Backlog

이 문서는 현재 `spring-lite` MVP와 Post-MVP 항목이 반영된 이후, 다음 단계에서 구현할 내용을 정리한 백로그다. 목표는 "더 많은 기능" 자체보다 프레임워크 구조의 완성도, 확장성, 테스트 가능성, Spring 재현도를 높이는 것이다.

## 현재 기준선

이미 구현된 핵심 항목은 아래와 같다.

- 애노테이션 기반 컨테이너와 생성자 주입
- `@Configuration`, `@Bean`, `BeanPostProcessor`, 라이프사이클 콜백
- `@Qualifier`, `@Value`, 프로퍼티 해석
- 파일 시스템 및 JAR 기반 클래스패스 스캔
- 인터페이스 프록시와 클래스 기반 프록시
- `@Transactional`, `JdbcTemplate`, H2 통합 테스트
- `DispatcherServlet`, 매핑/어댑터/인자 해석/응답 처리 분리
- `@ExceptionHandler` 기반 웹 예외 처리
- 기본 인프라 자동 등록을 포함한 `MiniSpringApplication`

## Priority 1. Boot 완성도

### 1. 조건부 자동 설정

현재 자동 설정은 코드 기반 기본 등록 수준이다. 다음 단계는 Spring Boot 스타일의 조건부 등록 모델을 추가하는 것이다.

구현 후보:

- `@ConditionalOnMissingBean`
- `@ConditionalOnClass`
- `@ConditionalOnProperty`

완료 기준:

- 기본 인프라 Bean이 "필요할 때만" 등록된다.
- 사용자 정의 Bean이 있으면 자동 설정이 자연스럽게 비활성화된다.

### 2. 자동 설정 모듈화

현재 부트스트랩 인프라는 하나의 registrar에 모여 있다. 이를 기능별 자동 설정 클래스로 분리하면 구조가 더 명확해진다.

구현 후보:

- `WebAutoConfiguration`
- `JdbcAutoConfiguration`
- `TransactionAutoConfiguration`
- `JsonAutoConfiguration`

완료 기준:

- 자동 설정 단위별 책임이 분리된다.
- 예제 앱이 필요한 자동 설정만 로드하는 흐름이 드러난다.

### 3. 서버 추상화

현재는 JDK `HttpServer`에 고정되어 있다. Boot 계층과 서버 구현을 분리하면 향후 확장이 쉬워진다.

구현 후보:

- `WebServer`
- `WebServerFactory`
- `JdkWebServer`

완료 기준:

- 애플리케이션 실행 계층이 구체 서버 구현에 직접 의존하지 않는다.

## Priority 2. AOP 재현도

### 4. `@Aspect` 스타일 최소 구현

지금 AOP는 인프라는 있지만 선언적 Aspect 모델은 없다. 학습용 프레임워크 가치 측면에서 우선순위가 높다.

구현 후보:

- `@Aspect`
- `@Around`
- `@Before`
- `@AfterReturning`

완료 기준:

- 별도 Aspect 클래스로 공통 관심사를 선언할 수 있다.
- 메서드 이름 또는 애노테이션 기반 최소 포인트컷이 동작한다.

### 5. Advisor 정렬과 체인 고도화

트랜잭션, 로깅, 측정이 함께 적용될 때 실행 순서가 명확해야 한다.

구현 후보:

- `Ordered` 또는 `@Order`
- interceptor chain 정렬 규칙
- 중첩 advisor 적용 테스트

완료 기준:

- 동일 Bean에 여러 advisor가 적용될 때 순서가 예측 가능하다.

## Priority 3. Web MVC 확장

### 6. 응답 모델 확장

현재는 JSON 본문 중심이다. 상태 코드와 헤더를 표현하는 응답 모델이 필요하다.

구현 후보:

- `ResponseEntity`
- 응답 헤더 설정 API
- 빈 본문 응답 처리

완료 기준:

- 컨트롤러가 상태 코드, 헤더, 바디를 명시적으로 제어할 수 있다.

### 7. 요청 매핑 조건 확장

라우팅 조건이 메서드와 경로 수준에 머물러 있다. 실용성을 높이려면 추가 조건이 필요하다.

구현 후보:

- `consumes`
- `produces`
- header 조건
- params 조건

완료 기준:

- 동일 경로에서도 요청 조건에 따라 핸들러를 구분할 수 있다.

### 8. 검증 계층 추가

입력 바인딩 이후 검증이 없으면 웹 프레임워크로서 한계가 크다.

구현 후보:

- `@NotNull`, `@Min`, `@Size` 최소 버전
- `@Valid`
- 검증 실패 예외 + 예외 응답 매핑

완료 기준:

- `@RequestBody` 또는 요청 파라미터 검증이 가능하다.
- 검증 실패 시 일관된 400 응답을 반환한다.

## Priority 4. Container 심화

### 9. Bean scope 확장

현재는 사실상 singleton 중심이다. scope 개념이 있어야 컨테이너 설명력이 올라간다.

구현 후보:

- `@Scope("prototype")`
- scope별 생성 전략 분리

완료 기준:

- singleton과 prototype의 생성/조회 차이가 실제 동작으로 드러난다.

### 10. 순환 의존성 정책 명시

현재 구조에서 순환 참조는 실패하거나 우연히 통과할 수 있다. 정책을 명확히 해야 한다.

구현 후보:

- 생성자 순환 의존 탐지
- 의존성 경로 포함 예외 메시지
- 필드/세터 주입을 도입하지 않는다면 명시적 비지원 정책 문서화

완료 기준:

- 순환 의존 시 실패 이유와 경로를 한 번에 확인할 수 있다.

### 11. 이벤트 모델

컨테이너 내부 확장성과 Spring 학습 가치를 위해 이벤트 모델이 유용하다.

구현 후보:

- `ApplicationEvent`
- `ApplicationListener`
- `ContextRefreshedEvent`

완료 기준:

- 컨텍스트 생명주기 이벤트를 구독할 수 있다.

## Priority 5. JDBC / Transaction 고도화

### 12. 트랜잭션 전파 정책 최소 지원

현재는 단순 경계 처리 중심이다. 서비스 간 호출이 늘어나면 전파 정책이 필요하다.

구현 후보:

- `REQUIRED`
- `REQUIRES_NEW`는 이후 단계로 미루고 설계 지점만 확보

완료 기준:

- 같은 스레드 내 중첩 서비스 호출에서 기존 트랜잭션 재사용이 안정적으로 동작한다.

### 13. 예외 기반 rollback 정책 확장

현재 rollback 기준이 단순하다면 선언적 정책을 지원하는 편이 좋다.

구현 후보:

- `rollbackFor`
- `noRollbackFor`

완료 기준:

- 예외 타입별 rollback 정책을 `@Transactional`에서 지정할 수 있다.

### 14. DataSource 추상화 확장

연결 전략이 단순한 만큼 학습 범위를 넓힐 여지가 있다.

구현 후보:

- 단순 pooled datasource
- connection acquisition 추상화

완료 기준:

- `DriverManagerDataSource` 외의 확장 지점이 제공된다.

## Priority 6. Test Support

### 15. `spring-lite-test` 실체화

현재 테스트는 각 모듈에서 직접 컨텍스트를 조립한다. 테스트 지원 모듈을 실제로 쓰게 만들어야 한다.

구현 후보:

- `@SpringLiteTest`
- 컨텍스트 로딩 확장
- 공통 fixture 유틸리티

완료 기준:

- 통합 테스트가 반복 코드 없이 작성된다.

### 16. 웹 테스트 도구

웹 계층 테스트를 더 빠르고 촘촘하게 만들 필요가 있다.

구현 후보:

- `MockHttpRequest`
- `MockHttpResponse`
- `MockMvc`에 가까운 최소 테스트 API

완료 기준:

- 실제 서버 기동 없이 컨트롤러 경로와 응답을 검증할 수 있다.

## Priority 7. Example App 강화

### 17. 예제 앱을 JDBC 중심으로 전환

현재 예제 앱이 프레임워크 기능을 충분히 드러내지 못하면 학습 효과가 제한된다.

구현 후보:

- 메모리 저장소 대신 JDBC 저장소 사용
- 주문/결제/재고 트랜잭션 시나리오 확대

완료 기준:

- 예제 앱에서 컨테이너, 웹, JDBC, 트랜잭션, 예외 처리가 함께 사용된다.

### 18. 운영형 설정 예시 추가

`@Value`와 자동 설정이 들어간 만큼 설정 파일 기반 예제가 있어야 한다.

구현 후보:

- 포트 설정
- 기능 토글
- 비즈니스 정책 값 주입

완료 기준:

- 설정값이 실제 애플리케이션 동작을 바꾸는 예제가 존재한다.

## 추천 구현 순서

현 시점에서 가장 효율적인 순서는 아래다.

1. 조건부 자동 설정
2. 서버 추상화
3. `ResponseEntity`와 웹 응답 모델 확장
4. `@Aspect` 스타일 최소 구현
5. Bean scope 확장
6. 트랜잭션 전파 정책
7. `spring-lite-test` 실체화
8. 예제 앱 JDBC 전환

## 커밋 단위 권장안

앞으로도 작업은 기능 단위로 자르는 편이 좋다.

- 애노테이션/API 추가
- 런타임 해석 로직 추가
- 예제 앱 반영
- 테스트 보강
- 문서 갱신

예시:

- `feat(boot): add conditional auto-configuration support`
- `feat(web): add response entity support`
- `feat(aop): add aspect-style interceptor registration`
- `test(test): add context bootstrap support coverage`
- `docs: update next implementation backlog`
