package lite.spring.context;

import java.util.List;
import java.util.Map;

public interface ApplicationContext extends AutoCloseable {
    <T> T getBean(Class<T> type);

    Object getBean(String name);

    <T> Map<String, T> getBeansOfType(Class<T> type);

    Map<String, Object> getBeansWithAnnotation(Class<? extends java.lang.annotation.Annotation> annotationType);

    List<BeanRuntimeDescriptor> getBeanRuntimeDescriptors();

    boolean containsBeanOfType(Class<?> type);

    void publishEvent(Object event);

    @Override
    void close();
}
