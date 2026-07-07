# ADR 0001: Adopt A Gradle Multi-Module Architecture

## Status

Accepted

## Context

`spring-lite`는 IoC, MVC, AOP, Transaction, Bootstrapping을 모두 포함하는 학습 프로젝트다. 이 기능들을 단일 모듈에 두면 의존 방향이 흐려지고 단계별 구현/학습 경계가 약해진다.

## Decision

Gradle Kotlin DSL 기반 멀티모듈 구조를 사용한다. 각 모듈은 한 가지 책임에 집중하며, 상위 계층은 하위 계층에만 의존한다.

## Consequences

- 장점: 기능 경계가 선명하고 점진적 구현이 쉽다.
- 장점: 테스트 범위를 모듈별로 나누기 쉽다.
- 단점: 초기 설정 파일 수가 늘어난다.
- 단점: 작은 기능 변경에도 의존성 구성을 신경 써야 한다.

