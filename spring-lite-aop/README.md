# spring-lite-aop

프록시 생성과 메서드 인터셉션 체인을 담당한다.

## 현재 패키지

- `lite.spring.aop`
- `lite.spring.aop.annotation`
- `lite.spring.aop.support`

## 주요 내용

- `MethodInterceptor`
- `MethodInvocation`
- JDK Dynamic Proxy 및 클래스 기반 프록시 `ProxyFactory`
- `@Aspect`, `@Before`, `@Around`, `@AfterReturning`
- `AspectBeanPostProcessor`

현재는 메서드 이름 또는 메서드 애노테이션 기준의 최소 `@Aspect` 모델까지 지원한다. `Advice`, `Advisor`, `Pointcut` 추상화와 ordered advice는 아직 구현 전이다.
