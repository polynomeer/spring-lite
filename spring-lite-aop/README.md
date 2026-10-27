# spring-lite-aop

`spring-lite-aop`는 프록시 생성과 메서드 인터셉션 체인을 담당한다. 공통 관심사를 타깃 객체 바깥에서 합성하는 최소 AOP 인프라다.

## 역할

- JDK 동적 프록시와 클래스 기반 프록시 생성
- `MethodInvocation` 기반 인터셉터 체인 구성
- `@Aspect`, `@Before`, `@Around`, `@AfterReturning` 해석
- `@Order` 기반 advice 실행 순서 제어
- `@Timed` 기반 메서드 실행 시간 기록
- What-if `aop.reverse-interceptor-order`(호출 시점에 인터셉터 체인을 거꾸로 실행)와 `aop.force-class-proxy`(인터페이스가 있어도 하위 클래스 프록시 생성)

## 핵심 패키지

- `lite.spring.aop`
- `lite.spring.aop.annotation`
- `lite.spring.aop.support`

## 공개 API와 진입점

- `MethodInterceptor`
- `MethodInvocation`
- `ProxyFactory`

애플리케이션 코드는 보통 직접 이 API를 호출하지 않지만, 트랜잭션과 선언형 AOP가 모두 이 모듈의 프록시 체인 위에서 동작한다.

## 내부 핵심 클래스

- `ProxyFactory`
  - 인터페이스 유무에 따라 프록시 전략을 고른다.
- `MethodInvocation`
  - 현재 호출 대상, 메서드, 인자, `proceed()` 상태를 보관한다.
- `AspectBeanPostProcessor`
  - aspect 빈을 읽어 인터셉터로 변환하고 프록시를 합성한다.
- `TimedBeanPostProcessor`
  - `@Timed` 메서드 또는 타입을 프록시로 감싸고 `MetricsRegistry`에 호출 횟수와 누적 시간을 기록한다.

## 호출 흐름

1. 컨테이너가 aspect 빈과 일반 빈을 초기화한다.
2. `AspectBeanPostProcessor`가 advice 메타데이터를 수집한다.
3. 대상 빈 초기화 후 인터셉터 목록을 계산한다.
4. `ProxyFactory.createProxy(...)`가 프록시를 만든다.
5. 메서드 호출 시 `MethodInvocation.proceed()` 체인이 순차 실행된다.

## 실행 시간 측정

`@Timed`는 메서드나 클래스에 붙일 수 있다. 기본 metric 이름은 `<beanName>.<methodName>`이며, `@Timed("checkout.submit")`처럼 명시적으로 지정할 수도 있다. 예외가 발생한 호출도 `finally` 블록에서 기록되므로, 호출량과 실패 경로의 비용을 함께 관찰할 수 있다.

## 테스트 포인트

- `AspectBeanPostProcessorTest`
  - before / around / after-returning 조합
  - 인터셉터 정렬
  - 프록시 생성 전략
- `TimedBeanPostProcessorTest`
  - 메서드/타입 단위 측정, 명시적 metric 이름, 예외 호출 기록

## 실제 Spring 대응

- `ProxyFactory`
- `ReflectiveMethodInvocation`
- `AbstractAutoProxyCreator`

실제 Spring은 advisor, pointcut, auto-proxy creator를 더 일반화된 추상화로 제공한다. Spring Lite는 그 구조를 학습 가능한 최소 단위로 압축한다.

## 현재 한계

- advisor abstraction 미지원
- 포인트컷 표현식은 메서드명/애너테이션 중심의 최소 모델
- introduction, weaving, 복합 포인트컷 미지원
