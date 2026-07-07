# Post-MVP Implementation Plan

이 문서는 `spring-lite` MVP 이후에 구현할 다음 단계를 정리한 목록이다. 단순 아이디어 모음이 아니라, 실제 구현 우선순위와 이유, 완료 기준을 함께 적는다.

## 목표

MVP 이후 단계의 목표는 아래 세 가지다.

1. Spring 핵심 원리의 재현도를 높인다.
2. 현재 구현의 구조적 한계를 줄인다.
3. 예제 앱과 테스트를 통해 프레임워크의 신뢰성을 높인다.

## Priority 1. Container Maturity

컨테이너는 모든 모듈의 기반이므로 가장 먼저 보강해야 한다.

### 1. `@Qualifier` 지원

현재는 같은 타입 Bean이 둘 이상이면 `NoUniqueBeanException`으로 실패한다. `@Qualifier`를 추가하면 동일 타입 다중 구현을 명시적으로 선택할 수 있다.

필요 작업:

- `spring-lite-core`에 `@Qualifier` 추가
- 생성자 파라미터에 붙은 qualifier 읽기
- `BeanDefinition` 또는 별도 메타데이터에 qualifier 보관
- 타입 + qualifier 조합으로 후보 선택

완료 기준:

- 동일 인터페이스 구현 Bean이 둘 이상일 때 명시적으로 하나를 주입할 수 있다.

### 2. `@Value` 및 Property 바인딩 최소 버전

현재는 `application.yml`을 읽지만 컨테이너 주입과 직접 연결돼 있지 않다. `@Value`가 들어오면 외부 설정과 Bean 생성이 연결된다.

필요 작업:

- `@Value` 애노테이션 추가
- `${key:default}` 형태 해석기 구현
- 생성자 파라미터 또는 필드에 값 주입
- `ApplicationProperties`와 컨테이너 연동

완료 기준:

- 설정값을 애플리케이션 Bean에서 직접 주입받을 수 있다.

### 3. 스캔 전략 확장

현재 스캐너는 파일 시스템 기반이다. JAR 환경을 다루지 못하면 재사용 가능한 프레임워크 구조로는 한계가 크다.

필요 작업:

- `jar:` 리소스 탐색 지원
- 클래스 로딩 전 후보 경로 필터링
- 스캔 결과 캐싱 여부 검토

완료 기준:

- 클래스패스가 JAR 형태일 때도 컴포넌트 스캔이 동작한다.

### 4. Bean 생성 에러 메시지 정교화

학습용 프레임워크일수록 예외 메시지가 중요하다. 현재는 타입 이름만 노출되는 경우가 많아 문제 추적이 길어진다.

필요 작업:

- 의존성 체인 추적
- 생성 실패 경로 포함
- 중복 후보 목록과 선택 기준 설명

완료 기준:

- Bean 생성 실패 시 원인과 경로를 한 번에 파악할 수 있다.

## Priority 2. AOP And Proxy Depth

현재 AOP는 "동작은 한다" 수준이다. 다음 단계는 확장성과 재현도를 높이는 것이다.

### 5. 인터페이스 없는 클래스 프록시 지원

현재 JDK Proxy만 써서 인터페이스 없는 클래스는 프록시를 못 만든다.

후보 방향:

- CGLIB
- ByteBuddy

완료 기준:

- 인터페이스 없는 서비스 클래스에도 트랜잭션/AOP 적용이 가능하다.

### 6. 범용 `MethodInterceptor` 체인 정리

지금은 트랜잭션 중심으로만 인터셉터를 쓰고 있다. 이후 로깅, 측정, 보안 흉내를 내려면 체인을 더 일반화하는 편이 좋다.

필요 작업:

- `Advisor`, `Pointcut`, `Advice` 모델 도입
- Bean 후처리 단계에서 advisor 적용
- 인터셉터 정렬 규칙 정의

완료 기준:

- 트랜잭션 외의 공통 관심사도 같은 체계로 붙일 수 있다.

### 7. `@Aspect` 스타일 최소 구현

학습 가치가 큰 영역이다. 문자열 포인트컷을 완전히 구현할 필요는 없지만, 개념을 보여줄 정도는 가능하다.

후보 범위:

- 특정 패키지/타입/메서드명 기준 매칭
- `@Around`, `@Before`, `@After` 최소 버전

완료 기준:

- 별도 Aspect 클래스로 공통 로직을 등록할 수 있다.

## Priority 3. Web MVC Refinement

현재 MVC는 교육용으로 단순화되어 있다. 다음은 웹 계층 분리를 강화하는 단계다.

### 8. MVC 내부 구조 분리

지금은 `DispatcherServlet`에 핸들러 탐색, 매핑, 인자 해석, 응답 처리가 몰려 있다. 실제 Spring처럼 역할을 나누면 확장성이 커진다.

분리 대상:

- `HandlerMapping`
- `HandlerAdapter`
- `ArgumentResolver`
- `ReturnValueHandler`

완료 기준:

- URL 매핑, 파라미터 바인딩, 응답 직렬화가 별도 확장 지점으로 분리된다.

### 9. 예외 처리 모델 추가

현재 예외는 500으로 단순 처리된다. REST 프레임워크로 보려면 예외 매핑이 필요하다.

필요 작업:

- 예외 타입별 HTTP 상태 코드 매핑
- `@ExceptionHandler` 또는 전역 resolver 최소 구현
- 에러 응답 모델 통일

