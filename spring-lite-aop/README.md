# spring-lite-aop

프록시 생성과 메서드 인터셉션 체인을 담당한다.

## 현재 패키지

- `lite.spring.aop`
- `lite.spring.aop.support`

## 주요 내용

- `MethodInterceptor`
- `MethodInvocation`
- JDK Dynamic Proxy 및 클래스 기반 프록시 `ProxyFactory`

현재는 `Advice`, `Advisor`, `Pointcut`, `@Aspect` 스타일 모델은 아직 구현 전이다.
