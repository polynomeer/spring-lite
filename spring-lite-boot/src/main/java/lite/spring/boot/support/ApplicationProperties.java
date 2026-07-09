package lite.spring.boot.support;

import java.util.LinkedHashMap;
import java.util.Map;
import lite.spring.core.util.PropertyResolver;

public final class ApplicationProperties {
    private final Map<String, String> values = new LinkedHashMap<>();

    public static ApplicationProperties load() {
        return from(PropertyResolver.loadApplicationProperties());
    }

    public String get(String key, String defaultValue) {
        return values.getOrDefault(key, defaultValue);
    }

    public static ApplicationProperties from(PropertyResolver resolver) {
        ApplicationProperties properties = new ApplicationProperties();
        properties.values.putAll(resolver.asMap());
        return properties;
    }
}
