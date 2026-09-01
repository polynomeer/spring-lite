# spring-lite-web

`spring-lite-web`은 MVC 요청 디스패치와 컨트롤러 실행 파이프라인을 담당한다. HTTP 요청을 컨트롤러 메서드 호출과 JSON 응답으로 바꾸는 최소 웹 런타임이다.

## 역할

- `DispatcherServlet` 기반 Front Controller
- `HandlerMapping`, `HandlerAdapter`, `ReturnValueHandler` 분리
- `@RequestParam`, `@PathVariable`, `@RequestBody` 인자 바인딩
- JSON 및 plain text 메시지 변환과 역직렬화
- 입력 검증과 예외 응답 변환
- 로컬 `@ExceptionHandler`, 전역 `@ControllerAdvice` 지원
- controller 매핑 이후 `classpath:/static` 정적 리소스 fallback, ETag 조건부 요청
- 요청 method/status별 counter와 누적 duration metrics 기록

## 핵심 패키지

- `lite.spring.web.annotation`
- `lite.spring.web.bind`
- `lite.spring.web.exception`
- `lite.spring.web.handler`
- `lite.spring.web.http`
- `lite.spring.web.json`
- `lite.spring.web.support`

## 공개 API와 진입점

- `DispatcherServlet`
- `ResponseEntity`
- `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
- `@RequestBody`, `@RequestParam`, `@PathVariable`

## 내부 핵심 클래스

- `DispatcherServlet`
  - 요청 처리의 최상위 오케스트레이터다.
- `RequestMappingHandlerMapping`
  - URL, HTTP 메서드, 조건 매핑을 보고 핸들러를 선택한다.
- `RequestMappingHandlerAdapter`
  - 인자 해석, 검증, 메서드 호출을 수행한다.
- `JsonReturnValueHandler`, `HttpMessageConverter`
  - negotiated `Content-Type`에 맞는 converter로 반환값을 기록한다.
- `DefaultExceptionResolver`
  - 예외를 상태 코드와 응답 바디로 변환한다.
- `StaticResourceHandler`
  - GET/HEAD 정적 파일을 제공하고 경로 탐색을 차단하며 ETag가 일치하면 304를 반환한다.

## 호출 흐름

1. `DispatcherServlet.handle(...)`이 요청을 받는다.
2. `HandlerMapping`이 핸들러 메서드를 찾는다.
3. `HandlerAdapter`가 각 파라미터를 resolver로 해석한다.
4. 필요하면 `@Valid` 검증을 적용한다.
5. 컨트롤러 메서드를 실행한다.
6. 반환값 또는 예외를 HTTP 응답으로 변환한다.

## 테스트 포인트

- `DispatcherServletTest`
  - 200 / 404 / 예외 처리
- `ArgumentResolverTest`
  - path variable, request param, request body, validation
- `DefaultExceptionResolverTest`
  - 로컬/전역 예외 처리
- `JsonMapperTest`, `JsonReturnValueHandlerTest`
  - JSON 직렬화/응답 처리

## 실제 Spring 대응

- `DispatcherServlet`
- `RequestMappingHandlerMapping`
- `RequestMappingHandlerAdapter`
- `ExceptionHandlerExceptionResolver`

## 현재 한계

- converter 확장 지점은 JSON과 plain text만 제공
- 뷰 렌더링, 압축/범위 요청/Last-Modified 기반 정적 리소스 처리 미지원
- HTTP 메서드와 미디어 타입 확장 범위 제한
