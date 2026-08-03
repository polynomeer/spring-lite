# Build Along Implementation Guide

이 문서는 `Build Your Own Spring Lite`를 실제로 손으로 구현해 가는 독자를 위한 코드 중심 원고다. 설명보다 구현 순서, 테스트, 핵심 클래스 코드, 리팩터링 포인트를 더 강하게 드러낸다. 목표는 독자가 이 문서만 따라가도 `spring-lite`의 MVP를 단계적으로 재구성할 수 있게 만드는 것이다.

이 문서의 범위는 Part 2부터 Part 6까지다.

- Part 2: IoC 컨테이너
- Part 3: 라이프사이클과 확장 포인트
- Part 4: 프록시, AOP, 트랜잭션
- Part 5: Web MVC
- Part 6: JDBC, Boot, Test, Example App

## 사용 방식

각 장은 같은 형식을 따른다.

1. 먼저 통과시킬 테스트를 정의한다.
2. 필요한 최소 API를 선언한다.
3. 실제 구현 코드를 추가한다.
4. 다음 장을 위해 어떤 설계 여지를 남기는지 정리한다.

또한 구현형 독서라고 해서 코드만 따라 적는 방식으로 읽지는 않는다. 각 장마다 아래 질문을 함께 유지하는 편이 좋다.

1. 지금 추가하는 코드는 어떤 설계 문제를 해결하는가
2. 이 단계에서 의도적으로 생략한 복잡성은 무엇인가
3. 실패한다면 어떤 테스트나 어떤 예외로 드러나야 하는가
4. 실제 Spring은 이 문제를 어디까지 더 일반화했는가

이 문서는 현재 저장소의 실제 구현을 기준으로 작성했다. 따라서 본문에 실린 코드는 설명을 위해 일부 줄을 생략하더라도 구조와 책임은 실제 코드와 일치한다.

---

## Part 2. IoC 컨테이너를 직접 만든다

### Chapter 3. `BeanDefinition`과 첫 번째 Registry

첫 장에서는 컨테이너를 "객체 보관함"이 아니라 "객체 생성 계획 저장소"로 시작한다.

먼저 필요한 테스트는 다음과 같다.

```java
@Test
void registersBeanDefinitionBeforeInstantiation() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
    context.register(TestConfig.class);

    assertThat(context.containsBeanDefinition("testConfig")).isTrue();
}
```

핵심 메타데이터 클래스는 아래처럼 시작한다.

```java
public final class BeanDefinition {
    public enum Kind {
        COMPONENT,
        CONFIGURATION,
        FACTORY_METHOD,
        INFRASTRUCTURE
    }

    private final String name;
    private final Class<?> beanType;
    private final Kind kind;
    private final Class<?> configurationClass;
    private final Method factoryMethod;
    private final boolean singleton;
    private final String qualifier;

    private BeanDefinition(
        String name,
        Class<?> beanType,
        Kind kind,
        Class<?> configurationClass,
        Method factoryMethod,
        boolean singleton,
        String qualifier
    ) {
        this.name = name;
        this.beanType = beanType;
        this.kind = kind;
        this.configurationClass = configurationClass;
        this.factoryMethod = factoryMethod;
        this.singleton = singleton;
        this.qualifier = qualifier;
    }

    public static BeanDefinition component(
        String name,
        Class<?> beanType,
        Kind kind,
        boolean singleton,
        String qualifier
    ) {
        return new BeanDefinition(name, beanType, kind, null, null, singleton, qualifier);
    }

    public static BeanDefinition factoryMethod(
        String name,
        Class<?> beanType,
        Class<?> configurationClass,
        Method factoryMethod,
        boolean singleton,
        String qualifier
    ) {
        return new BeanDefinition(name, beanType, Kind.FACTORY_METHOD, configurationClass, factoryMethod, singleton, qualifier);
    }
}
```

이 단계의 컨테이너는 두 개의 저장소만 있으면 된다.

```java
public class AnnotationConfigApplicationContext implements ConfigurableApplicationContext {
    private final Map<String, BeanDefinition> beanDefinitions = new LinkedHashMap<>();
    private final Map<String, Object> singletons = new LinkedHashMap<>();

    @Override
    public void registerBeanDefinition(BeanDefinition beanDefinition) {
        beanDefinitions.put(beanDefinition.name(), beanDefinition);
    }

    @Override
    public void registerSingleton(String beanName, Object singleton) {
        singletons.put(beanName, singleton);
    }
}
```

여기서 중요한 것은 아직 `new`를 거의 하지 않는다는 점이다. 지금 단계의 목적은 "정의가 먼저다"라는 축을 세우는 것이다.

#### 실패로 확인할 포인트

- 빈 정의 등록과 실제 인스턴스 생성 시점을 섞지 않았는가
- 같은 이름의 정의가 중복 등록될 때 정책이 모호하지 않은가
- `BeanDefinition`이 인스턴스 생성에 필요한 정보를 충분히 담고 있는가

#### 클래스 구조 해설

- `BeanDefinition`
  - 책임: 객체 생성 계획을 보관한다.
  - 핵심 필드:
    - `name`: 조회 키
    - `beanType`: 타입 기반 주입 기준
    - `kind`: 생성 전략 분기
    - `singleton`: 캐시 저장 정책
  - 설계 이유: 생성 전에 이미 빈을 설명할 수 있어야 컨테이너가 메타데이터 중심으로 동작할 수 있다.

- `AnnotationConfigApplicationContext`
  - 현재 단계 책임: 정의 저장소와 싱글톤 저장소를 분리한다.
  - 아직 없는 책임: 의존성 해석, 라이프사이클, 후처리기.
  - 설계 이유: 가장 작은 컨테이너 축부터 세우기 위해서다.

#### 메서드별 구현 워크스루

이제부터는 `AnnotationConfigApplicationContext`를 단순 API가 아니라 "작은 런타임"으로 읽는 습관이 중요하다.

- `register(...)`
  - 설정 클래스를 입력으로 받는다.
  - 각 클래스를 `registerDiscoveredClass(...)`로 넘긴다.
  - `@ComponentScan`이 있으면 추가 스캔까지 연결한다.
- `scan(...)`
  - 패키지 단위 후보 수집만 담당한다.
  - 실제 빈 정의 생성은 하지 않고, 수집한 클래스를 다시 `registerDiscoveredClass(...)`로 넘긴다.
