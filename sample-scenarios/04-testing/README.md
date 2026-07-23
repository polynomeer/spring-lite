# 04. Testing Comparison

이 시나리오는 웹 테스트와 트랜잭션 테스트를 `spring-lite`와 실제 Spring 테스트 지원으로 비교한다.

## 비교 포인트

- 테스트 컨텍스트를 누가 올리는가
- 필드 주입 / 파라미터 주입
- mock web 요청 방식
- 테스트 종료 후 rollback 시점

## 읽는 순서

1. `spring-lite/TestApplication.java`
2. `spring-lite/OrderControllerTest.java`
3. `spring/TestApplication.java`
4. `spring/GreetingApplicationTest.java`

## 대응 구조

- `spring-lite`
  - `@SpringLiteTest`
  - `SpringLiteTestExtension`
  - `MockMvc`
- Spring
  - `@SpringBootTest`
  - `SpringExtension`
  - `MockMvc`
  - `@Transactional`
