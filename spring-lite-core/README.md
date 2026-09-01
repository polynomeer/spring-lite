# spring-lite-core

`spring-lite-core`는 다른 모든 모듈이 공유하는 가장 낮은 레벨의 공통 기반이다. 애너테이션 모델, 예외 타입, 리플렉션 유틸리티, 프로퍼티 해석, 타입 변환, 검증 규칙이 여기에 모여 있다.

## 역할

- 공통 애너테이션과 메타데이터 모델 제공
- `BeansException` 계열 공용 예외 제공
- 리플렉션 접근 보조
- 프로퍼티 해석과 placeholder 처리
- 문자열 기반 타입 변환
- 입력 검증 규칙과 위반 모델 제공

## 핵심 패키지

- `lite.spring.core.annotation`
- `lite.spring.core.convert`
- `lite.spring.core.exception`
- `lite.spring.core.reflect`
- `lite.spring.core.metrics`
- `lite.spring.core.util`
- `lite.spring.core.validation`

## 공개 API와 진입점

- `@Component`, `@Configuration`, `@Bean`, `@Autowired`
- `@Qualifier`, `@Value`
- `@Order`, `Ordered`
- `ConversionService`, `DefaultConversionService`
- `PropertyResolver`
- `Validator`, `SimpleValidator`

## 내부 핵심 클래스

- `PropertyResolver`
  - `application.yml`, profile 파일, 런타임 오버라이드를 병합한다.
- `DefaultConversionService`
  - 컨테이너 `@Value` 주입과 웹 바인딩에서 공통 타입 변환을 수행한다.
- `SimpleValidator`
  - `@NotNull`, `@Min`, `@Size`, 중첩 `@Valid`를 검사한다.
- `ReflectionUtils`
  - 메서드 호출과 접근 제어 우회를 단순화한다.
- `OrderUtils`
  - `@Order`와 `Ordered` 기준의 정렬 규칙을 제공한다.
- `MetricsRegistry`
  - counter와 timer의 스레드 안전한 in-memory 스냅샷을 제공한다.

## 호출 흐름에서의 위치

`spring-lite-core`는 단독 런타임을 가지지 않는다. 대신 다른 모듈이 아래처럼 공통적으로 의존한다.

- `spring-lite-context`
  - 애너테이션 해석, 프로퍼티 주입, 타입 변환
- `spring-lite-aop`
  - `@Order` 해석
- `spring-lite-web`
  - 요청 파라미터 변환, 입력 검증
- `spring-lite-boot`
  - 프로퍼티 병합

## 테스트 포인트

- `DefaultConversionServiceTest`
  - 숫자, 불리언, enum 변환
- `PropertyResolverTest`
  - 기본 설정, 프로파일, placeholder, 오버라이드
- `SimpleValidatorTest`
  - 제약 조건과 중첩 검증
- `ReflectionUtilsTest`, `ClassUtilsTest`
  - 리플렉션/클래스 유틸리티 안정성

## 실제 Spring 대응

- `Environment` / 프로퍼티 해석 계층
- `ConversionService`
- `Validator`
- 공통 annotation / util 계층

## 현재 한계

- 변환 타입 종류는 최소 집합 중심
- 검증 애너테이션 종류 제한적
- 외부 바인딩/메시지 국제화 같은 고급 인프라 미지원
