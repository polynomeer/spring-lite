# Sample Scenarios

이 디렉터리는 같은 요구사항을 `spring-lite`와 실제 Spring Boot 스타일 코드로 나란히 비교하기 위한 샘플 모음이다.

이 샘플들은 학습용 비교 코드다. 현재 Gradle 빌드에 직접 연결되어 있지 않으며, "같은 요구사항이 두 프레임워크에서 코드 상으로 어떻게 보이는가"를 읽기 위한 예제로 유지한다.

실행 가능한 비교 앱은 별도 모듈로 추가되어 있다.

- `comparison-spring-lite-app`
- `comparison-spring-boot-app`

이 디렉터리의 코드는 "최소 비교 예시"에 가깝고, 실제 실행과 테스트는 위 두 모듈 기준으로 보는 편이 좋다.

목표는 두 가지다.

1. `spring-lite`에서 구조를 본다.
2. 실제 Spring에서 생산성과 자동화를 본다.

각 시나리오는 아래 구조를 따른다.

- `spring-lite/`
- `spring/`
- `README.md`

추천 읽기 순서:

1. `01-di`
2. `02-mvc`
3. `03-transaction`
4. `04-testing`

함께 보면 좋은 문서:

- `docs/architecture/spring-lite-to-real-spring-code-map.md`
- `docs/architecture/official-spring-doc-study-map.md`
- `docs/architecture/code-level-comparison-with-spring.md`
