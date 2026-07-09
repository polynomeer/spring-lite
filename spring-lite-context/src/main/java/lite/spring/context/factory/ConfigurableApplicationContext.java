package lite.spring.context.factory;

import lite.spring.context.ApplicationContext;
import lite.spring.context.bean.BeanDefinition;

public interface ConfigurableApplicationContext extends ApplicationContext {
    void registerBeanDefinition(BeanDefinition beanDefinition);

    void registerSingleton(String beanName, Object singleton);

    void addBeanPostProcessor(BeanPostProcessor beanPostProcessor);

    void refresh();
}
