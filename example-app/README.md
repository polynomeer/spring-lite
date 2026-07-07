# example-app

`spring-lite`의 기능을 검증하는 주문 조회/생성 예제 애플리케이션이다.

## 현재 시나리오

- 주문 조회 API
- 주문 생성 API
- 메모리 저장소 기반 주문 조회
- 서비스 계층 `@Transactional` 적용

## 현재 패키지

- `lite.spring.example`
- `lite.spring.example.order`
- `lite.spring.example.config`

향후 JDBC 저장소, 결제, 재고 시나리오는 별도 단계로 확장할 계획이다.
