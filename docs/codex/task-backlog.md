# Task Backlog

## Next Up

- DataSource 확장 지점과 연결 상태 진단
- 컨테이너 빈/조건부 자동 설정 상태를 출력하는 CLI
- `/api-docs`의 요청·응답 타입 요약
- web request metrics와 trace export contract

## Open Decisions

- 필드 주입을 계속 제외할지 여부
- AOP 표현식을 어느 수준까지 확장할지 여부
- 내장 서버를 JDK HTTP 서버에서 Jetty/Tomcat으로 교체할지 여부
- JSON 매퍼를 자체 구현 유지할지 외부 라이브러리로 교체할지 여부

## Deferred

- `@Aspect` 포인트컷 표현식 확장
- isolation, timeout, 다중 DataSource 트랜잭션 정책
- 정적 리소스 압축, range request, conditional GET
- OpenAPI 호환 문서 생성

## Definition Of Done

- 공개 API에는 최소한의 Javadoc 또는 설계 문서 참조가 있다.
- 각 단계는 단위 테스트 또는 통합 테스트로 검증된다.
- README와 로드맵의 상태가 코드와 일치한다.
