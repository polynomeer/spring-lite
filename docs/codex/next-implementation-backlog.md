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
- 기본 인프라 자동 등록을 포함한 `SpringLiteApplication`

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

## Priority 1. Boot 완성도

### 1. 조건부 자동 설정

현재 자동 설정은 코드 기반 기본 등록 수준이다. 다음 단계는 Spring Boot 스타일의 조건부 등록 모델을 추가하는 것이다.

구현 후보:

- `@ConditionalOnMissingBean`
- `@ConditionalOnClass`
- `@ConditionalOnProperty`

완료 기준:

- 기본 인프라 Bean이 "필요할 때만" 등록된다.
- 사용자 정의 Bean이 있으면 자동 설정이 자연스럽게 비활성화된다.

### 2. 자동 설정 모듈화

현재 부트스트랩 인프라는 하나의 registrar에 모여 있다. 이를 기능별 자동 설정 클래스로 분리하면 구조가 더 명확해진다.

구현 후보:

- `WebAutoConfiguration`
- `JdbcAutoConfiguration`
- `TransactionAutoConfiguration`
- `JsonAutoConfiguration`

완료 기준:

- 자동 설정 단위별 책임이 분리된다.
- 예제 앱이 필요한 자동 설정만 로드하는 흐름이 드러난다.

### 3. 서버 추상화

현재는 JDK `HttpServer`에 고정되어 있다. Boot 계층과 서버 구현을 분리하면 향후 확장이 쉬워진다.

구현 후보:

- `WebServer`
- `WebServerFactory`
- `JdkWebServer`

완료 기준:

- 애플리케이션 실행 계층이 구체 서버 구현에 직접 의존하지 않는다.

## Priority 2. AOP 재현도

### 4. Advisor 정렬과 체인 고도화

트랜잭션, 로깅, 측정이 함께 적용될 때 실행 순서가 명확해야 한다.

구현 후보:

- `Ordered` 또는 `@Order`
- interceptor chain 정렬 규칙
- 중첩 advisor 적용 테스트

완료 기준:

- 동일 Bean에 여러 advisor가 적용될 때 순서가 예측 가능하다.

## Priority 3. Web MVC 확장

### 6. 응답 모델 확장

현재는 JSON 본문 중심이다. 상태 코드와 헤더를 표현하는 응답 모델이 필요하다.

구현 후보:

- `ResponseEntity`
- 응답 헤더 설정 API
- 빈 본문 응답 처리

완료 기준:

- 컨트롤러가 상태 코드, 헤더, 바디를 명시적으로 제어할 수 있다.

## Priority 4. Container 심화

### 10. 순환 의존성 정책 명시

현재 구조에서 순환 참조는 실패하거나 우연히 통과할 수 있다. 정책을 명확히 해야 한다.

구현 후보:

- 생성자 순환 의존 탐지
- 의존성 경로 포함 예외 메시지
- 필드/세터 주입을 도입하지 않는다면 명시적 비지원 정책 문서화

완료 기준:

- 순환 의존 시 실패 이유와 경로를 한 번에 확인할 수 있다.

## Priority 5. JDBC / Transaction 고도화

### 14. DataSource 추상화 확장

연결 전략이 단순한 만큼 학습 범위를 넓힐 여지가 있다.

구현 후보:

- 단순 pooled datasource
- connection acquisition 추상화

완료 기준:

- `DriverManagerDataSource` 외의 확장 지점이 제공된다.

## Priority 6. Test Support

## Priority 7. Example App 강화

## 현재 이후 추천 구현 순서

현 시점에서 가장 효율적인 순서는 아래다.

1. 설정 프로파일 지원
2. `@ControllerAdvice`와 전역 예외 처리

## 추가 확장 후보

아래 항목들은 현재 백로그 이후에 고려할 만한 중장기 확장 목록이다.

## Priority 8. Configuration And Environment

### 19. 설정 프로파일 지원

Spring의 `application-{profile}.yml`과 유사한 개념이 들어가면 Boot 계층 설명력이 크게 올라간다.

구현 후보:

- active profile 지정
- profile별 설정 파일 병합
- 기본값과 override 우선순위

완료 기준:

- 개발/테스트/로컬 설정을 분리해서 애플리케이션 동작을 바꿀 수 있다.

### 20. 타입 변환 서비스 분리

현재 타입 변환은 웹과 `@Value`에서 각각 단순하게 처리된다. 공통 `ConversionService`로 끌어올리면 구조가 좋아진다.

구현 후보:

- 문자열 -> 숫자/불리언/enum 변환
- 커스텀 converter 등록 지점
- 웹 바인딩과 설정 주입 공통 사용

완료 기준:

- 타입 변환 규칙이 한 곳으로 수렴한다.

## Priority 9. Web MVC 고도화

### 21. `@ControllerAdvice`와 전역 예외 처리

현재 예외 처리는 컨트롤러 내부 `@ExceptionHandler` 위주다. 전역 처리기가 있으면 실제 Spring MVC와 더 닮아진다.

구현 후보:

- `@ControllerAdvice`
- 전역 `@ExceptionHandler`
- 예외 resolver 우선순위

완료 기준:

- 여러 컨트롤러에 공통 에러 응답 정책을 적용할 수 있다.

### 22. 콘텐츠 협상과 메시지 변환기 추상화

현재는 JSON 고정이다. 메시지 변환기 추상화를 도입하면 MVC 구조가 더 Spring답게 변한다.

구현 후보:

- `HttpMessageConverter`
- JSON converter 분리
- `text/plain` 또는 `application/json` 최소 협상

완료 기준:

- 반환 타입과 `Content-Type` 처리 계층이 분리된다.

### 23. 정적 리소스 서빙

내장 서버와 MVC가 있는 만큼 정적 파일 제공도 좋은 학습 포인트다.

구현 후보:

- `/static/**` 클래스패스 리소스 매핑
- 기본 캐시 헤더

완료 기준:

- HTML/CSS/JS 파일을 간단히 서비스할 수 있다.

## Priority 10. Container And Extension Model

### 24. `FactoryBean` 유사 모델

Spring에서 "Bean 자체"와 "Bean을 만들어내는 팩토리"를 구분하는 개념은 중요하다.

구현 후보:

- 팩토리 객체 계약
- 팩토리 결과물과 팩토리 자신 조회 구분

완료 기준:

- 인프라성 Bean 생성 패턴을 일반화할 수 있다.

### 25. Aware 인터페이스 최소 지원

컨테이너 확장 학습을 위해 `ApplicationContextAware` 같은 콜백 모델은 의미가 있다.

구현 후보:

- `ApplicationContextAware`
- `BeanNameAware`

완료 기준:

- 특정 Bean이 컨테이너 메타정보를 안전하게 받을 수 있다.

## Priority 11. Transactions And Data

### 26. 선언적 읽기 전용 트랜잭션

트랜잭션 속성 모델의 첫 확장으로 `readOnly`는 비교적 단순하고 설명 가치가 높다.

구현 후보:

- `@Transactional(readOnly = true)`
- JDBC connection 힌트 반영 여부 검토

완료 기준:

- 읽기 전용 서비스 메서드의 정책이 애노테이션에 드러난다.

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

### 29. 헬스체크와 정보 엔드포인트

Boot 계층 설명용으로 actuator-lite 성격의 기능을 넣을 수 있다.

구현 후보:

- `/actuator/health`
- `/actuator/info`
- 등록된 Bean 수나 서버 포트 노출

완료 기준:

- 러닝 애플리케이션의 상태를 최소 수준으로 확인할 수 있다.

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
