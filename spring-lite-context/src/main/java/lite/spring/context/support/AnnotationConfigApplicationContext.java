package lite.spring.context.support;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Proxy;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lite.spring.context.ApplicationContext;
import lite.spring.context.ApplicationContextAware;
import lite.spring.context.BeanNameAware;
import lite.spring.context.BeanRuntimeDescriptor;
import lite.spring.context.bean.BeanDefinition;
import lite.spring.context.bean.BeanDefinition.Kind;
import lite.spring.context.event.ApplicationListener;
import lite.spring.context.event.ContextClosedEvent;
import lite.spring.context.event.ContextRefreshedEvent;
import lite.spring.context.factory.BeanPostProcessor;
import lite.spring.context.factory.ConfigurableApplicationContext;
import lite.spring.context.scan.ClassPathScanner;
import lite.spring.core.annotation.Autowired;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Component;
import lite.spring.core.annotation.ComponentScan;
import lite.spring.core.annotation.ConditionalOnBean;
import lite.spring.core.annotation.ConditionalOnClass;
import lite.spring.core.annotation.ConditionalOnMissingBean;
import lite.spring.core.annotation.ConditionalOnProperty;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.annotation.PostConstruct;
import lite.spring.core.annotation.PreDestroy;
import lite.spring.core.annotation.Qualifier;
import lite.spring.core.annotation.Scope;
import lite.spring.core.annotation.Value;
import lite.spring.core.convert.ConversionService;
import lite.spring.core.convert.DefaultConversionService;
import lite.spring.core.exception.BeansException;
import lite.spring.core.exception.NoSuchBeanException;
import lite.spring.core.exception.NoUniqueBeanException;
import lite.spring.core.reflect.ReflectionUtils;
import lite.spring.core.util.OrderUtils;
import lite.spring.core.util.PropertyResolver;

public class AnnotationConfigApplicationContext implements ConfigurableApplicationContext {
    private final Map<String, BeanDefinition> beanDefinitions = new LinkedHashMap<>();
    private final Map<String, Object> singletons = new LinkedHashMap<>();
    private final Map<String, Runnable> destroyCallbacks = new LinkedHashMap<>();
    private final Map<String, ConditionMetadata> conditionMetadata = new LinkedHashMap<>();
    private final List<BeanPostProcessor> beanPostProcessors = new ArrayList<>();
    private final Set<String> beansInCreation = new LinkedHashSet<>();
    private final ClassPathScanner classPathScanner = new ClassPathScanner();
    private final PropertyResolver propertyResolver = PropertyResolver.loadApplicationProperties();
    private final ConversionService conversionService = new DefaultConversionService();
    private boolean refreshed;
    private boolean closed;

    public AnnotationConfigApplicationContext() {
    }

    public AnnotationConfigApplicationContext(Class<?>... configurationClasses) {
        this();
        register(configurationClasses);
        refresh();
    }

    public AnnotationConfigApplicationContext(String... basePackages) {
        this();
        scan(basePackages);
        refresh();
    }

    public void register(Class<?>... configurationClasses) {
        for (Class<?> configurationClass : configurationClasses) {
            registerDiscoveredClass(configurationClass);
            ComponentScan componentScan = AnnotationUtils.findAnnotation(configurationClass, ComponentScan.class);
            if (componentScan != null) {
                String[] basePackages = componentScan.basePackages().length == 0
                    ? new String[]{configurationClass.getPackageName()}
                    : componentScan.basePackages();
                scan(basePackages);
            }
        }
    }

    public void scan(String... basePackages) {
        for (String basePackage : basePackages) {
            for (Class<?> candidate : classPathScanner.scan(basePackage)) {
                registerDiscoveredClass(candidate);
            }
        }
    }

    public boolean containsBeanDefinition(String beanName) {
        return beanDefinitions.containsKey(beanName) && isBeanEligible(beanName);
    }

    public boolean containsBeanOfType(Class<?> beanType) {
        return beanDefinitions.entrySet().stream()
            .filter(entry -> isBeanEligible(entry.getKey()))
            .anyMatch(entry -> beanType.isAssignableFrom(entry.getValue().beanType()))
            || singletons.values().stream().anyMatch(bean -> beanType.isAssignableFrom(bean.getClass()));
    }

