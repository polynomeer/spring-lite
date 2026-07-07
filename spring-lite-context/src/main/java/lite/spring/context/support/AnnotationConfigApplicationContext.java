package lite.spring.context.support;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.lang.reflect.AnnotatedElement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lite.spring.context.ApplicationContext;
import lite.spring.context.bean.BeanDefinition;
import lite.spring.context.bean.BeanDefinition.Kind;
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
import lite.spring.core.annotation.Value;
import lite.spring.core.exception.BeansException;
import lite.spring.core.exception.NoSuchBeanException;
import lite.spring.core.exception.NoUniqueBeanException;
import lite.spring.core.reflect.ReflectionUtils;
import lite.spring.core.util.PropertyResolver;

public class AnnotationConfigApplicationContext implements ConfigurableApplicationContext {
    private final Map<String, BeanDefinition> beanDefinitions = new LinkedHashMap<>();
    private final Map<String, Object> singletons = new LinkedHashMap<>();
    private final Map<String, Runnable> destroyCallbacks = new LinkedHashMap<>();
    private final List<BeanPostProcessor> beanPostProcessors = new ArrayList<>();
    private final Set<String> beansInCreation = new LinkedHashSet<>();
    private final ClassPathScanner classPathScanner = new ClassPathScanner();
    private final PropertyResolver propertyResolver = PropertyResolver.loadFromClasspath("application.yml");
    private boolean refreshed;

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
        return beanDefinitions.containsKey(beanName);
    }

    public boolean containsBeanOfType(Class<?> beanType) {
        return beanDefinitions.values().stream().anyMatch(definition -> beanType.isAssignableFrom(definition.beanType()))
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
        if (beanDefinition == null) {
            throw new NoSuchBeanException("No bean named " + name);
        }
        return createBean(name, beanDefinition);
    }

    @Override
    public <T> Map<String, T> getBeansOfType(Class<T> type) {
        Map<String, T> result = new LinkedHashMap<>();
        for (String beanName : beanDefinitions.keySet()) {
            BeanDefinition beanDefinition = beanDefinitions.get(beanName);
            if (type.isAssignableFrom(beanDefinition.beanType())) {
                if (beansInCreation.contains(beanName)) {
                    continue;
                }
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
    public void close() {
        List<Runnable> callbacks = new ArrayList<>(destroyCallbacks.values());
        for (int index = callbacks.size() - 1; index >= 0; index--) {
            callbacks.get(index).run();
        }
        singletons.values().stream()
            .filter(bean -> bean instanceof AutoCloseable)
            .map(bean -> (AutoCloseable) bean)
            .forEach(bean -> {
                try {
                    bean.close();
                } catch (Exception exception) {
                    throw new IllegalStateException("Failed to close bean " + bean.getClass().getName(), exception);
                }
            });
    }

    private void registerDiscoveredClass(Class<?> candidate) {
        if (candidate.isInterface() || candidate.isAnnotation() || candidate.isEnum()) {
            return;
        }
        if (!isManagedType(candidate)) {
            return;
        }
        if (!matchesConditions(candidate, candidate)) {
            return;
        }
        BeanDefinition.Kind kind = AnnotationUtils.hasAnnotation(candidate, Configuration.class)
            ? Kind.CONFIGURATION
            : Kind.COMPONENT;
        registerBeanDefinition(BeanDefinition.component(
            BeanNameGenerator.generateBeanName(candidate),
            candidate,
            kind,
            extractQualifier(candidate)
        ));
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
            .toList();
        for (String beanName : postProcessorBeanNames) {
            BeanPostProcessor beanPostProcessor = (BeanPostProcessor) getBean(beanName);
            if (!beanPostProcessors.contains(beanPostProcessor)) {
                beanPostProcessors.add(beanPostProcessor);
            }
        }
    }

    private void instantiateConfigurationBeans() {
        beanDefinitions.values().stream()
            .filter(definition -> definition.kind() == Kind.CONFIGURATION)
            .map(BeanDefinition::name)
            .collect(Collectors.toList())
            .forEach(this::getBean);
    }

    private void instantiateRemainingSingletons() {
        new ArrayList<>(beanDefinitions.keySet()).forEach(this::getBean);
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
            singletons.put(beanName, initialized);
            if (initialized instanceof BeanPostProcessor beanPostProcessor && !beanPostProcessors.contains(beanPostProcessor)) {
                beanPostProcessors.add(beanPostProcessor);
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
            if (!matchesConditions(method, method.getReturnType())) {
                continue;
            }
            String beanName = bean.value().isBlank() ? BeanNameGenerator.generateBeanName(method.getName()) : bean.value();
            if (beanDefinitions.containsKey(beanName)) {
                continue;
            }
            registerBeanDefinition(BeanDefinition.factoryMethod(
                beanName,
                method.getReturnType(),
                configurationClass,
                method,
                extractQualifier(method)
            ));
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
        registerDestroyCallback(beanName, current);
        return current;
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
        for (Method method : bean.getClass().getDeclaredMethods()) {
            if (method.isAnnotationPresent(annotationType)) {
                ReflectionUtils.invoke(method, bean, new Object[0]);
            }
        }
    }

    private void registerDestroyCallback(String beanName, Object bean) {
        Collection<Method> destroyMethods = Arrays.stream(bean.getClass().getDeclaredMethods())
            .filter(method -> method.isAnnotationPresent(PreDestroy.class))
            .toList();
        if (destroyMethods.isEmpty()) {
            return;
        }
        destroyCallbacks.put(beanName, () -> destroyMethods.forEach(method -> ReflectionUtils.invoke(method, bean, new Object[0])));
    }

    private Object convertValue(String value, Class<?> targetType) {
        if (targetType.equals(String.class)) {
            return value;
        }
        if (targetType.equals(Integer.class) || targetType.equals(int.class)) {
            return Integer.parseInt(value);
        }
        if (targetType.equals(Long.class) || targetType.equals(long.class)) {
            return Long.parseLong(value);
        }
        if (targetType.equals(Boolean.class) || targetType.equals(boolean.class)) {
            return Boolean.parseBoolean(value);
        }
        if (targetType.equals(Double.class) || targetType.equals(double.class)) {
            return Double.parseDouble(value);
        }
        throw new IllegalStateException("Unsupported @Value target type " + targetType.getName());
    }
}
