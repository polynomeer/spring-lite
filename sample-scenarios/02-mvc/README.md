# 02. MVC Comparison

이 시나리오는 간단한 greeting API를 `spring-lite`와 Spring MVC로 각각 표현한다.

## 비교 포인트

- 컨트롤러 애너테이션
- 경로 변수와 요청 파라미터 처리
- 예외 응답 방식
- 실제 런타임에서 요청이 어느 메서드까지 흘러가는가

## 대응 구조

- `spring-lite`
  - `DispatcherServlet`
  - `RequestMappingHandlerMapping`
  - `RequestMappingHandlerAdapter`
- Spring
  - `DispatcherServlet`
  - `RequestMappingHandlerMapping`
  - `RequestMappingHandlerAdapter`
  - `ExceptionHandlerExceptionResolver`