- `registerDiscoveredClass(...)`
  - 관리 대상 타입인지 판별한다.
  - `BeanDefinition.Kind`를 계산한다.
  - 빈 이름, 스코프, qualifier를 추출해 정의를 등록한다.
  - 설정 클래스라면 `registerBeanMethods(...)`까지 이어진다.

독자가 이 흐름을 이해해야 하는 이유는 명확하다. 실제 Spring에서도 "후보 수집", "정의 생성", "추가 메타데이터 처리"는 같은 단계가 아니기 때문이다. build-along 책에서는 이 차이를 일찍부터 분명히 보여주는 편이 좋다.

#### 실제 Spring과 바로 연결해 보기

- `AnnotationConfigApplicationContext`
- `BeanDefinitionRegistry`
- `DefaultListableBeanFactory`

### Chapter 4. 생성자 선택과 의존성 해석

이 장부터 컨테이너가 실제로 객체를 만들기 시작한다. 먼저 테스트를 작성한다.

```java
@Test
void resolvesConstructorDependencies() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TestConfig.class);

    GreetingService greetingService = context.getBean(GreetingService.class);

    assertThat(greetingService.format()).isEqualTo("hello");
}
```

생성자 선택 규칙은 가능한 한 단순해야 한다.

```java
private Constructor<?> selectConstructor(Class<?> beanType) {
    Constructor<?>[] constructors = beanType.getDeclaredConstructors();
    List<Constructor<?>> autowiredConstructors = Arrays.stream(constructors)
        .filter(constructor -> constructor.isAnnotationPresent(Autowired.class))
        .toList();
    if (autowiredConstructors.size() > 1) {
        throw new BeansException("Multiple @Autowired constructors found in " + beanType.getName());
    }
    if (!autowiredConstructors.isEmpty()) {
        return autowiredConstructors.getFirst();
    }
    if (constructors.length == 1) {
        return constructors[0];
    }
    return Arrays.stream(constructors)
        .filter(constructor -> constructor.getParameterCount() == 0)
        .findFirst()
        .orElseThrow(() -> new BeansException("No suitable constructor found for " + beanType.getName()));
}
```

의존성 해석은 타입 중심으로 시작한다.

```java
private Object resolveDependency(Parameter parameter) {
    Class<?> dependencyType = parameter.getType();
    Map<String, ?> candidates = getBeansOfType(dependencyType);
    if (candidates.isEmpty()) {
        throw new NoSuchBeanException("No bean of type " + dependencyType.getName());
    }
    Qualifier qualifier = parameter.getAnnotation(Qualifier.class);
    if (qualifier != null) {
        return resolveQualifiedDependency(dependencyType, qualifier.value(), candidates);
    }
    if (candidates.size() > 1) {
        throw new NoUniqueBeanException("Multiple beans of type " + dependencyType.getName() + ": " + candidates.keySet());
    }
    return candidates.values().iterator().next();
}
```

마지막으로 실제 생성 루프를 연결한다.

```java
private Object createBean(String beanName, BeanDefinition beanDefinition) {
    if (beanDefinition.singleton() && singletons.containsKey(beanName)) {
        return singletons.get(beanName);
    }
    if (!beansInCreation.add(beanName)) {
        throw new BeansException("Circular dependency detected while creating " + beanName);
    }
    try {
        Object created = switch (beanDefinition.kind()) {
            case FACTORY_METHOD -> invokeFactoryMethod(beanDefinition);
            default -> instantiateWithConstructor(beanDefinition.beanType());
        };
        Object initialized = initializeBean(beanName, created);
        if (beanDefinition.singleton()) {
            singletons.put(beanName, initialized);
        }
        return initialized;
    } finally {
        beansInCreation.remove(beanName);
    }
}
```

이 장이 끝나면 컨테이너는 최소 생성자 주입을 수행할 수 있어야 한다.

#### 실패로 확인할 포인트

- 후보 빈이 없을 때 즉시 실패하는가
- 같은 타입 후보가 여러 개인데 조용히 하나를 고르지 않는가
- 순환 참조가 시작되면 생성 중 마커가 정확히 탐지하는가

#### 메서드 구조 해설

- `selectConstructor(...)`
  - 책임: 컨테이너가 사용할 생성자를 결정한다.
  - 규칙:
    - `@Autowired` 생성자 우선
    - 생성자가 하나면 자동 선택
    - 아니면 기본 생성자 시도

- `resolveDependency(...)`
  - 책임: 생성자 파라미터 하나를 실제 빈으로 변환한다.
  - 분기:
    - 후보 없음
    - 후보 여러 개
    - `@Qualifier` 존재

- `createBean(...)`
  - 책임: 실제 생성 알고리즘을 총괄한다.
  - 단계:
    - 순환 참조 감지
    - 생성 전략 분기
    - 초기화 실행
    - 싱글톤 캐시 저장

#### `createBean(...)` 전체 읽기

이 메서드는 Part 2 전체를 관통하는 첫 번째 핵심 알고리즘이다. build-along 문서에서는 가급적 이 메서드를 앞뒤 생략 없이 읽게 하는 편이 좋다.

1. 싱글톤 캐시를 먼저 본다.
2. `beansInCreation`으로 순환 참조를 감지한다.
3. `BeanDefinition.Kind`에 따라 생성 전략을 고른다.
4. 생성 직후 `initializeBean(...)`로 제어를 넘긴다.
5. 싱글톤이면 캐시에 저장한다.
6. `finally`에서 생성 중 마커를 제거한다.

이 순서가 중요한 이유는, 이후 라이프사이클과 프록시 장이 모두 4번 단계에 개입하기 때문이다. 즉, 지금은 단순 생성 메서드처럼 보여도 사실상 이후 모든 확장의 허브다.

#### 실제 Spring과 바로 연결해 보기

- `AbstractAutowireCapableBeanFactory.createBean(...)`
- `ConstructorResolver`
- `DefaultListableBeanFactory.resolveDependency(...)`

### Chapter 5. 컴포넌트 스캔

이제 수동 등록을 줄인다. 테스트는 아래처럼 시작한다.

```java
@Test
void scansComponentsFromBasePackage() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
    context.scan("lite.spring.context.fixture");
    context.refresh();

    assertThat(context.getBean("scannedGreetingService")).isNotNull();
}
```

