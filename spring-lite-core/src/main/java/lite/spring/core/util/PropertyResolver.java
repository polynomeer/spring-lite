package lite.spring.core.util;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.Map;

public final class PropertyResolver {
    private final Map<String, String> values;

    private PropertyResolver(Map<String, String> values) {
        this.values = values;
    }

    public static PropertyResolver empty() {
        return new PropertyResolver(new LinkedHashMap<>());
    }

    public static PropertyResolver loadFromClasspath(String resourceName) {
        try (InputStream inputStream = Thread.currentThread().getContextClassLoader().getResourceAsStream(resourceName)) {
            if (inputStream == null) {
                return empty();
            }
            String yaml = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            return new PropertyResolver(parseYaml(yaml));
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to read " + resourceName, exception);
        }
    }

    public String get(String key) {
        return values.get(key);
    }

    public String get(String key, String defaultValue) {
        return values.getOrDefault(key, defaultValue);
    }

    public String resolveRequiredPlaceholder(String expression) {
        Placeholder placeholder = parsePlaceholder(expression);
        String value = values.get(placeholder.key());
        if (value != null) {
            return value;
        }
        if (placeholder.defaultValue() != null) {
            return placeholder.defaultValue();
        }
        throw new IllegalStateException("Missing required property " + placeholder.key());
    }

    private Placeholder parsePlaceholder(String expression) {
        if (!expression.startsWith("${") || !expression.endsWith("}")) {
            return new Placeholder(expression, null);
        }
        String body = expression.substring(2, expression.length() - 1);
        int separatorIndex = body.indexOf(':');
        if (separatorIndex < 0) {
            return new Placeholder(body, null);
        }
        return new Placeholder(body.substring(0, separatorIndex), body.substring(separatorIndex + 1));
    }

    private static Map<String, String> parseYaml(String yaml) {
        Map<String, String> result = new LinkedHashMap<>();
        Deque<String> stack = new ArrayDeque<>();
        for (String line : yaml.split("\\R")) {
            if (line.isBlank() || line.trim().startsWith("#")) {
                continue;
            }
            int indent = countLeadingSpaces(line) / 2;
            while (stack.size() > indent) {
                stack.removeLast();
            }
            String[] parts = line.trim().split(":", 2);
            String key = parts[0].trim();
            String value = parts.length > 1 ? parts[1].trim() : "";
            if (value.isEmpty()) {
                stack.addLast(key);
                continue;
            }
            String prefix = String.join(".", stack);
            String fullKey = prefix.isBlank() ? key : prefix + "." + key;
            result.put(fullKey, value);
        }
        return result;
    }

    private static int countLeadingSpaces(String line) {
        int count = 0;
        while (count < line.length() && line.charAt(count) == ' ') {
            count++;
        }
        return count;
    }

    private record Placeholder(String key, String defaultValue) {
    }
}

