# Test Catalog

이 문서는 `spring-lite`의 테스트가 어떤 계약과 분기를 고정하는지 빠르게 파악하기 위한 카탈로그다. 목적은 테스트 개수를 나열하는 것이 아니라, 어떤 실패를 막기 위해 존재하는지 설명하는 것이다.

## 1. `spring-lite-context`

### `AnnotationConfigApplicationContextTest`

- 고정하는 계약
  - 빈 정의 등록과 조회
  - 생성자 주입과 `@Qualifier`
  - `@Value`와 프로퍼티 해석
  - singleton / prototype 스코프
  - 라이프사이클 콜백과 이벤트 발행
- 막는 회귀
  - 생성자 선택 변경으로 인한 주입 실패
  - 프로퍼티 주입 누락
  - refresh / close 순서 깨짐

### `ClassPathScannerTest`

- 고정하는 계약
  - 파일 시스템 스캔
  - JAR 스캔
- 막는 회귀
  - 로컬 개발 환경과 패키징 환경의 후보 탐색 차이

### `AnnotationSupportTest`

- 고정하는 계약
  - 메타 애너테이션 판정
- 막는 회귀
  - `@Service`, `@Repository` 같은 스테레오타입 인식 실패

## 2. `spring-lite-aop`

### `AspectBeanPostProcessorTest`

- 고정하는 계약
  - before / around / after-returning advice 합성
  - `@Order` 기반 순서 보장
  - 프록시 생성 전략
- 막는 회귀
  - advice 누락
  - 체인 순서 반전
  - 클래스/인터페이스 프록시 선택 오류

## 3. `spring-lite-tx`

### `TransactionManagerTest`

- 고정하는 계약
  - 트랜잭션 시작, 중첩 depth, commit, rollback
  - rollback-only 전파
- 막는 회귀
  - 중첩 호출에서 조기 commit
  - rollback-only 무시

### `TransactionalBeanPostProcessorTest`

- 고정하는 계약
  - `@Transactional` 대상 빈 프록시화
- 막는 회귀
  - 후처리기 미적용

### `TransactionalAspectChainTest`

- 고정하는 계약
  - AOP와 트랜잭션 인터셉터의 공존
- 막는 회귀
  - 인터셉터 순서 충돌

## 4. `spring-lite-web`

### `DispatcherServletTest`

- 고정하는 계약
  - 정상 디스패치
  - 404 처리
  - 예외 흐름 응답 변환
- 막는 회귀
  - 핸들러 탐색 실패 시 잘못된 상태 코드
  - 예외 처리 누락

### `ArgumentResolverTest`

- 고정하는 계약
  - `@PathVariable`, `@RequestParam`, `@RequestBody`
  - 타입 변환과 검증
- 막는 회귀
  - 바인딩 분기 누락
  - 검증 400 응답 계약 붕괴

### `DefaultExceptionResolverTest`

- 고정하는 계약
  - 로컬/전역 예외 처리 우선순위
- 막는 회귀
  - `@ControllerAdvice` 미적용

### `JsonMapperTest`, `JsonReturnValueHandlerTest`

- 고정하는 계약
  - JSON 직렬화/역직렬화
  - 응답 바디 작성
- 막는 회귀
  - 응답 포맷 불일치

## 5. `spring-lite-jdbc`

### `JdbcTemplateTest`

- 고정하는 계약
  - update/query 실행
  - 결과 매핑
  - 예외 래핑
- 막는 회귀
  - statement / connection 처리 누락

### `JdbcIntegrationTest`

- 고정하는 계약
  - 실제 H2 환경에서 SQL 실행
  - 트랜잭션 참여
- 막는 회귀
  - 트랜잭션 문맥과 JDBC 계층 분리

## 6. `spring-lite-boot`

### `SpringLiteApplicationTest`

- 고정하는 계약
  - boot 진입점이 컨텍스트와 서버를 올바르게 조립
- 막는 회귀
  - 기본 인프라 누락

### `ApplicationPropertiesTest`

- 고정하는 계약
  - `application.yml`, profile 파일, 오버라이드 병합
- 막는 회귀
  - 프로파일 우선순위 오류

### `JdkWebServerFactoryTest`

- 고정하는 계약
  - 웹 서버 바인딩과 디스패처 연결
- 막는 회귀
  - 부트와 웹 계층 분리 실패

## 7. `spring-lite-test`

### `SpringLiteTestExtensionTest`

- 고정하는 계약
  - 컨텍스트 로딩
  - 필드/파라미터 주입
  - `MockMvc` 지원
- 막는 회귀
  - 테스트 런타임 초기화 실패

### `TransactionalSpringLiteTestExtensionTest`

- 고정하는 계약
  - 테스트 트랜잭션 시작과 롤백
- 막는 회귀
  - 테스트 간 데이터 오염

## 8. `example-app`

### `ExampleApplicationTest`

- 고정하는 계약
  - 서비스와 저장소의 통합 동작
- 막는 회귀
  - 도메인 조립 실패

### `ExampleApplicationWebTest`

- 고정하는 계약
  - HTTP 요청부터 JSON 응답까지 전체 통합
- 막는 회귀
  - 실제 사용자 흐름 붕괴

## 읽는 순서

1. `spring-lite-context`
2. `spring-lite-aop` / `spring-lite-tx`
3. `spring-lite-web`
4. `spring-lite-jdbc`
5. `spring-lite-boot`
6. `spring-lite-test`
7. `example-app`
