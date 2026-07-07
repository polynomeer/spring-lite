# Commit Conventions

`spring-lite`는 가장 보편적으로 쓰이는 규칙 중 하나인 Conventional Commits를 기본 커밋 규칙으로 사용한다. 목적은 변경 의도를 짧고 일관되게 드러내고, 추후 changelog 생성이나 릴리스 노트 정리에 유리한 형태를 유지하는 것이다.

## Format

기본 형식은 아래와 같다.

```text
<type>(<scope>): <subject>
```

스코프는 선택 사항이며, 필요 없으면 생략한다.

```text
<type>: <subject>
```

본문과 푸터가 필요하면 아래 형식을 따른다.

```text
<type>(<scope>): <subject>

<body>

<footer>
```

## Recommended Types

- `feat`: 사용자 관점의 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 추가 또는 수정
- `refactor`: 동작 변화 없이 구조 개선
- `test`: 테스트 추가 또는 수정
- `build`: 빌드 스크립트, 의존성, 패키징 변경
- `ci`: CI 설정 변경
- `chore`: 기타 운영성 작업

## Scope Examples

- `core`
- `context`
- `aop`
- `web`
- `jdbc`
- `tx`
- `boot`
- `test`
- `example-app`
- `docs`

예시:

```text
feat(context): add constructor-based bean instantiation
fix(web): resolve path variable binding for primitive types
docs(readme): describe module responsibilities
build(root): add multi-module gradle configuration
test(context): cover circular dependency failure
```

## Writing Rules

- 제목은 가능하면 72자 이내로 유지한다.
- 제목은 명령형 현재 시제로 작성한다.
- 제목 끝에 마침표를 붙이지 않는다.
- 커밋 하나에는 하나의 논리적 변경만 담는다.
- 구현 중간 저장이 아니라 리뷰 가능한 단위로 커밋한다.

## Breaking Changes

호환성이 깨지는 변경은 타입 뒤에 `!`를 붙이거나 푸터에 `BREAKING CHANGE:`를 적는다.

```text
feat(context)!: redesign bean definition registry API
```

또는

```text
refactor(core): simplify annotation metadata API

BREAKING CHANGE: AnnotationMetadata#getAttributes now returns immutable maps.
```

## Recommended Usage In This Repository

- 새 기능은 `feat`
- 버그 수정은 `fix`
- 설계/가이드/README 변경은 `docs`
- Gradle 및 모듈 구조 변경은 `build`
- 리네이밍이나 내부 구조 조정은 `refactor`

## First Commit Recommendation

초기 스캐폴드처럼 저장소 기반을 잡는 첫 커밋은 아래 형태가 가장 자연스럽다.

```text
docs: add initial project scaffold and contributor guides
```

빌드 설정 중심으로 강조하고 싶다면 아래도 가능하다.

```text
build: initialize spring-lite multi-module project
```