완료 기준:

- `IllegalArgumentException`, validation 에러 등을 상태 코드와 함께 일관되게 반환한다.

### 10. JSON 변환 계층 교체 또는 추상화

자체 JSON 구현은 개념 설명에는 좋지만 기능 확장성이 낮다.

두 가지 방향이 있다.

- 내부 `JsonMapper` 유지 + 기능 보강
- Jackson 기반 `HttpMessageConverter` 추상화 도입

완료 기준:

- 중첩 객체, 리스트, null, 숫자 타입 처리 안정성이 올라간다.

### 11. 요청 본문/응답 바디 테스트 확장

웹 레이어를 확장할수록 회귀 위험이 커진다.

추가할 테스트:

- 잘못된 JSON
- 잘못된 타입 변환
- 존재하지 않는 path variable
- query param 누락
- 예외 발생 시 상태 코드 검증

## Priority 4. JDBC And Transaction Practicality

### 12. 실제 임베디드 DB 통합 테스트

현재 JDBC 테스트는 mock/stub 기반이다. 빠르고 좋지만 실제 SQL 실행 경로까지는 검증하지 않는다.

후보:

- H2

완료 기준:

- 스키마 생성, insert, select, transaction rollback을 실제 DB에서 검증한다.

### 13. `DriverManagerDataSource` 외 DataSource 전략 보강

운영성보다는 학습용이지만, 커넥션 풀 개념까지 보여주면 JDBC 계층 설명이 훨씬 좋아진다.

후보:

- 단순 pooled datasource
- 외부 라이브러리 연동 지점만 먼저 추가

### 14. 트랜잭션 전파/중첩 여부 정책 명시

현재는 단일 경계만 처리한다. 재귀 호출, 중첩 호출, 같은 스레드 내 다중 서비스 호출 정책을 정해야 한다.

최소 목표:

- 이미 트랜잭션이 있으면 재사용
- 중첩 호출 시 이중 `begin/commit` 방지

완료 기준:

- 서비스 간 연쇄 호출에서 트랜잭션 동작이 예측 가능하다.

## Priority 5. Boot And Auto Configuration

### 15. 자동 설정 레이어 추가

지금의 `MiniSpringApplication`은 부트스트랩은 하지만 auto configuration이라기보다는 직접 조립에 가깝다.

후보 자동 설정:

- Web MVC
- JSON
- DataSource
- JdbcTemplate
- TransactionManager

완료 기준:

- 예제 앱에서 명시적 설정 없이도 기본 인프라 Bean이 구성된다.

### 16. 조건부 등록

Spring Boot다움을 보여주려면 "없을 때만 등록" 같은 조건이 있어야 한다.

후보:

- `@ConditionalOnMissingBean` 최소 버전
- 클래스 존재 여부 기반 조건

완료 기준:

- 사용자 정의 Bean이 있으면 기본 설정 Bean을 덮어쓸 수 있다.

### 17. 서버 추상화

현재는 JDK `HttpServer`에 고정돼 있다. 서버를 교체 가능하게 만들면 구조가 더 Boot답게 된다.

후보:

- `WebServer` 인터페이스
- `JdkHttpServer` 구현
- 이후 Jetty/Tomcat 어댑터

완료 기준:

- 애플리케이션 실행 계층과 서버 구현이 분리된다.

## Priority 6. Developer Experience And Test Support

### 18. `spring-lite-test` 모듈 실체화

지금은 테스트 모듈이 거의 비어 있다. 실제 프레임워크 프로젝트라면 테스트 지원도 중요한 산출물이다.

후보 기능:

- 컨텍스트 로딩 헬퍼
- 웹 테스트 헬퍼
- 더미 DataSource/fixture 지원

완료 기준:

- 모듈별 테스트가 반복 코드 없이 작성된다.

### 19. 테스트 슬라이스

Spring의 `@WebMvcTest`, `@DataJpaTest` 같은 개념을 완전히 구현할 필요는 없지만, 계층별 테스트 로딩 개념을 보여줄 수 있다.

완료 기준:

- 전체 컨텍스트가 아니라 필요한 부분만 띄우는 테스트 구성이 가능하다.

### 20. 예제 앱 확장

현재 예제는 매우 얇다. 트랜잭션, 예외 처리, 설정 주입, JDBC를 더 드러내는 방향으로 도메인을 키울 수 있다.

후보 확장:

- 재고 차감
- 결제 실패 시 rollback
- 설정값 기반 정책
- JDBC 저장소로 전환

완료 기준:

- 프레임워크의 주요 기능이 예제 앱에서 모두 사용된다.

## 추천 구현 순서

현 시점에서 가장 좋은 다음 순서는 아래다.

1. `@Qualifier`
2. `@Value`
3. 예외 처리와 MVC 분리
4. 실제 H2 기반 JDBC/트랜잭션 통합 테스트
5. 클래스 프록시 지원
6. 자동 설정 레이어
7. JAR 스캔

## 각 단계별 커밋 전략

앞으로도 작업은 아래 단위로 자르는 것이 좋다.

- 애노테이션/API 추가
- 컨테이너 해석 로직 추가
- 예제 앱 적용
- 테스트 보강
- 문서 갱신

예시:

- `feat(context): add qualifier-based bean resolution`
- `test(context): cover qualifier selection and ambiguity`
- `docs: update post-mvp plan for qualifier support`

