package lite.spring.context.support;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
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
import lite.spring.core.annotation.Configuration;
import lite.spring.core.annotation.PostConstruct;
import lite.spring.core.annotation.PreDestroy;
import lite.spring.core.exception.BeansException;
import lite.spring.core.exception.NoSuchBeanException;
import lite.spring.core.exception.NoUniqueBeanException;
import lite.spring.core.reflect.ReflectionUtils;

public class AnnotationConfigApplicationContext implements ConfigurableApplicationContext {
    private final Map<String, BeanDefinition> beanDefinitions = new LinkedHashMap<>();
    private final Map<String, Object> singletons = new LinkedHashMap<>();
    private final Map<String, Runnable> destroyCallbacks = new LinkedHashMap<>();
    private final List<BeanPostProcessor> beanPostProcessors = new ArrayList<>();
    private final Set<String> beansInCreation = new LinkedHashSet<>();
    private final ClassPathScanner classPathScanner = new ClassPathScanner();
    private boolean refreshed;

    public AnnotationConfigApplicationContext(Class<?>... configurationClasses) {
        register(configurationClasses);
        refresh();
    }

    public AnnotationConfigApplicationContext(String... basePackages) {
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
        BeanDefinition.Kind kind = candidate.isAnnotationPresent(Configuration.class)
            ? Kind.CONFIGURATION
            : Kind.COMPONENT;
        registerBeanDefinition(BeanDefinition.component(BeanNameGenerator.generateBeanName(candidate), candidate, kind));
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

            if (beanDefinition.kind() == Kind.CONFIGURATION) {
                registerBeanMethods(beanDefinition.beanType());
            }

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
            arguments[index] = resolveDependency(parameters[index].getType());
        }
        return arguments;
    }

    private Object resolveDependency(Class<?> dependencyType) {
        if (dependencyType.equals(ApplicationContext.class) || dependencyType.equals(ConfigurableApplicationContext.class)) {
            return this;
        }
        Map<String, ?> candidates = getBeansOfType(dependencyType);
        if (candidates.isEmpty()) {
            throw new NoSuchBeanException("No bean of type " + dependencyType.getName());
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
            registerBeanDefinition(BeanDefinition.factoryMethod(beanName, method.getReturnType(), configurationClass, method));
        }
    }

    private Object initializeBean(String beanName, Object bean) {
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
}