스캐너 구현의 핵심은 파일 시스템과 JAR을 모두 다룰 수 있어야 한다는 점이다.

```java
public final class ClassPathScanner {
    public List<Class<?>> scan(String basePackage) {
        String path = basePackage.replace('.', '/');
        Enumeration<URL> resources = Thread.currentThread().getContextClassLoader().getResources(path);
        Map<String, Class<?>> classes = new LinkedHashMap<>();
        while (resources.hasMoreElements()) {
            URL resource = resources.nextElement();
            if ("file".equals(resource.getProtocol())) {
                addClasses(classes, scanDirectory(basePackage, new File(resource.getFile())));
            } else if ("jar".equals(resource.getProtocol())) {
                addClasses(classes, scanJar(basePackage, path, resource));
            }
        }
        addClasses(classes, scanUrlsFromClassLoader(path));
        return new ArrayList<>(classes.values());
    }
}
```

스캔 대상 판별은 메타 애너테이션까지 포함해야 한다.

```java
private boolean isManagedType(Class<?> candidate) {
    return AnnotationUtils.hasAnnotation(candidate, Component.class)
        || AnnotationUtils.hasAnnotation(candidate, Configuration.class);
}
```

이제 `registerDiscoveredClass()`가 스캔 결과를 `BeanDefinition`으로 바꾸는 역할을 한다.

```java
private void registerDiscoveredClass(Class<?> candidate) {
    if (candidate.isInterface() || candidate.isAnnotation() || candidate.isEnum()) {
        return;
    }
    if (!isManagedType(candidate)) {
        return;
    }
    BeanDefinition.Kind kind = AnnotationUtils.hasAnnotation(candidate, Configuration.class)
        ? Kind.CONFIGURATION
        : Kind.COMPONENT;
    BeanDefinition beanDefinition = BeanDefinition.component(
        BeanNameGenerator.generateBeanName(candidate),
        candidate,
        kind,
        isSingleton(candidate),
        extractQualifier(candidate)
    );
    registerBeanDefinition(beanDefinition);
    if (kind == Kind.CONFIGURATION) {
        registerBeanMethods(candidate);
    }
}
```

#### 클래스 구조 해설

- `ClassPathScanner`
  - 책임: 클래스패스에서 관리 대상 클래스를 수집한다.
  - 핵심 메서드:
    - `scan(...)`
    - `scanDirectory(...)`
    - `scanJar(...)`
  - 설계 이유: 개발 환경과 배포 환경의 클래스 위치가 다르기 때문이다.

- `AnnotationUtils`
  - 책임: 메타 애너테이션까지 따라가며 관리 대상 여부를 판단한다.
  - 설계 이유: `@Service`와 `@Repository`도 결국 컴포넌트 후보이기 때문이다.

#### 실패로 확인할 포인트

- 패키지 경로는 맞는데 후보가 누락되는가
- 메타 애너테이션을 놓쳐 `@Service`가 등록되지 않는가
- JAR 환경과 디렉터리 환경에서 동작이 달라지는가

#### 실제 Spring과 바로 연결해 보기

- `ClassPathScanningCandidateComponentProvider`
- `ClassPathBeanDefinitionScanner`
- `AnnotatedBeanDefinitionReader`

### Chapter 6. `@Configuration`과 `@Bean`

이 장의 테스트는 팩토리 메서드 빈을 직접 검증해야 한다.

```java
@Test
void createsFactoryMethodBeansFromConfigurationClass() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TestConfig.class);

    Formatter formatter = context.getBean(Formatter.class);

    assertThat(formatter.format("spring")).isEqualTo("[spring]");
}
```

핵심은 설정 클래스 안의 `@Bean` 메서드를 별도 정의로 등록하는 것이다.

```java
private void registerBeanMethods(Class<?> configurationClass) {
    for (Method method : configurationClass.getDeclaredMethods()) {
        Bean bean = method.getAnnotation(Bean.class);
        if (bean == null) {
            continue;
        }
        String beanName = bean.value().isBlank()
            ? BeanNameGenerator.generateBeanName(method.getName())
            : bean.value();
        BeanDefinition beanDefinition = BeanDefinition.factoryMethod(
            beanName,
            method.getReturnType(),
            configurationClass,
            method,
            isSingleton(method),
            extractQualifier(method)
        );
        registerBeanDefinition(beanDefinition);
    }
}
```

실제 생성 시점에는 설정 빈을 먼저 구한 뒤 메서드를 호출한다.

```java
private Object invokeFactoryMethod(BeanDefinition beanDefinition) {
    Object configurationBean = getBean(BeanNameGenerator.generateBeanName(beanDefinition.configurationClass()));
    Method factoryMethod = beanDefinition.factoryMethod();
    Object[] arguments = resolveExecutableArguments(factoryMethod.getParameters());
    return ReflectionUtils.invoke(factoryMethod, configurationBean, arguments);
}
```

#### 실패로 확인할 포인트

- 설정 클래스 자신이 아직 준비되지 않았는데 팩토리 메서드를 먼저 호출하지 않는가
- `@Bean` 메서드 이름과 명시 이름 전략이 충돌하지 않는가
- 설정 메서드 의존성도 동일한 해석 규칙을 따르는가

#### 실제 Spring과 바로 연결해 보기

- `ConfigurationClassPostProcessor`
- `ConfigurationClassBeanDefinitionReader`
- `BeanMethod`

이제 컨테이너는 컴포넌트 스캔과 명시적 설정 메서드를 같은 파이프라인 안에서 처리할 수 있다.

#### 메서드 구조 해설

- `registerBeanMethods(...)`
  - 책임: 설정 클래스의 `@Bean` 메서드를 별도 정의로 등록한다.
  - 설계 이유: 클래스 기반 빈과 팩토리 메서드 기반 빈을 같은 모델로 다루기 위해서다.

- `invokeFactoryMethod(...)`
  - 책임: 설정 빈 인스턴스를 구한 뒤 실제 팩토리 메서드를 실행한다.
  - 설계 이유: 컨테이너가 단순 `new` 외의 생성 전략도 다룬다는 사실을 보여 준다.

### Chapter 7. `@Qualifier`, `@Value`, 프로퍼티

이 장에서는 두 개의 테스트가 중요하다.

