package lite.spring.context;

import java.util.Map;

public interface ApplicationContext extends AutoCloseable {
    <T> T getBean(Class<T> type);

    Object getBean(String name);

    <T> Map<String, T> getBeansOfType(Class<T> type);

    @Override
    void close();
}

