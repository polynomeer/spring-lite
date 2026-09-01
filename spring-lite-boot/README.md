# spring-lite-boot

`spring-lite-boot`는 애플리케이션 실행 진입점과 기본 자동 설정 조합 계층을 담당한다. 한 줄 실행 뒤에 어떤 인프라가 묶여 올라오는지 보여 주는 학습용 Boot 축이다.

## 역할

- `SpringLiteApplication.run(...)` 진입점 제공
- 기본 auto-configuration 등록
- profile-aware 프로퍼티 로딩과 런타임 오버라이드 연동
- 내장 JDK HTTP 서버 기동
- `/actuator/health`, `/actuator/info`, `/actuator/metrics` actuator-lite endpoint 제공

## 핵심 패키지

- `lite.spring.boot`
- `lite.spring.boot.annotation`
- `lite.spring.boot.support`
- `lite.spring.boot.support.autoconfigure`
- `lite.spring.boot.web`

## 공개 API와 진입점

- `SpringLiteApplication`
- `@SpringLiteBootApplication`
- `WebServer`
- `WebServerFactory`

## 내부 핵심 클래스

- `SpringLiteApplication`
  - 컨텍스트 생성, 기본 빈 등록, refresh, 서버 시작을 묶는다.
- `BootInfrastructureRegistrar`
  - 기본 auto-configuration 클래스를 등록한다.
- `ApplicationProperties`
  - 최종 프로퍼티 뷰를 애플리케이션에서 소비하기 좋은 형태로 제공한다.
- `JdkWebServerFactory`
  - `DispatcherServlet`을 JDK `HttpServer`와 연결한다.
- `ActuatorController`
  - health, 실행 중인 bean/proxy 요약, in-memory counter/timer 스냅샷을 노출한다.

## Metrics endpoint

`@Timed`가 붙은 빈의 호출은 `MetricsRegistry`에 기록된다. `GET /actuator/metrics`는 `counters`와 `timers`를 반환하며, timer 값은 호출 횟수(`count`)와 누적 나노초(`totalNanos`)를 포함한다. 이 endpoint는 교육용 in-memory 관측성 계약이며 영속 저장소나 관리 endpoint 보안은 제공하지 않는다.

## 호출 흐름

1. `SpringLiteApplication.run(...)`이 실행된다.
2. 커맨드라인 오버라이드와 프로퍼티가 병합된다.
3. 애플리케이션 설정 클래스와 기본 auto-config가 등록된다.
4. 컨텍스트가 refresh 된다.
5. `WebServer` 빈을 찾아 서버를 시작한다.

## 테스트 포인트

- `SpringLiteApplicationTest`
  - boot 실행과 기본 인프라 조립
- `ApplicationPropertiesTest`
  - 프로파일 / 프로퍼티 병합
- `JdkWebServerFactoryTest`
  - 웹 서버 바인딩과 디스패처 연결

## 실제 Spring 대응

- `SpringApplication`
- `AutoConfigurationImportSelector`
- 환경/프로퍼티 바인딩 계층

## 현재 한계

- auto-configuration 조건 종류가 제한적
- starter 생태계, metrics/management 보안 같은 고급 운영 지원 미지원
- 서버 추상화는 JDK `HttpServer` 중심