```java
@Test
void resolvesQualifiedDependencies() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(QualifierConfig.class);

    QualifiedFormatterClient client = context.getBean(QualifiedFormatterClient.class);

    assertThat(client.format()).isEqualTo("json");
}

@Test
void injectsValueFromPropertyResolver() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ValueConfig.class);

    ValueClient client = context.getBean(ValueClient.class);

    assertThat(client.port()).isEqualTo(8080);
}
```

`@Value`는 필드와 파라미터 양쪽에서 처리한다.

```java
private Object resolveValue(Parameter parameter) {
    Value value = parameter.getAnnotation(Value.class);
    if (value == null) {
        return resolveDependency(parameter);
    }
    String resolved = propertyResolver.resolveRequiredPlaceholder(value.value());
    return conversionService.convert(resolved, parameter.getType());
}
```

필드 주입은 초기화 전에 수행한다.

```java
private void injectFieldValues(Object bean) {
    for (Field field : bean.getClass().getDeclaredFields()) {
        Value value = field.getAnnotation(Value.class);
        if (value == null) {
            continue;
        }
        String resolved = propertyResolver.resolveRequiredPlaceholder(value.value());
        Object converted = conversionService.convert(resolved, field.getType());
        ReflectionUtils.makeAccessible(field);
        ReflectionUtils.setField(field, bean, converted);
    }
}
```

프로퍼티 리졸버는 책에서 거의 전체를 싣는 편이 좋다. 이 클래스는 독자가 "환경도 런타임 입력"이라는 감각을 얻는 데 중요하기 때문이다.

```java
public static PropertyResolver loadApplicationProperties() {
    PropertyResolver baseResolver = loadSingleResource("application.yml");
    Map<String, String> merged = new LinkedHashMap<>(baseResolver.values);
    String activeProfiles = resolveActiveProfiles(baseResolver);
    if (activeProfiles == null || activeProfiles.isBlank()) {
        return new PropertyResolver(merged);
    }
    for (String profile : activeProfiles.split(",")) {
        String trimmed = profile.trim();
        if (trimmed.isEmpty()) {
            continue;
        }
        PropertyResolver profileResolver = loadSingleResource("application-" + trimmed + ".yml");
        merged.putAll(profileResolver.values);
    }
    merged.putAll(RUNTIME_OVERRIDES.get());
    return new PropertyResolver(merged);
}
```

#### 클래스/메서드 구조 해설

- `PropertyResolver`
  - 책임: 외부 설정을 하나의 조회 모델로 통일한다.
  - 핵심 메서드:
    - `loadApplicationProperties()`
    - `resolveRequiredPlaceholder(...)`

- `resolveValue(...)`
  - 책임: 파라미터 수준 `@Value`를 실제 타입 값으로 바꾼다.
  - 단계:
    - placeholder 해석
    - 문자열 값 확보
    - 타입 변환

- `injectFieldValues(...)`
  - 책임: 필드 수준 `@Value`를 초기화 전에 주입한다.
  - 설계 이유: 생성자 주입과 별도로 "생성 후 값 보강"이 필요하기 때문이다.

### Chapter 8. Scope와 이벤트

이 장에서 먼저 잠가야 할 테스트는 두 가지다.

```java
@Test
void createsPrototypeBeansOnEveryLookup() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(PrototypeConfig.class);

    PrototypeBean first = context.getBean(PrototypeBean.class);
    PrototypeBean second = context.getBean(PrototypeBean.class);

    assertThat(first).isNotSameAs(second);
}

@Test
void publishesRefreshAndCloseEvents() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(EventConfig.class);
    EventCollectorListener listener = context.getBean(EventCollectorListener.class);

    context.close();

    assertThat(listener.events()).containsExactly("refreshed", "closed");
}
```

스코프는 최소한 `singleton`과 `prototype`만 구분해도 충분하다.

```java
private boolean isSingleton(Class<?> beanType) {
    Scope scope = AnnotationUtils.findAnnotation(beanType, Scope.class);
    return scope == null || !"prototype".equals(scope.value());
}
```

이벤트는 별도 브로커 없이 `ApplicationListener` 빈을 조회해 직접 호출한다.

```java
@Override
public void publishEvent(Object event) {
    getBeansOfType(ApplicationListener.class).values().forEach(listener -> notifyListener(listener, event));
}
```

#### 메서드 구조 해설

- `isSingleton(...)`
  - 책임: 정의 단계에서 캐시 저장 정책을 판단한다.
  - 설계 이유: 생성 전략과 수명 정책을 함께 결정하기 위해서다.

- `publishEvent(...)`
  - 책임: 현재 리스너 빈에 이벤트를 전달한다.
  - 설계 이유: 컨테이너 내부 결합을 느슨하게 유지하기 위해서다.

---

## Part 3. 라이프사이클과 확장 포인트

### Chapter 9. 초기화와 종료 훅

이 장은 라이프사이클 순서가 곧 테스트여야 한다.

```java
@Test
void invokesLifecycleCallbacksInOrder() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(DestroyConfig.class);
    LifecycleBean bean = context.getBean(LifecycleBean.class);

    assertThat(bean.events()).containsExactly("postConstruct");

    context.close();

    assertThat(bean.events()).containsExactly("postConstruct", "preDestroy");
}
```

핵심 구현은 `initializeBean()`이다.

```java
private Object initializeBean(String beanName, Object bean) {
    injectFieldValues(bean);
    Object current = bean;
    for (BeanPostProcessor beanPostProcessor : beanPostProcessors) {
        current = beanPostProcessor.postProcessBeforeInitialization(beanName, current);
    }
    invokeLifecycleMethods(current, PostConstruct.class);
    for (BeanPostProcessor beanPostProcessor : beanPostProcessors) {
        current = beanPostProcessor.postProcessAfterInitialization(beanName, current);
    }
    registerDestroyCallback(beanName, bean, current);
    return current;
}
```

종료 훅은 `@PreDestroy`와 `AutoCloseable`을 함께 지원한다.

#### 메서드 구조 해설

- `initializeBean(...)`
  - 책임: 생성 직후 객체를 완성된 빈으로 바꾼다.
  - 단계:
    - 필드 값 주입
    - before 후처리기
    - `@PostConstruct`
    - after 후처리기
    - destroy callback 등록
  - 설계 이유: 생성 완료와 사용 가능 상태가 다르기 때문이다.

### Chapter 10. `BeanPostProcessor`

이 장에서는 먼저 아주 작은 후처리기를 테스트로 만든다.

