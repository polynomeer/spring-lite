# 01. DI Comparison

이 시나리오는 생성자 주입, `@Qualifier`, `@Value`가 실제 코드에서 어떻게 보이는지 비교한다.

## 비교 포인트

- 설정 진입점
- 컴포넌트 등록 방식
- `@Qualifier` 처리
- `@Value`가 주입되는 위치
- 실제 런타임에서 이 코드를 누가 해석하는가

## 읽는 순서

1. `spring-lite/GreetingConfig.java`
2. `spring-lite/DefaultGreetingService.java`
3. `spring/GreetingApplication.java`
4. `spring/DefaultGreetingService.java`

## 대응 구조

- `spring-lite`
  - `AnnotationConfigApplicationContext`
  - `resolveDependency(...)`
  - `PropertyResolver`
- Spring
  - `AnnotationConfigApplicationContext`
  - dependency resolution 계층
  - environment / property sources
