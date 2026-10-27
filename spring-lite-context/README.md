# spring-lite-context

`spring-lite-context`는 Spring Lite의 IoC 컨테이너 본체다. 빈 정의 등록, 컴포넌트 스캔, 생성자 주입, 설정 클래스 처리, 스코프, 이벤트, 라이프사이클, Bean 후처리를 조율한다.

## 역할

- `BeanDefinition` 중심 메타데이터 모델 유지
- `@Component`, `@Configuration`, `@Bean` 기반 빈 정의 등록
- 생성자 주입, `@Qualifier`, `@Value` 기반 의존성 해석
- singleton / prototype 스코프와 destroy callback 관리
- `BeanPostProcessor`, `@PostConstruct`, `@PreDestroy` 지원
- `BeanNameAware`, `ApplicationContextAware` callback 지원
- `FactoryBean` product 조회와 `&beanName` factory dereference 지원
- `ContextRefreshedEvent`, `ContextClosedEvent` 발행과 `ApplicationListener` / `@EventListener` 구독, `@Order` 실행 순서
- 빈 생성 단계(create, 생성자/`@Bean` 호출, Aware, `@PostConstruct`, 후처리기별 교체 여부, ready, 순환 참조)를 `TraceRecorder` 이벤트로 기록하고 마지막 refresh 기록을 `getRefreshTrace()`로 보관, `BeanRuntimeDescriptor`에 주입받은 빈 목록 제공

## 핵심 패키지

- `lite.spring.context`
- `lite.spring.context.bean`
- `lite.spring.context.event`
- `lite.spring.context.factory`
- `lite.spring.context.scan`
- `lite.spring.context.support`

## 공개 API와 진입점

- `ApplicationContext`
- `ConfigurableApplicationContext`
- `AnnotationConfigApplicationContext`
- `BeanPostProcessor`
- `BeanNameAware`
- `ApplicationContextAware`
- `ApplicationListener`
- `@EventListener`
- `FactoryBean`

가장 중요한 진입점은 `AnnotationConfigApplicationContext`다. 대부분의 컨테이너 동작은 이 클래스에서 시작해 등록, 생성, 초기화, 이벤트 발행으로 이어진다.

## 내부 핵심 클래스

- `BeanDefinition`
  - 빈 이름, 타입, 생성 전략, 스코프, qualifier를 보관한다.
- `AnnotationConfigApplicationContext`
  - 등록, refresh, bean 생성, 의존성 해석, 후처리 적용의 중심 알고리즘을 가진다.
- `ClassPathScanner`
  - 파일 시스템과 JAR 양쪽에서 후보 클래스를 수집한다.
- `AnnotationUtils`
  - 메타 애너테이션까지 따라가며 관리 대상 타입을 판정한다.
- `BeanNameGenerator`
  - 타입 기반 기본 빈 이름을 만든다.

## 호출 흐름

1. `register(...)` 또는 `scan(...)`이 후보 타입을 수집한다.
2. `registerDiscoveredClass(...)`가 후보를 `BeanDefinition`으로 바꾼다.
3. `refresh()`가 후처리기와 설정 클래스를 먼저 초기화한다.
4. `createBean(...)`이 생성자 선택, 의존성 해석, 초기화, 후처리를 수행한다.
5. 싱글톤은 캐시에 저장되고, close 시 destroy callback이 역순 실행된다.

빈 초기화 중에는 `@Value` 필드 주입 뒤에 `BeanNameAware`와 `ApplicationContextAware` callback을 호출한다. 그 다음 `BeanPostProcessor#before`, `@PostConstruct`, `BeanPostProcessor#after` 순서로 진행한다. `@PostConstruct`는 상위 클래스에 선언된 메서드도 포함해 탐색한다.

`FactoryBean<T>`은 bean name으로 조회하면 product `T`를 반환한다. factory 인스턴스 자체가 필요하면 `&beanName`으로 조회한다. factory가 singleton product를 선언하면 context가 product를 캐시하고, 그렇지 않으면 조회마다 새 product를 요청한다.

## 테스트 포인트

- `AnnotationConfigApplicationContextTest`
  - 등록, 생성자 주입, `@Qualifier`, `@Value`, 스코프, 이벤트, 라이프사이클
- `ClassPathScannerTest`
  - 파일 시스템 / JAR 스캔
- `AnnotationSupportTest`
  - 메타 애너테이션 판별

## 실제 Spring 대응

- `AnnotationConfigApplicationContext`
- `DefaultListableBeanFactory`
- `AbstractAutowireCapableBeanFactory`
- `ConfigurationClassPostProcessor`

Spring Lite에서는 이 책임들이 더 적은 클래스에 압축되어 있다. 실제 Spring은 같은 문제를 더 세분화된 계층과 확장 포인트로 푼다.

## 현재 한계

- 고급 스코프 request/session 미지원
- `BeanFactoryPostProcessor`, `ImportSelector` 계열 미지원
- 생성자 순환 참조는 fail-fast 처리하며 `a -> b -> a` 의존 경로를 메시지에 포함
- 컬렉션/지연 주입 같은 고급 의존성 해석은 제한적
- 이벤트는 동기적으로 현재 스레드에서 실행되며 async, 조건식, transaction phase는 미지원