```java
@Test
void replacesBeanAfterInitialization() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ProxyDestroyConfig.class);

    ProxiedService service = context.getBean(ProxiedService.class);

    assertThat(service.message()).isEqualTo("proxied");
}
```

인터페이스는 최대한 작아야 한다.

```java
public interface BeanPostProcessor {
    default Object postProcessBeforeInitialization(String beanName, Object bean) {
        return bean;
    }

    default Object postProcessAfterInitialization(String beanName, Object bean) {
        return bean;
    }
}
```

#### 클래스 구조 해설

- `BeanPostProcessor`
  - 책임: 컨테이너가 만든 객체를 추가 가공한다.
  - 두 훅:
    - `postProcessBeforeInitialization(...)`
    - `postProcessAfterInitialization(...)`
  - 설계 이유: 값 보강과 프록시 치환의 개입 시점이 다르기 때문이다.

중요한 것은 컨테이너가 후처리기 자신도 빈으로 관리한다는 점이다. 그래서 `refresh()`에서 후처리기 빈을 먼저 수집하는 단계가 따로 필요하다.

### Chapter 11. 순환 참조와 실패 전략

이 장의 테스트는 실패를 명시적으로 보이게 해야 한다.

```java
@Test
void failsFastOnCircularConstructorDependency() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
    context.register(CircularConfig.class);

    assertThatThrownBy(context::refresh)
        .isInstanceOf(BeansException.class)
        .hasMessageContaining("Circular dependency");
}
```

구현은 간단하다.

```java
if (!beansInCreation.add(beanName)) {
    throw new BeansException("Circular dependency detected while creating " + beanName);
}
```

이 실패가 중요한 이유는 다음 장부터 프록시와 후처리기가 더해지기 때문이다. 지금 순환 참조를 느슨하게 허용하면, 이후 구조 설명이 오히려 흐려진다.

---

## Part 4. 프록시, AOP, 트랜잭션

### Chapter 12. `ProxyFactory`

테스트는 인터페이스 프록시와 클래스 프록시를 모두 덮어야 한다.

```java
@Test
void wrapsInterfaceBasedTargetWithJdkProxy() {
    GreetingService target = new GreetingService();
    Object proxy = ProxyFactory.createProxy(target, List.of(invocation -> "[" + invocation.proceed() + "]"));

    assertThat(((GreetingContract) proxy).greet()).isEqualTo("[hello]");
}
```

핵심 구현은 다음 구조를 거의 그대로 설명해야 한다.

```java
public static Object createProxy(Object target, List<MethodInterceptor> interceptors) {
    ProxyDescriptor descriptor = unwrapProxy(target);
    Object proxyTarget = descriptor.target();
    List<MethodInterceptor> mergedInterceptors = mergeInterceptors(descriptor.interceptors(), interceptors);
    Class<?>[] interfaces = proxyTarget.getClass().getInterfaces();
    if (interfaces.length == 0) {
        return createClassProxy(proxyTarget, mergedInterceptors);
    }
    SpringLiteInvocationHandler invocationHandler = new SpringLiteInvocationHandler(proxyTarget, mergedInterceptors);
    return Proxy.newProxyInstance(proxyTarget.getClass().getClassLoader(), interfaces, invocationHandler);
}
```

그리고 인터셉터 체인의 `proceed()`를 반드시 같이 실어야 한다.

```java
private static final class SimpleMethodInvocation implements MethodInvocation {
    private final Object target;
    private final Method method;
    private final Object[] arguments;
    private final List<MethodInterceptor> interceptors;
    private int index;

    @Override
    public Object proceed() throws Throwable {
        if (index < interceptors.size()) {
            return interceptors.get(index++).invoke(this);
        }
        try {
            method.setAccessible(true);
            return method.invoke(target, arguments);
        } catch (InvocationTargetException exception) {
            throw exception.getTargetException();
        }
    }
}
```

### Chapter 13. 최소 AOP 인프라

이 장에서는 먼저 수동 인터셉터 체인을 보여주는 것이 좋다.

```java
MethodInterceptor logging = invocation -> {
    events.add("before");
    Object result = invocation.proceed();
    events.add("after");
    return result;
};
```

그 다음 `@Order` 정렬이 왜 필요한지 보여준다.

```java
private static List<MethodInterceptor> mergeInterceptors(List<MethodInterceptor> existing, List<MethodInterceptor> additional) {
    List<MethodInterceptor> merged = new ArrayList<>(existing.size() + additional.size());
    merged.addAll(existing);
    merged.addAll(additional);
    merged.sort(OrderUtils.comparator());
    return merged;
}
```

### Chapter 14. `@Aspect`

이 장의 핵심 테스트는 advice 적용 순서다.

```java
@Test
void appliesBeforeAroundAndAfterReturningAdvice() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(AspectTestConfig.class);
    GreetingService service = context.getBean(GreetingService.class);

    assertThat(service.greet("spring")).isEqualTo("HELLO SPRING");
}
```

후처리기의 핵심은 aspect 빈을 읽어 advice descriptor로 바꾸는 것이다.

```java
public class AspectBeanPostProcessor implements BeanPostProcessor {
    @Override
    public Object postProcessAfterInitialization(String beanName, Object bean) {
        List<MethodInterceptor> interceptors = resolveInterceptors(bean);
        if (interceptors.isEmpty()) {
            return bean;
        }
        return ProxyFactory.createProxy(bean, interceptors);
    }
}
```

본문에서는 `AdviceDescriptor`, `AdviceType`, `OrderedAdviceInterceptor`를 별도 소절로 나눠 설명하는 편이 좋다.

### Chapter 15. `@Transactional`

이 장은 build-along 책에서 반드시 코드 비중이 높아야 한다. 테스트를 먼저 제시한다.

```java
@Test
void wrapsTransactionalBeanWithProxy() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(SampleConfig.class);

    SampleService sampleService = context.getBean(SampleService.class);

    assertThat(Proxy.isProxyClass(sampleService.getClass()) || sampleService.getClass().getName().contains("ByteBuddy")).isTrue();
}
```

후처리기 코드는 거의 통째로 실어야 한다.

