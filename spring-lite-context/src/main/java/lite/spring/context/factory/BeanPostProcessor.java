package lite.spring.context.factory;

public interface BeanPostProcessor {
    default Object postProcessBeforeInitialization(String beanName, Object bean) {
        return bean;
    }

    default Object postProcessAfterInitialization(String beanName, Object bean) {
        return bean;
    }
}

