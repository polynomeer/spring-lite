package lite.spring.context;

import java.util.List;
import java.util.Map;
import lite.spring.core.trace.TraceEvent;

public interface ApplicationContext extends AutoCloseable {
    <T> T getBean(Class<T> type);

    Object getBean(String name);

    <T> Map<String, T> getBeansOfType(Class<T> type);

    Map<String, Object> getBeansWithAnnotation(Class<? extends java.lang.annotation.Annotation> annotationType);

    List<BeanRuntimeDescriptor> getBeanRuntimeDescriptors();

    /** Container trace events recorded during the last refresh; empty when the context records none. */
    default List<TraceEvent> getRefreshTrace() {
        return List.of();
    }

    boolean containsBeanOfType(Class<?> type);

    void publishEvent(Object event);

    @Override
    void close();
}