```java
public class TransactionalBeanPostProcessor implements BeanPostProcessor {
    private final TransactionManager transactionManager;

    public TransactionalBeanPostProcessor(TransactionManager transactionManager) {
        this.transactionManager = transactionManager;
    }

    @Override
    public Object postProcessAfterInitialization(String beanName, Object bean) {
        if (!requiresTransactionProxy(bean)) {
            return bean;
        }
        return ProxyFactory.createProxy(bean, List.of(transactionInterceptor(bean)));
    }
}
```

그리고 내부 인터셉터의 핵심 로직을 보여준다.

```java
private final class TransactionInterceptor implements MethodInterceptor, Ordered {
    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        Method targetMethod = targetClass.getMethod(invocation.getMethod().getName(), invocation.getMethod().getParameterTypes());
        Transactional transactional = resolveTransactionalMetadata(targetClass, targetMethod);
        if (transactional == null) {
            return invocation.proceed();
        }
        transactionManager.begin();
        try {
            Object result = invocation.proceed();
            transactionManager.commit();
            return result;
        } catch (Throwable throwable) {
            if (shouldRollback(throwable, transactional)) {
                transactionManager.rollback();
            } else {
                transactionManager.commit();
            }
            throw throwable;
        }
    }
}
```

### Chapter 16. `TransactionManager`

트랜잭션 장은 `TransactionManager` 자체도 별도 구현 절차로 다뤄야 한다.

```java
public class TransactionManager {
    private final DataSource dataSource;
    private final ThreadLocal<TransactionContext> transactionContext = new ThreadLocal<>();

    public void begin() {
        TransactionContext context = transactionContext.get();
        if (context != null) {
            context.incrementDepth();
            return;
        }
        if (dataSource == null) {
            transactionContext.set(new TransactionContext(null));
            return;
        }
        try {
            Connection connection = dataSource.getConnection();
            connection.setAutoCommit(false);
            transactionContext.set(new TransactionContext(connection));
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to begin transaction", exception);
        }
    }
}
```

`commit()`과 `rollback()`은 depth와 rollback-only를 함께 다룬다.

```java
public void rollback() {
    TransactionContext context = transactionContext.get();
    if (context == null) {
        return;
    }
    context.markRollbackOnly();
    if (!context.decrementAndIsComplete()) {
        return;
    }
    if (context.connection() == null) {
        transactionContext.remove();
        return;
    }
    rollbackConnection(context.connection());
}
```

이 두 장을 함께 읽으면 선언형 트랜잭션이 "후처리기 + 프록시 + 스레드 로컬 문맥"의 합이라는 점이 명확해진다.

#### `TransactionManager` 메서드 해설

- `begin()`
  - 이미 트랜잭션이 있으면 depth만 증가시킨다.
  - 없으면 새 커넥션을 열고 auto-commit을 끈다.
  - 데이터소스가 없는 테스트 상황도 허용한다.
- `commit()`
  - 중첩 depth가 남아 있으면 실제 커밋하지 않는다.
  - rollback-only가 표시되었으면 커밋 대신 롤백으로 전환한다.
  - 마지막 단계에서 커넥션 정리와 `ThreadLocal` 제거를 수행한다.
- `rollback()`
  - 단순 즉시 롤백이 아니라 먼저 rollback-only를 표시한다.
  - 중첩 호출이라면 최외곽에서 실제 롤백이 일어난다.

이 설명을 반드시 넣어야 하는 이유는, 많은 독자가 트랜잭션을 "begin/commit/rollback 세 메서드"로만 보다가 중첩 호출과 rollback-only 전파에서 길을 잃기 때문이다. build-along 책은 여기서 상태 전이 모델을 명확히 보여줘야 한다.

---

## Part 5. Web MVC

### Chapter 17. `DispatcherServlet`

웹 장도 먼저 테스트부터 시작한다.

```java
@Test
void dispatchesRequestToControllerMethod() throws Exception {
    DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
    StubHttpExchange exchange = StubHttpExchange.get("/greetings/world");

    dispatcherServlet.handle(exchange);

    assertThat(exchange.responseBody()).contains("world");
}
```

이 장에서 꼭 실어야 할 코드는 `DispatcherServlet` 생성자와 `handle()` 전체다.

```java
public class DispatcherServlet implements HttpHandler {
    private final HandlerMapping handlerMapping;
    private final HandlerAdapter handlerAdapter;
    private final ReturnValueHandler returnValueHandler;
    private final ExceptionResolver exceptionResolver;

    public DispatcherServlet(ApplicationContext applicationContext, JsonMapper jsonMapper) {
        TypeConverter typeConverter = new TypeConverter();
        Validator validator = new SimpleValidator();
        this.handlerMapping = new RequestMappingHandlerMapping(applicationContext);
        this.handlerAdapter = new RequestMappingHandlerAdapter(
            List.of(
                new PathVariableArgumentResolver(typeConverter),
                new RequestParamArgumentResolver(typeConverter),
                new RequestBodyArgumentResolver(jsonMapper, typeConverter),
                new HttpExchangeArgumentResolver()
            ),
            validator
        );
        this.returnValueHandler = new JsonReturnValueHandler(jsonMapper);
        this.exceptionResolver = new DefaultExceptionResolver(applicationContext);
    }
}
```

```java
@Override
public void handle(HttpExchange exchange) throws IOException {
    HandlerMethodMatch handlerMethodMatch = null;
    try {
        handlerMethodMatch = handlerMapping.getHandler(exchange);
        if (handlerMethodMatch == null) {
            returnValueHandler.handleReturnValue(Map.of("error", "Not Found"), exchange, 404);
            return;
        }
        Object result = handlerAdapter.handle(handlerMethodMatch, exchange);
        returnValueHandler.handleReturnValue(result, exchange, 200);
    } catch (Exception exception) {
        ExceptionHandlingResult resolved = exceptionResolver.resolve(exception, handlerMethodMatch);
        returnValueHandler.handleReturnValue(resolved.body(), exchange, resolved.statusCode());
    } finally {
        exchange.close();
    }
}
```

#### `DispatcherServlet.handle(...)` 줄 단위 읽기

이 메서드는 웹 파이프라인 전체를 가장 압축적으로 보여준다.

1. `handlerMapping.getHandler(exchange)`
   - 요청을 어떤 컨트롤러 메서드에 보낼지 결정한다.
2. 핸들러가 없으면 404 JSON을 직접 쓴다.
3. `handlerAdapter.handle(...)`
   - 인자 해석, 검증, 실제 메서드 호출을 수행한다.
