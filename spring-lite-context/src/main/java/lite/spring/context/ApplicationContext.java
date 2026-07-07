package lite.spring.context;

import java.util.Map;

public interface ApplicationContext extends AutoCloseable {
    <T> T getBean(Class<T> type);

    Object getBean(String name);

    <T> Map<String, T> getBeansOfType(Class<T> type);

    Map<String, Object> getBeansWithAnnotation(Class<? extends java.lang.annotation.Annotation> annotationType);

    boolean containsBeanOfType(Class<?> type);

    @Override
    void close();
}
