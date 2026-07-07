# Module Map

## Dependency Direction

```text
spring-lite-core
    └─ spring-lite-context
         ├─ spring-lite-aop
         │    └─ spring-lite-tx
         ├─ spring-lite-web
         └─ spring-lite-jdbc
spring-lite-web + spring-lite-jdbc + spring-lite-tx
    └─ spring-lite-boot
spring-lite-boot
    └─ spring-lite-test
spring-lite-boot
    └─ example-app
```

## Responsibility Split

### `spring-lite-core`

- 공통 애노테이션
- 리플렉션 유틸리티
- 예외 타입
- 이름 생성 전략

### `spring-lite-context`

- Bean 메타데이터
- Bean 생성/조회/초기화
- 컴포넌트 스캔
- 설정 클래스 처리

### `spring-lite-aop`

- 프록시 생성
- 어드바이스 체인
- 포인트컷 매칭

### `spring-lite-web`

- HTTP 추상화
- 요청 라우팅
- 컨트롤러 메서드 실행
- 응답 직렬화

### `spring-lite-jdbc`

- 데이터소스 연동
- SQL 실행 템플릿
- 매핑 추상화

### `spring-lite-tx`

- 트랜잭션 경계
- 커밋/롤백 정책
- 트랜잭션 인터셉터

### `spring-lite-boot`

- 실행 진입점
- 자동 설정
- 서버 구동

### `spring-lite-test`

- 테스트 컨텍스트 로딩
- 예제용 fixture 지원