4. `returnValueHandler.handleReturnValue(...)`
   - 메서드 반환값을 HTTP 응답으로 변환한다.
5. 예외가 나면 `exceptionResolver.resolve(...)`
   - 예외를 상태 코드와 응답 바디로 바꾼다.
6. 마지막에 `exchange.close()`
   - 정상/실패와 무관하게 자원을 정리한다.

웹 프레임워크를 처음 구현하는 독자에게는 이 "직선형 흐름"이 매우 중요하다. 실제 Spring MVC의 많은 전략 객체도 결국 이 여섯 단계 중 하나에 속한다.

### Chapter 18. `HandlerMethodArgumentResolver`

이 장에서는 네 가지 resolver를 차례로 구현한다.

```java
public interface HandlerMethodArgumentResolver {
    boolean supportsParameter(Parameter parameter);
    Object resolveArgument(Parameter parameter, HandlerMethodMatch handlerMethodMatch, HttpExchange exchange);
}
```

예를 들어 `RequestParam`은 아래처럼 구현한다.

```java
public class RequestParamArgumentResolver implements HandlerMethodArgumentResolver {
    private final TypeConverter typeConverter;

    @Override
    public Object resolveArgument(Parameter parameter, HandlerMethodMatch handlerMethodMatch, HttpExchange exchange) {
        String name = parameter.getAnnotation(RequestParam.class).value();
        String value = parseQuery(exchange.getRequestURI().getRawQuery()).get(name);
        return typeConverter.convert(value, parameter.getType());
    }
}
```

그리고 `RequestBody`는 JSON 역직렬화와 검증 전단계를 맡는다.

```java
public class RequestBodyArgumentResolver implements HandlerMethodArgumentResolver {
    private final JsonMapper jsonMapper;
    private final TypeConverter typeConverter;

    @Override
    public Object resolveArgument(Parameter parameter, HandlerMethodMatch handlerMethodMatch, HttpExchange exchange) {
        return jsonMapper.read(exchange.getRequestBody(), parameter.getType(), typeConverter);
    }
}
```

### Chapter 19. JSON과 예외 처리

`JsonMapper`는 record와 POJO를 직렬화할 수 있어야 한다. 책에서는 완전한 구현을 거의 다 보여주는 편이 낫다.

```java
public class JsonMapper {
    public String write(Object value) {
        if (value == null) {
            return "null";
        }
        if (value instanceof String string) {
            return "\"" + escape(string) + "\"";
        }
        if (value instanceof Number || value instanceof Boolean) {
            return value.toString();
        }
        if (value.getClass().isRecord()) {
            return writeRecord(value);
        }
        if (value instanceof Map<?, ?> map) {
            return writeMap(map);
        }
        if (value instanceof Iterable<?> iterable) {
            return writeIterable(iterable);
        }
        return writePojo(value);
    }
}
```

예외 해석기는 로컬 핸들러와 전역 advice를 순서대로 찾아야 한다.

```java
public class DefaultExceptionResolver implements ExceptionResolver {
    @Override
    public ExceptionHandlingResult resolve(Exception exception, HandlerMethodMatch handlerMethodMatch) {
        if (handlerMethodMatch != null) {
            Method handler = findExceptionHandlerMethod(handlerMethodMatch.handlerMethod().bean().getClass(), exception);
            if (handler != null) {
                return invokeHandler(handlerMethodMatch.handlerMethod().bean(), handler, exception);
            }
        }
        for (Object adviceBean : applicationContext.getBeansWithAnnotation(ControllerAdvice.class).values()) {
            Method handler = findExceptionHandlerMethod(adviceBean.getClass(), exception);
            if (handler != null) {
                return invokeHandler(adviceBean, handler, exception);
            }
        }
        if (exception instanceof ValidationException validationException) {
            return new ExceptionHandlingResult(400, Map.of(
                "error", "Validation failed",
                "violations", toViolationPayload(validationException.violations())
            ));
        }
        return new ExceptionHandlingResult(500, Map.of("error", exception.getMessage()));
    }
}
```

### Chapter 20. 조건 매핑과 검증

이 장에서는 `RequestMappingHandlerMapping`의 조건 평가가 핵심이다.

```java
private boolean matchesConditions(HandlerMethod handler, HttpExchange exchange) {
    return matchesConsumes(handler.consumes(), exchange)
        && matchesProduces(handler.produces(), exchange)
        && matchesHeaders(handler.headers(), exchange)
        && matchesParams(handler.params(), exchange);
}
```

검증은 `RequestMappingHandlerAdapter`에서 메서드 호출 직전에 수행한다.

```java
Object argument = resolver.resolveArgument(parameter, handlerMethodMatch, exchange);
validateIfNecessary(parameter, argument);
arguments[index] = argument;
```

---

## Part 6. JDBC, Boot, Test, Example App

### Chapter 21. `JdbcTemplate`

테스트는 먼저 SQL 성공 경로와 트랜잭션 참여 경로를 잠근다.

```java
@Test
void reusesCurrentTransactionConnection() {
    TestTransactionManager transactionManager = new TestTransactionManager(dataSource);
    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource, transactionManager);

    transactionManager.begin();
    jdbcTemplate.update("insert into accounts(name) values (?)", "spring");
    transactionManager.rollback();

    assertThat(transactionManager.wasRollbackCalled()).isTrue();
}
```

핵심 `update()`는 그대로 싣는 편이 좋다.

```java
public int update(String sql, Object... args) {
    try (
        Connection connection = obtainConnectionIfNeeded();
        PreparedStatement statement = connection.prepareStatement(sql)
    ) {
        bind(statement, args);
        int updated = statement.executeUpdate();
        if (transactionManager.currentConnection() != null) {
            statement.close();
        }
        return updated;
    } catch (SQLException exception) {
        throw new IllegalStateException("Failed to execute update: " + sql, exception);
    }
}
```

### Chapter 22. 예제 앱

이 장은 "사용 예"가 아니라 "전체 통합 증거"로 써야 한다. 컨트롤러, 서비스, 저장소를 모두 싣는다.

```java
@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<Order> listOrders() {
        return orderService.listOrders();
    }

    @PostMapping
    public Order createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request.product(), request.quantity());
    }
}
```

