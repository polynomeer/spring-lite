# spring-lite-jdbc

`spring-lite-jdbc`는 JDBC 기반 데이터 접근 추상화를 담당한다. 반복되는 커넥션/statement/예외 처리 코드를 숨기고 SQL과 매핑 책임을 애플리케이션에 남긴다.

## 역할

- `JdbcTemplate` 기반 SQL 실행
- `RowMapper` 기반 결과 매핑
- `JdbcRepository` 기반 반복 query/delete 보조
- 트랜잭션 활성 시 현재 커넥션 재사용
- 간단한 `DataSource` 구현 제공

## 핵심 패키지

- `lite.spring.jdbc`
- `lite.spring.jdbc.datasource`

## 공개 API와 진입점

- `JdbcTemplate`
- `RowMapper`
- `DriverManagerDataSource`
- `DataSourceDiagnostics`
- `JdbcRepository`

## 내부 핵심 클래스

- `JdbcTemplate`
  - update/query/queryForObject를 제공한다.
- `SingleConnectionProxy`
  - 트랜잭션 문맥의 커넥션을 닫히지 않도록 감싼다.
- `DriverManagerDataSource`
  - 간단한 JDBC 데이터소스 구현이다.
- `DataSourceDiagnostics`
  - 연결을 짧게 열어 DB product, URL, read-only 상태와 연결 실패를 구조화해 반환한다.
- `JdbcRepository`
  - 공통 findById/findAll/deleteById SQL을 재사용한다. insert/update 도메인 규칙은 각 repository에 남긴다.

## 호출 흐름

1. `JdbcTemplate`이 현재 트랜잭션 커넥션 존재 여부를 본다.
2. 필요 시 새 커넥션을 열고 아니면 현재 커넥션을 재사용한다.
3. statement를 만들고 파라미터를 바인딩한다.
4. 결과를 `RowMapper`로 객체로 변환한다.

## 테스트 포인트

- `JdbcTemplateTest`
  - SQL 실행, 매핑, 예외 경로
- `JdbcIntegrationTest`
  - H2 기반 실제 JDBC/트랜잭션 참여

## 실제 Spring 대응

- `JdbcTemplate`
- `DataSourceUtils`

## 현재 한계

- named parameter, batch update 미지원
- 예외 계층 단순화
- 고급 리소스/메타데이터 추상화 미지원