    @Override
    public void registerBeanDefinition(BeanDefinition beanDefinition) {
        beanDefinitions.put(beanDefinition.name(), beanDefinition);
    }

    @Override
    public void registerSingleton(String beanName, Object singleton) {
        singletons.put(beanName, singleton);
    }

    @Override
    public void addBeanPostProcessor(BeanPostProcessor beanPostProcessor) {
        beanPostProcessors.add(beanPostProcessor);
        sortBeanPostProcessors();
    }

    @Override
    public void refresh() {
        if (refreshed) {
            return;
        }
        refreshed = true;
        instantiateBeanPostProcessors();
        instantiateConfigurationBeans();
        instantiateBeanPostProcessors();
        instantiateRemainingSingletons();
        publishEvent(new ContextRefreshedEvent(this));
    }

    @Override
    public <T> T getBean(Class<T> type) {
        Map<String, T> beans = getBeansOfType(type);
        if (beans.isEmpty()) {
            throw new NoSuchBeanException("No bean of type " + type.getName());
        }
        if (beans.size() > 1) {
            throw new NoUniqueBeanException("Multiple beans of type " + type.getName() + ": " + beans.keySet());
        }
        return beans.values().iterator().next();
    }

    @Override
    public Object getBean(String name) {
        if (singletons.containsKey(name)) {
            return singletons.get(name);
        }
        BeanDefinition beanDefinition = beanDefinitions.get(name);
        if (beanDefinition == null || !isBeanEligible(name)) {
            throw new NoSuchBeanException("No bean named " + name);
        }
        return createBean(name, beanDefinition);
    }

    @Override
    public <T> Map<String, T> getBeansOfType(Class<T> type) {
        Map<String, T> result = new LinkedHashMap<>();
        for (String beanName : beanDefinitions.keySet()) {
            BeanDefinition beanDefinition = beanDefinitions.get(beanName);
            if (isBeanEligible(beanName) && type.isAssignableFrom(beanDefinition.beanType())) {
                result.put(beanName, type.cast(getBean(beanName)));
            }
        }
        for (Map.Entry<String, Object> entry : singletons.entrySet()) {
            if (type.isAssignableFrom(entry.getValue().getClass())) {
                result.putIfAbsent(entry.getKey(), type.cast(entry.getValue()));
            }
        }
        return result;
    }

