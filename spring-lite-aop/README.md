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

현재는 메서드 이름 또는 메서드 애노테이션 기준의 최소 `@Aspect` 모델과 `@Order` 기반 interceptor chain 정렬까지 지원한다. 다만 Spring 수준의 `Advice`, `Advisor`, 풍부한 `Pointcut` 표현식 추상화는 아직 축소되어 있다.
