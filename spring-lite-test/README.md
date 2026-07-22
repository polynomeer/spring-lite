# spring-lite-test

`spring-lite-test`는 프레임워크와 예제 앱 테스트를 지원하는 보조 모듈이다. 컨텍스트 로딩, 의존성 주입, mock web 호출, 트랜잭션 롤백을 테스트 런타임으로 제공한다.

## 역할

- JUnit 5 기반 컨텍스트 로딩
- 테스트 필드/파라미터 빈 주입
- `MockMvc` 스타일 서버 없는 웹 호출
- `@Transactional` 테스트 자동 롤백
- Boot 기본 인프라 연동 테스트 지원

## 핵심 패키지

- `lite.spring.test`
- `lite.spring.test.web`

## 공개 API와 진입점

- `@SpringLiteTest`
- `SpringLiteTestExtension`
- `MockMvc`
- `MockHttpRequest`
- `MockHttpResponse`

## 내부 핵심 클래스

- `SpringLiteTestExtension`
  - 테스트 컨텍스트 생성, 캐싱, 주입, 트랜잭션 경계를 관리한다.
- `MockMvc`
  - `DispatcherServlet`을 직접 호출해 HTTP 시뮬레이션을 수행한다.
- `MockHttpRequest`, `MockHttpResponse`
  - 테스트 전용 요청/응답 모델이다.

## 호출 흐름

1. `beforeAll(...)`이 테스트 컨텍스트를 준비한다.
2. `postProcessTestInstance(...)`가 `@Autowired` 필드를 채운다.
3. `resolveParameter(...)`가 파라미터 주입을 수행한다.
4. `beforeEach(...)`가 필요 시 트랜잭션을 시작한다.
5. `afterEach(...)`가 테스트 트랜잭션을 롤백한다.

## 테스트 포인트

- `SpringLiteTestExtensionTest`
  - 컨텍스트 로딩, 필드/파라미터 주입, `MockMvc`
- `TransactionalSpringLiteTestExtensionTest`
  - 테스트 트랜잭션 시작/롤백

## 실제 Spring 대응

- `SpringExtension`
- `TestContextManager`
- `MockMvc`

## 현재 한계

- fixture 확장 지점 제한적
- 테스트 슬라이스, 캐시 정책 커스터마이징 미지원
- richer assertions / request builders 미지원