    @Override
    public Map<String, Object> getBeansWithAnnotation(Class<? extends java.lang.annotation.Annotation> annotationType) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (Map.Entry<String, BeanDefinition> entry : beanDefinitions.entrySet()) {
            if (!isBeanEligible(entry.getKey()) || !entry.getValue().beanType().isAnnotationPresent(annotationType)) {
                continue;
            }
            result.put(entry.getKey(), getBean(entry.getKey()));
        }
        for (Map.Entry<String, Object> entry : singletons.entrySet()) {
            if (entry.getValue().getClass().isAnnotationPresent(annotationType)) {
                result.putIfAbsent(entry.getKey(), entry.getValue());
            }
        }
        return result;
    }

    @Override
    public List<BeanRuntimeDescriptor> getBeanRuntimeDescriptors() {
        return beanDefinitions.values().stream()
            .filter(definition -> isBeanEligible(definition.name()))
            .map(definition -> {
                Object instance = singletons.get(definition.name());
                return new BeanRuntimeDescriptor(
                    definition.name(),
                    definition.beanType().getName(),
                    definition.kind().name(),
                    definition.singleton(),
                    instance != null,
                    instance != null && isProxy(instance)
                );
            })
            .toList();
    }

    @Override
    public void publishEvent(Object event) {
        getBeansOfType(ApplicationListener.class).values().forEach(listener -> notifyListener(listener, event));
    }

    private boolean isProxy(Object instance) {
        return Proxy.isProxyClass(instance.getClass()) || instance.getClass().getName().contains("$ByteBuddy$");
    }

    @Override
    public void close() {
        if (closed) {
            return;
        }
        closed = true;
        publishEvent(new ContextClosedEvent(this));
        List<Runnable> callbacks = new ArrayList<>(destroyCallbacks.values());
        for (int index = callbacks.size() - 1; index >= 0; index--) {
            callbacks.get(index).run();
        }
    }

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
        registerConditionMetadata(beanDefinition.name(), candidate, candidate);
        if (kind == Kind.CONFIGURATION) {
            registerBeanMethods(candidate);
        }
    }

    private boolean isManagedType(Class<?> candidate) {
        return AnnotationUtils.hasAnnotation(candidate, Component.class)
            || AnnotationUtils.hasAnnotation(candidate, Configuration.class);
    }

    private void instantiateBeanPostProcessors() {
        List<String> postProcessorBeanNames = beanDefinitions.values().stream()
            .filter(definition -> BeanPostProcessor.class.isAssignableFrom(definition.beanType()))
            .map(BeanDefinition::name)
            .filter(this::isBeanEligible)
            .toList();
        for (String beanName : postProcessorBeanNames) {
            BeanPostProcessor beanPostProcessor = (BeanPostProcessor) getBean(beanName);
            if (!beanPostProcessors.contains(beanPostProcessor)) {
                beanPostProcessors.add(beanPostProcessor);
                sortBeanPostProcessors();
            }
        }
    }

    private void instantiateConfigurationBeans() {
        beanDefinitions.values().stream()
            .filter(definition -> definition.kind() == Kind.CONFIGURATION)
            .map(BeanDefinition::name)
            .filter(this::isBeanEligible)
            .collect(Collectors.toList())
            .forEach(this::getBean);
    }

    private void instantiateRemainingSingletons() {
        beanDefinitions.values().stream()
            .filter(BeanDefinition::singleton)
            .map(BeanDefinition::name)
            .filter(this::isBeanEligible)
            .collect(Collectors.toList())
            .forEach(this::getBean);
    }

    private Object createBean(String beanName, BeanDefinition beanDefinition) {
        if (singletons.containsKey(beanName)) {
            return singletons.get(beanName);
        }
        if (!beansInCreation.add(beanName)) {
            throw new BeansException("Circular dependency detected while creating " + beanName);
        }
        try {
            Object instance = switch (beanDefinition.kind()) {
                case COMPONENT, CONFIGURATION, INFRASTRUCTURE -> instantiateClass(beanDefinition.beanType());
                case FACTORY_METHOD -> invokeFactoryMethod(beanDefinition);
            };

            Object initialized = initializeBean(beanName, instance);
            if (beanDefinition.singleton()) {
                singletons.put(beanName, initialized);
            }
            if (initialized instanceof BeanPostProcessor beanPostProcessor && !beanPostProcessors.contains(beanPostProcessor)) {
                beanPostProcessors.add(beanPostProcessor);
                sortBeanPostProcessors();
            }
            return initialized;
        } finally {
            beansInCreation.remove(beanName);
        }
    }

    private Object instantiateClass(Class<?> beanType) {
        Constructor<?> constructor = selectConstructor(beanType);
        Object[] arguments = resolveExecutableArguments(constructor.getParameters());
        return ReflectionUtils.instantiate((Constructor<Object>) constructor, arguments);
    }

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

    private Object[] resolveExecutableArguments(Parameter[] parameters) {
        Object[] arguments = new Object[parameters.length];
        for (int index = 0; index < parameters.length; index++) {
            arguments[index] = resolveArgument(parameters[index]);
        }
        return arguments;
    }

    private Object resolveArgument(Parameter parameter) {
        Value value = parameter.getAnnotation(Value.class);
        if (value != null) {
            return convertValue(propertyResolver.resolveRequiredPlaceholder(value.value()), parameter.getType());
        }
        return resolveDependency(parameter);
    }

    private Object resolveDependency(Parameter parameter) {
        Class<?> dependencyType = parameter.getType();
        if (dependencyType.equals(ApplicationContext.class) || dependencyType.equals(ConfigurableApplicationContext.class)) {
            return this;
        }
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

    private Object invokeFactoryMethod(BeanDefinition beanDefinition) {
        Object configurationBean = getBean(BeanNameGenerator.generateBeanName(beanDefinition.configurationClass()));
        Method factoryMethod = beanDefinition.factoryMethod();
        Object[] arguments = resolveExecutableArguments(factoryMethod.getParameters());
        return ReflectionUtils.invoke(factoryMethod, configurationBean, arguments);
    }

    private void registerBeanMethods(Class<?> configurationClass) {
        for (Method method : configurationClass.getDeclaredMethods()) {
            Bean bean = method.getAnnotation(Bean.class);
            if (bean == null) {
                continue;
            }
            String beanName = bean.value().isBlank() ? BeanNameGenerator.generateBeanName(method.getName()) : bean.value();
            if (beanDefinitions.containsKey(beanName)) {
                continue;
            }
            BeanDefinition beanDefinition = BeanDefinition.factoryMethod(
                beanName,
                method.getReturnType(),
                configurationClass,
                method,
                isSingleton(method),
                extractQualifier(method)
            );
            registerBeanDefinition(beanDefinition);
            registerConditionMetadata(beanName, method, method.getReturnType());
        }
    }

    private boolean matchesConditions(AnnotatedElement element, Class<?> defaultBeanType) {
        ConditionalOnMissingBean conditionalOnMissingBean = element.getAnnotation(ConditionalOnMissingBean.class);
        if (conditionalOnMissingBean != null && !matchesMissingBeanCondition(conditionalOnMissingBean, defaultBeanType)) {
            return false;
        }

        ConditionalOnBean conditionalOnBean = element.getAnnotation(ConditionalOnBean.class);
        if (conditionalOnBean != null && !matchesOnBeanCondition(conditionalOnBean)) {
            return false;
        }

        ConditionalOnClass conditionalOnClass = element.getAnnotation(ConditionalOnClass.class);
        if (conditionalOnClass != null && !matchesOnClassCondition(conditionalOnClass)) {
            return false;
        }

        ConditionalOnProperty conditionalOnProperty = element.getAnnotation(ConditionalOnProperty.class);
        return conditionalOnProperty == null || matchesOnPropertyCondition(conditionalOnProperty);
    }

    private boolean matchesMissingBeanCondition(ConditionalOnMissingBean condition, Class<?> defaultBeanType) {
        Class<?>[] beanTypes = condition.value().length == 0 ? new Class<?>[]{defaultBeanType} : condition.value();
        return Arrays.stream(beanTypes).noneMatch(this::containsBeanOfType);
    }

    private boolean matchesOnBeanCondition(ConditionalOnBean condition) {
        return Arrays.stream(condition.value()).allMatch(this::containsBeanOfType);
    }

    private boolean matchesOnClassCondition(ConditionalOnClass condition) {
        return Arrays.stream(condition.name()).allMatch(this::isPresent);
    }

    private boolean matchesOnPropertyCondition(ConditionalOnProperty condition) {
        if (!propertyResolver.contains(condition.name())) {
            return condition.matchIfMissing();
        }
        String value = propertyResolver.get(condition.name());
        return condition.havingValue().isBlank() || condition.havingValue().equals(value);
    }

    private boolean isPresent(String className) {
        try {
            Class.forName(className, false, Thread.currentThread().getContextClassLoader());
            return true;
        } catch (ClassNotFoundException exception) {
            return false;
        }
    }

    private Object resolveQualifiedDependency(Class<?> dependencyType, String qualifier, Map<String, ?> candidates) {
        if (candidates.containsKey(qualifier)) {
            return candidates.get(qualifier);
        }
        List<String> matchingBeanNames = beanDefinitions.values().stream()
            .filter(definition -> typeMatches(dependencyType, definition))
            .filter(definition -> qualifier.equals(definition.qualifier()))
            .map(BeanDefinition::name)
            .filter(candidates::containsKey)
            .toList();
        if (matchingBeanNames.isEmpty()) {
            throw new NoSuchBeanException("No bean of type " + dependencyType.getName() + " with qualifier " + qualifier);
        }
        if (matchingBeanNames.size() > 1) {
            throw new NoUniqueBeanException("Multiple beans of type " + dependencyType.getName() + " with qualifier " + qualifier + ": " + matchingBeanNames);
        }
        return candidates.get(matchingBeanNames.getFirst());
    }

    private boolean typeMatches(Class<?> dependencyType, BeanDefinition definition) {
        return dependencyType.isAssignableFrom(definition.beanType());
    }

    private String extractQualifier(Class<?> beanType) {
        Qualifier qualifier = beanType.getAnnotation(Qualifier.class);
        return qualifier == null || qualifier.value().isBlank() ? null : qualifier.value();
    }

    private String extractQualifier(Method method) {
        Qualifier qualifier = method.getAnnotation(Qualifier.class);
        return qualifier == null || qualifier.value().isBlank() ? null : qualifier.value();
    }

    private boolean isSingleton(AnnotatedElement element) {
        Scope scope = element.getAnnotation(Scope.class);
        return scope == null || !"prototype".equals(scope.value());
    }

    private Object initializeBean(String beanName, Object bean) {
        injectFieldValues(bean);
        invokeAwareCallbacks(beanName, bean);
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

    private void invokeAwareCallbacks(String beanName, Object bean) {
        if (bean instanceof BeanNameAware beanNameAware) {
            beanNameAware.setBeanName(beanName);
        }
        if (bean instanceof ApplicationContextAware applicationContextAware) {
            applicationContextAware.setApplicationContext(this);
        }
    }

    private void injectFieldValues(Object bean) {
        Arrays.stream(bean.getClass().getDeclaredFields())
            .filter(field -> field.isAnnotationPresent(Value.class))
            .forEach(field -> {
                Value value = field.getAnnotation(Value.class);
                Object converted = convertValue(propertyResolver.resolveRequiredPlaceholder(value.value()), field.getType());
                try {
                    ReflectionUtils.makeAccessible(field).set(bean, converted);
                } catch (IllegalAccessException exception) {
                    throw new IllegalStateException("Failed to inject field " + field, exception);
                }
            });
    }

    private void invokeLifecycleMethods(Object bean, Class<? extends java.lang.annotation.Annotation> annotationType) {
        Class<?> currentType = bean.getClass();
        while (currentType != null && !Object.class.equals(currentType)) {
            for (Method method : currentType.getDeclaredMethods()) {
                if (method.isAnnotationPresent(annotationType)) {
                    ReflectionUtils.invoke(method, bean, new Object[0]);
                }
            }
            currentType = currentType.getSuperclass();
        }
    }

    private void registerDestroyCallback(String beanName, Object originalBean, Object exposedBean) {
        Collection<Method> destroyMethods = Arrays.stream(originalBean.getClass().getDeclaredMethods())
            .filter(method -> method.isAnnotationPresent(PreDestroy.class))
            .toList();
        List<Runnable> callbacks = new ArrayList<>();
        if (!destroyMethods.isEmpty()) {
            callbacks.add(() -> destroyMethods.forEach(method -> ReflectionUtils.invoke(method, originalBean, new Object[0])));
        }
        if (originalBean instanceof AutoCloseable autoCloseable) {
            callbacks.add(() -> closeBean(autoCloseable, originalBean.getClass().getName()));
        } else if (exposedBean instanceof AutoCloseable autoCloseable && !Objects.equals(exposedBean, originalBean)) {
            callbacks.add(() -> closeBean(autoCloseable, exposedBean.getClass().getName()));
        }
        if (callbacks.isEmpty()) {
            return;
        }
        destroyCallbacks.put(beanName, () -> callbacks.forEach(Runnable::run));
    }

    private void closeBean(AutoCloseable bean, String beanTypeName) {
        try {
            bean.close();
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to close bean " + beanTypeName, exception);
        }
    }

    private void sortBeanPostProcessors() {
        beanPostProcessors.sort(OrderUtils.comparator());
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private void notifyListener(ApplicationListener listener, Object event) {
        if (!supportsEvent(listener.getClass(), event)) {
            return;
        }
        listener.onApplicationEvent(event);
    }

    private boolean supportsEvent(Class<?> listenerType, Object event) {
        for (Type type : listenerType.getGenericInterfaces()) {
            if (!(type instanceof ParameterizedType parameterizedType)) {
                continue;
            }
            if (!(parameterizedType.getRawType() instanceof Class<?> rawType)) {
                continue;
            }
            if (!ApplicationListener.class.equals(rawType)) {
                continue;
            }
            Type argumentType = parameterizedType.getActualTypeArguments()[0];
            if (argumentType instanceof Class<?> eventType) {
                return eventType.isAssignableFrom(event.getClass());
            }
        }
        return true;
    }

    private Object convertValue(String value, Class<?> targetType) {
        return conversionService.convert(value, targetType);
    }

    private void registerConditionMetadata(String beanName, AnnotatedElement element, Class<?> defaultBeanType) {
        conditionMetadata.put(beanName, new ConditionMetadata(element, defaultBeanType));
    }

    private boolean isBeanEligible(String beanName) {
        return isBeanEligible(beanName, new HashSet<>());
    }

    private boolean isBeanEligible(String beanName, Set<String> visiting) {
        BeanDefinition beanDefinition = beanDefinitions.get(beanName);
        if (beanDefinition == null) {
            return false;
        }
        if (!visiting.add(beanName)) {
            return false;
        }
        try {
            if (beanDefinition.kind() == Kind.FACTORY_METHOD) {
                String configurationBeanName = BeanNameGenerator.generateBeanName(beanDefinition.configurationClass());
                if (!configurationBeanName.equals(beanName) && !isBeanEligible(configurationBeanName, visiting)) {
                    return false;
                }
            }
            ConditionMetadata metadata = conditionMetadata.get(beanName);
            return metadata == null || matchesConditions(beanName, metadata, visiting);
        } finally {
            visiting.remove(beanName);
        }
    }

    private boolean matchesConditions(String beanName, ConditionMetadata metadata, Set<String> visiting) {
        AnnotatedElement element = metadata.element();
        Class<?> defaultBeanType = metadata.defaultBeanType();

        ConditionalOnMissingBean conditionalOnMissingBean = element.getAnnotation(ConditionalOnMissingBean.class);
        if (conditionalOnMissingBean != null && !matchesMissingBeanCondition(beanName, conditionalOnMissingBean, defaultBeanType, visiting)) {
            return false;
        }

        ConditionalOnBean conditionalOnBean = element.getAnnotation(ConditionalOnBean.class);
        if (conditionalOnBean != null && !matchesOnBeanCondition(beanName, conditionalOnBean, visiting)) {
            return false;
        }

        ConditionalOnClass conditionalOnClass = element.getAnnotation(ConditionalOnClass.class);
        if (conditionalOnClass != null && !matchesOnClassCondition(conditionalOnClass)) {
            return false;
        }

        ConditionalOnProperty conditionalOnProperty = element.getAnnotation(ConditionalOnProperty.class);
        return conditionalOnProperty == null || matchesOnPropertyCondition(conditionalOnProperty);
    }

    private boolean matchesMissingBeanCondition(
        String beanName,
        ConditionalOnMissingBean condition,
        Class<?> defaultBeanType,
        Set<String> visiting
    ) {
        Class<?>[] beanTypes = condition.value().length == 0 ? new Class<?>[]{defaultBeanType} : condition.value();
        return Arrays.stream(beanTypes).noneMatch(beanType -> containsEligibleBeanOfType(beanType, beanName, visiting));
    }

    private boolean matchesOnBeanCondition(String beanName, ConditionalOnBean condition, Set<String> visiting) {
        return Arrays.stream(condition.value()).allMatch(beanType -> containsEligibleBeanOfType(beanType, beanName, visiting));
    }

    private boolean containsEligibleBeanOfType(Class<?> beanType, String excludedBeanName, Set<String> visiting) {
        if (singletons.entrySet().stream()
            .filter(entry -> !entry.getKey().equals(excludedBeanName))
            .anyMatch(entry -> beanType.isAssignableFrom(entry.getValue().getClass()))) {
            return true;
        }
        return beanDefinitions.entrySet().stream()
            .filter(entry -> !entry.getKey().equals(excludedBeanName))
            .filter(entry -> beanType.isAssignableFrom(entry.getValue().beanType()))
            .anyMatch(entry -> isBeanEligible(entry.getKey(), visiting));
    }

    private record ConditionMetadata(AnnotatedElement element, Class<?> defaultBeanType) {
    }
}
