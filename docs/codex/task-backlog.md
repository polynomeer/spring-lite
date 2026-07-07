# Task Backlog

## Next Up

- `spring-lite-core`에 공통 애노테이션 패키지 정의
- `spring-lite-context`에 `BeanDefinition` 모델 설계
- 스캐닝 전략 결정: 클래스패스 파일 시스템 우선, JAR 지원은 후순위
- 생성자 선택 규칙 정의
- `example-app` 기본 패키지 구조 고정

## Open Decisions

- Bean 이름 기본 전략을 클래스명 lowerCamelCase로 둘지 여부
- 순환 참조를 1차 MVP에서 금지할지 여부
- 필드 주입 지원 시점을 1차에서 제외할지 여부
- 내장 서버를 Tomcat으로 시작할지 Jetty로 시작할지 여부
- JSON 직렬화를 Jackson에 바로 의존할지 자체 인터페이스를 둘지 여부

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

