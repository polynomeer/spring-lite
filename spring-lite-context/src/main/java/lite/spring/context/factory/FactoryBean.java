package lite.spring.context.factory;

/**
 * Creates an object that is exposed by the application context under the factory bean name.
 */
public interface FactoryBean<T> {
    T getObject();

    Class<?> getObjectType();

    default boolean isSingleton() {
        return true;
    }
}
