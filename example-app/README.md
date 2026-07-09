# example-app

`spring-lite`의 기능을 검증하는 주문 조회/생성 예제 애플리케이션이다.

## 현재 시나리오

- 주문 조회 API
- 주문 생성 API
- JDBC/H2 기반 주문 저장소
- 서비스 계층 `@Transactional` 적용
- 요청 검증 기반 주문 생성
- `application.yml` 기반 주문 상태/시드 데이터/데이터소스 설정

## 현재 패키지

- `lite.spring.example`
- `lite.spring.example.order`
- `lite.spring.example.config`

현재는 주문 흐름을 JDBC 중심으로 재구성했으며, 향후 결제/재고 시나리오를 추가로 확장할 수 있다.
