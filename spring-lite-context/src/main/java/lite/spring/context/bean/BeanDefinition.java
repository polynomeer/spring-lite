package lite.spring.context.bean;

import java.lang.reflect.Method;

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

    public static BeanDefinition component(String name, Class<?> beanType, Kind kind, String qualifier) {
        return component(name, beanType, kind, true, qualifier);
    }

    public static BeanDefinition component(String name, Class<?> beanType, Kind kind, boolean singleton, String qualifier) {
        return new BeanDefinition(name, beanType, kind, null, null, singleton, qualifier);
    }

    public static BeanDefinition factoryMethod(String name, Class<?> beanType, Class<?> configurationClass, Method factoryMethod, String qualifier) {
        return factoryMethod(name, beanType, configurationClass, factoryMethod, true, qualifier);
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

    public String name() {
        return name;
    }

    public Class<?> beanType() {
        return beanType;
    }

    public Kind kind() {
        return kind;
    }

    public Class<?> configurationClass() {
        return configurationClass;
    }

    public Method factoryMethod() {
        return factoryMethod;
    }

    public boolean singleton() {
        return singleton;
    }

    public String qualifier() {
        return qualifier;
    }
}