```java
@Service
public class DefaultOrderService implements OrderService {
    private final OrderRepository orderRepository;
    private final String defaultStatus;

    public DefaultOrderService(OrderRepository orderRepository, @Value("${orders.default-status:CREATED}") String defaultStatus) {
        this.orderRepository = orderRepository;
        this.defaultStatus = defaultStatus;
    }

    @Override
    @Transactional
    public Order createOrder(String product, int quantity) {
        return orderRepository.save(product, quantity, defaultStatus);
    }
}
```

### Chapter 23. `SpringLiteApplication`

이 장의 구현은 짧지만 매우 중요하다.

```java
public final class SpringLiteApplication {
    public static AnnotationConfigApplicationContext run(Class<?> applicationClass, String... args) {
        AnnotationConfigApplicationContext context = PropertyResolver.withOverrides(parseCommandLineArgs(args), () -> {
            AnnotationConfigApplicationContext createdContext = new AnnotationConfigApplicationContext();
            createdContext.register(applicationClass);
            createdContext.registerSingleton(
                "commandLineApplicationProperties",
                ApplicationProperties.from(PropertyResolver.loadApplicationProperties())
            );
            BootInfrastructureRegistrar.registerDefaults(createdContext);
            createdContext.refresh();
            return createdContext;
        });
        context.getBean(WebServer.class).start();
        return context;
    }
}
```

그리고 기본 자동 설정 등록도 같이 보여준다.

```java
public final class BootInfrastructureRegistrar {
    public static void registerDefaults(AnnotationConfigApplicationContext context) {
        context.register(
            JsonAutoConfiguration.class,
            AopAutoConfiguration.class,
            TransactionAutoConfiguration.class,
            JdbcAutoConfiguration.class,
            WebAutoConfiguration.class
        );
    }
}
```

### Chapter 24. `SpringLiteTestExtension`

책에서 테스트 지원까지 구현해야 build-along 책이 완성된다. 핵심은 테스트 컨텍스트 생성과 트랜잭션 롤백이다.

```java
public class SpringLiteTestExtension implements BeforeAllCallback, BeforeEachCallback, AfterEachCallback, TestInstancePostProcessor, ParameterResolver {
    @Override
    public void beforeEach(ExtensionContext extensionContext) {
        if (!isTransactionalTest(extensionContext)) {
            extensionContext.getStore(NAMESPACE).put(TRANSACTION_ACTIVE_KEY, false);
            return;
        }
        AnnotationConfigApplicationContext context = getOrCreateContext(extensionContext);
        if (!context.containsBeanOfType(TransactionManager.class)) {
            throw new IllegalStateException("@Transactional test requires a TransactionManager bean");
        }
        context.getBean(TransactionManager.class).begin();
        extensionContext.getStore(NAMESPACE).put(TRANSACTION_ACTIVE_KEY, true);
    }

    @Override
    public void afterEach(ExtensionContext extensionContext) {
        Boolean transactionActive = extensionContext.getStore(NAMESPACE).remove(TRANSACTION_ACTIVE_KEY, Boolean.class);
        if (!Boolean.TRUE.equals(transactionActive)) {
            return;
        }
        AnnotationConfigApplicationContext context = getOrCreateContext(extensionContext);
        context.getBean(TransactionManager.class).rollback();
    }
}
```

이제 독자는 컨테이너부터 테스트 도구까지 하나의 미니 생태계를 직접 구축하게 된다.

#### `SpringLiteTestExtension` 생명주기 워크스루

이 클래스는 테스트 지원도 하나의 런타임이라는 사실을 보여준다.

- `beforeAll(...)`
  - 테스트 클래스 단위 컨텍스트를 한 번 준비한다.
- `postProcessTestInstance(...)`
  - `@Autowired` 필드 주입을 수행한다.
- `beforeEach(...)`
  - 테스트가 `@Transactional`이면 트랜잭션을 시작한다.
- `resolveParameter(...)`
  - `ApplicationContext`, `MockMvc`, 일반 빈을 파라미터로 주입한다.
- `afterEach(...)`
  - 테스트 트랜잭션이 활성 상태였다면 롤백한다.

여기서 특히 독자가 놓치기 쉬운 부분은 "테스트 메서드 파라미터 주입"과 "필드 주입"이 서로 다른 진입점이라는 사실이다. 실제 Spring Test도 여러 콜백과 resolver가 결합된 구조이며, `spring-lite`는 그 최소 구조를 잘 보여준다.

#### 독자가 직접 따라 쳐 볼 클래스 우선순위

build-along 관점에서 아래 클래스들은 거의 전체를 직접 타이핑해 보는 편이 좋다.

1. `AnnotationConfigApplicationContext`
2. `TransactionalBeanPostProcessor`
3. `TransactionManager`
4. `DispatcherServlet`
5. `RequestMappingHandlerAdapter`
6. `SpringLiteApplication`
7. `SpringLiteTestExtension`

이 우선순위는 단순 구현 난이도가 아니라 학습 수익을 기준으로 정한 것이다. 이 클래스들을 직접 구현해 보면 컨테이너, 프록시, 웹, 부트스트랩, 테스트 지원이 한 개의 런타임으로 연결되는 감각이 빠르게 생긴다.

---

## 장별 집필 원칙

이 문서를 실제 출간용 본문으로 흡수할 때는 아래 원칙을 유지하는 편이 좋다.

1. 한 장에 테스트, 구현, 리팩터링이 모두 있어야 한다.
2. 독자가 붙여 넣을 수 있을 정도로 코드 블록이 충분해야 한다.
3. 코드 일부만 보여주더라도 클래스의 핵심 메서드는 거의 빠짐없이 보여줘야 한다.
4. "왜 이 코드가 필요한가"는 코드 바로 앞이나 바로 뒤에 짧게 설명한다.
5. 긴 장은 `1차 구현`, `확장`, `최종 정리`로 쪼갠다.

## 다음 편집 작업

이 문서는 build-along 축을 세운 첫 버전이다. 이후 출간용 편집에서는 아래 순서로 더 다듬을 수 있다.

1. 각 장에 실제 테스트 클래스 전체를 더 많이 포함한다.
2. 현재 생략된 유틸리티 클래스 `AnnotationUtils`, `BeanNameGenerator`, `TypeConverter`, `MockMvc`를 장별로 추가한다.
3. 본문 `complete-manuscript.md`의 해당 장들과 이 문서를 통합해 "설명 + 구현" 복합 원고로 재배치한다.
