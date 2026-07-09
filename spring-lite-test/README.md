# spring-lite-test

프레임워크와 예제 앱 테스트를 지원하는 보조 모듈이다.

## 현재 패키지

- `lite.spring.test`
- `lite.spring.test.web`

## 주요 내용

- `@SpringLiteTest`
- `SpringLiteTestExtension`
- `MockMvc`
- `MockHttpRequest`, `MockHttpResponse`

## 현재 범위

- JUnit 5 기반 컨텍스트 로딩
- 테스트 메서드 파라미터 / 필드 Bean 주입
- 서버 기동 없는 mock web 요청 실행
- 부트 애플리케이션 테스트 시 기본 자동 설정 등록
