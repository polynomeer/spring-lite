# 03. Transaction Comparison

이 시나리오는 주문 생성 서비스에 선언형 트랜잭션을 붙였을 때 코드가 어떻게 달라 보이는지 비교한다.

## 비교 포인트

- `@Transactional` 선언 위치
- 저장소 호출 구조
- rollback 기준 예외
- 실제 런타임에서 begin/commit/rollback을 누가 수행하는가

## 대응 구조

- `spring-lite`
  - `TransactionalBeanPostProcessor`
  - `TransactionManager`
- Spring
  - `TransactionInterceptor`
  - `TransactionAspectSupport`
  - `PlatformTransactionManager`
