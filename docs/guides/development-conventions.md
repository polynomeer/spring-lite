# Development Conventions

## Java

- Java 21 기준으로 작성한다.
- 공개 SPI와 내부 구현 패키지를 분리한다.
- 리플렉션 코드는 한 곳에 모으고 예외 메시지를 구체적으로 남긴다.

## Packaging

- 기본 루트 패키지는 `lite.spring`으로 사용한다.
- 모듈별 공개 API는 `lite.spring.<module>`에 두고 내부 구현은 `lite.spring.<module>.support` 또는 `internal` 하위에 둔다.

## Testing

- 컨테이너 동작은 단위 테스트로 먼저 고정한다.
- 웹과 트랜잭션은 통합 테스트를 추가한다.
- 예제 앱은 실제 사용 시나리오 테스트를 포함한다.

## Documentation

- 큰 설계 변경은 `docs/adr`에 기록한다.
- README의 범위와 실제 구현 상태를 항상 일치시킨다.
- 새로운 애노테이션이나 확장 포인트를 추가하면 모듈 맵과 로드맵을 같이 업데이트한다.

## Git

- 커밋 메시지는 기본적으로 [Conventional Commits](./commit-conventions.md)를 따른다.
- 하나의 커밋은 하나의 의도를 담고, 문서 변경과 기능 변경은 가능한 한 분리한다.
- 커밋 전에는 관련 테스트 또는 최소한 영향 범위 점검을 마친다.

