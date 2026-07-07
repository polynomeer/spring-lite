package lite.spring.boot.support;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

public final class ApplicationProperties {
    private final Map<String, String> values = new LinkedHashMap<>();

    public static ApplicationProperties load() {
        ApplicationProperties properties = new ApplicationProperties();
        try (InputStream inputStream = Thread.currentThread().getContextClassLoader().getResourceAsStream("application.yml")) {
            if (inputStream == null) {
                return properties;
            }
            String yaml = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            properties.parse(yaml);
            return properties;
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to read application.yml", exception);
        }
    }

    public String get(String key, String defaultValue) {
        return values.getOrDefault(key, defaultValue);
    }

    private void parse(String yaml) {
        String[] lines = yaml.split("\\R");
        java.util.Deque<String> stack = new java.util.ArrayDeque<>();
        for (String line : lines) {
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
            values.put(fullKey, value);
        }
    }

    private int countLeadingSpaces(String line) {
        int count = 0;
        while (count < line.length() && line.charAt(count) == ' ') {
            count++;
        }
        return count;
    }
}

