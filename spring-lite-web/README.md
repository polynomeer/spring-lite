# spring-lite-web

MVC 요청 디스패치와 컨트롤러 실행 파이프라인을 담당한다.

## 현재 패키지

- `lite.spring.web.annotation`
- `lite.spring.web.bind`
- `lite.spring.web.exception`
- `lite.spring.web.handler`
- `lite.spring.web.http`
- `lite.spring.web.json`
- `lite.spring.web.support`

## 주요 내용

- `DispatcherServlet`
- `HandlerMapping`, `HandlerAdapter`, `ReturnValueHandler`
- `@RequestBody`, `@RequestParam`, `@PathVariable`
- `@ExceptionHandler`
- `ResponseEntity`, `JsonMapper`
