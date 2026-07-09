# spring-lite-context

IoC 컨테이너의 중심 모듈이다. Bean 등록, 조회, 생성, 생명주기, 스캐닝을 담당한다.

## 현재 패키지

- `lite.spring.context`
- `lite.spring.context.bean`
- `lite.spring.context.event`
- `lite.spring.context.factory`
- `lite.spring.context.support`
- `lite.spring.context.scan`

## 주요 내용

- `ApplicationContext`, `ConfigurableApplicationContext`
- `BeanDefinition`
- `AnnotationConfigApplicationContext`
- `ClassPathScanner`
- singleton / prototype scope
- `ApplicationListener`, `ContextRefreshedEvent`, `ContextClosedEvent`
- Bean lifecycle, `BeanPostProcessor`, JAR 스캔
