# Task Backlog

## Next Up

- JAR 클래스패스 스캔 지원
- `@Qualifier`, `@Value` 지원
- 인터페이스 없는 클래스에 대한 프록시 전략 보강
- 예외 처리기와 HTTP 상태 코드 매핑 고도화
- JDBC 통합 테스트용 실제 임베디드 DB 시나리오 추가

## Open Decisions

- 필드 주입을 계속 제외할지 여부
- AOP 표현식을 어느 수준까지 확장할지 여부
- 내장 서버를 JDK HTTP 서버에서 Jetty/Tomcat으로 교체할지 여부
- JSON 매퍼를 자체 구현 유지할지 외부 라이브러리로 교체할지 여부

## Deferred

- `@Qualifier`
- `@Value`
- `@Aspect` 포인트컷 표현식 확장
- 예외 처리 어드바이스
- 테스트 슬라이스
- 자동 설정 조건부 등록

## Definition Of Done

- 공개 API에는 최소한의 Javadoc 또는 설계 문서 참조가 있다.
- 각 단계는 단위 테스트 또는 통합 테스트로 검증된다.
- README와 로드맵의 상태가 코드와 일치한다.
