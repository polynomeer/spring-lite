# Next Implementation Backlog

이 문서는 현재 `spring-lite` MVP와 Post-MVP 항목이 반영된 이후, 다음 단계에서 구현할 내용을 정리한 백로그다. 목표는 "더 많은 기능" 자체보다 프레임워크 구조의 완성도, 확장성, 테스트 가능성, Spring 재현도를 높이는 것이다.

## 현재 기준선

이미 구현된 핵심 항목은 아래와 같다.

- 애노테이션 기반 컨테이너와 생성자 주입
- `@Configuration`, `@Bean`, `BeanPostProcessor`, 라이프사이클 콜백
- `@Qualifier`, `@Value`, 프로퍼티 해석
- 파일 시스템 및 JAR 기반 클래스패스 스캔
- 인터페이스 프록시와 클래스 기반 프록시
- `@Transactional`, `JdbcTemplate`, H2 통합 테스트
- `DispatcherServlet`, 매핑/어댑터/인자 해석/응답 처리 분리
- `@ExceptionHandler` 기반 웹 예외 처리
- `@ControllerAdvice` 기반 전역 웹 예외 처리
- 기본 인프라 자동 등록을 포함한 `SpringLiteApplication`
- profile-aware property loading과 공통 conversion service
- `@Order` 기반 interceptor chain 정렬과 프록시 합성
- `@Transactional` 테스트 롤백 지원
- `FactoryBean` product / factory dereference 모델
- `BeanNameAware`, `ApplicationContextAware` lifecycle callback
- 순환 의존성 경로 진단
- `@Transactional(readOnly = true)` connection hint
- `HttpMessageConverter` 기반 JSON / plain text 응답 변환
- actuator-lite `/actuator/health`, `/actuator/info`

이미 완료된 확장 항목도 있다.

- 조건부 자동 설정 기본 모델
- 자동 설정 모듈 분리
- 서버 추상화
- `ResponseEntity` 기반 응답 모델
- `@Aspect` 스타일 최소 구현
- 요청 매핑 조건 확장
- 최소 검증 계층 추가
- `@Scope("prototype")`와 기본 컨텍스트 이벤트
- `REQUIRED` 전파와 예외별 rollback 정책
- `@SpringLiteTest`와 mock web 테스트 지원
- JDBC/H2 기반 예제 앱과 설정 주입 예시

## 완료된 초기 확장

아래 항목은 이미 구현되었으며, 이후 기능은 이 구조를 전제로 확장한다.

- 조건부 자동 설정: `@ConditionalOnMissingBean`, `@ConditionalOnClass`, `@ConditionalOnProperty`
- 기능별 auto-configuration과 `WebServer` / `WebServerFactory` 분리
- `ResponseEntity`와 상태/헤더/빈 본문 처리
- `@Order` 기반 AOP/트랜잭션 interceptor chain
- `FactoryBean`, Aware callback, 의존 경로가 포함된 순환 참조 fail-fast
- read-only transaction hint, 메시지 converter 최소 협상, actuator-lite

## 현재 추천 순서

1. 간단한 repository abstraction과 row-mapping helper
2. 요청/메서드 실행 시간 측정 및 metrics registry
3. 정적 리소스 서빙과 cache header
4. OpenAPI-lite 및 CLI 진단 도구

## Priority 1. JDBC / Transaction 고도화

### 14. DataSource 추상화 확장

연결 전략이 단순한 만큼 학습 범위를 넓힐 여지가 있다.

구현 후보:

- 단순 pooled datasource
- connection acquisition 추상화

완료 기준:

- `DriverManagerDataSource` 외의 확장 지점이 제공된다.

## 추가 확장 후보

아래 항목들은 현재 백로그 이후에 고려할 만한 중장기 확장 목록이다.

## Priority 8. Configuration And Environment

### 19. 타입 변환 서비스 분리

현재 타입 변환은 웹과 `@Value`에서 각각 단순하게 처리된다. 공통 `ConversionService`로 끌어올리면 구조가 좋아진다.

구현 후보:

- 문자열 -> 숫자/불리언/enum 변환
- 커스텀 converter 등록 지점
- 웹 바인딩과 설정 주입 공통 사용

완료 기준:

- 타입 변환 규칙이 한 곳으로 수렴한다.

## Priority 9. Web MVC 고도화

### 21. 정적 리소스 서빙

내장 서버와 MVC가 있는 만큼 정적 파일 제공도 좋은 학습 포인트다.

구현 후보:

- `/static/**` 클래스패스 리소스 매핑
- 기본 캐시 헤더

완료 기준:

- HTML/CSS/JS 파일을 간단히 서비스할 수 있다.

## Priority 10. Container And Extension Model

## Priority 11. Transactions And Data

### 27. 간단한 repository 추상화

JDBC 위에 한 단계 더 올려 학습용 data abstraction을 만들 수 있다.

구현 후보:

- CRUD repository 인터페이스
- entity row mapping 헬퍼

완료 기준:

- 반복적인 JDBC repository 코드가 줄어든다.

## Priority 12. Observability And Operations

### 28. 요청 로깅 / 실행 시간 측정

프레임워크를 학습할 때 observability는 좋은 공통 관심사 예제다.

구현 후보:

- 요청 로그 interceptor
- 메서드 실행 시간 측정 aspect
- 간단한 metrics registry

완료 기준:

- 웹 요청과 서비스 호출의 실행 흐름을 눈으로 확인할 수 있다.

## Priority 13. Developer Experience

### 30. 코드 생성 없는 API 문서화

웹 애노테이션 메타데이터를 읽어서 문서를 뽑아내면 학습 프로젝트로서 만족도가 높다.

구현 후보:

- 엔드포인트 목록 출력
- 요청/응답 타입 요약
- 간단한 OpenAPI-lite JSON

완료 기준:

- 현재 등록된 REST API를 코드 외부에서도 확인할 수 있다.

### 31. CLI 진단 도구

컨테이너 상태를 점검하는 개발 도구가 있으면 디버깅이 쉬워진다.

구현 후보:

- 등록 Bean 목록 출력
- 의존성 그래프 출력
- 조건부 자동 설정 평가 결과 출력

완료 기준:

- 실행 없이도 컨테이너 구성을 진단할 수 있다.

## 커밋 단위 권장안

앞으로도 작업은 기능 단위로 자르는 편이 좋다.

- 애노테이션/API 추가
- 런타임 해석 로직 추가
- 예제 앱 반영
- 테스트 보강
- 문서 갱신

예시:

- `feat(boot): add conditional auto-configuration support`
- `feat(web): add response entity support`
- `feat(aop): add aspect-style interceptor registration`
- `test(test): add context bootstrap support coverage`
- `docs: update next implementation backlog`
