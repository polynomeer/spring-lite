package lite.spring.web.json;

import java.lang.reflect.RecordComponent;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class JsonMapper {
    public String write(Object value) {
        if (value == null) {
            return "null";
        }
        if (value instanceof String string) {
            return "\"" + escape(string) + "\"";
        }
        if (value instanceof Number || value instanceof Boolean) {
            return value.toString();
        }
        if (value instanceof Map<?, ?> map) {
            List<String> entries = new ArrayList<>();
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                entries.add(write(String.valueOf(entry.getKey())) + ":" + write(entry.getValue()));
            }
            return "{" + String.join(",", entries) + "}";
        }
        if (value instanceof Collection<?> collection) {
            List<String> entries = collection.stream().map(this::write).toList();
            return "[" + String.join(",", entries) + "]";
        }
        if (value.getClass().isRecord()) {
            Map<String, Object> values = new LinkedHashMap<>();
            for (RecordComponent component : value.getClass().getRecordComponents()) {
                try {
                    values.put(component.getName(), component.getAccessor().invoke(value));
                } catch (ReflectiveOperationException exception) {
                    throw new IllegalStateException("Failed to serialize record " + value.getClass().getName(), exception);
                }
            }
            return write(values);
        }
        return writePojo(value);
    }

    public Object readTree(String json) {
        return new JsonParser(json).parse();
    }

    private String writePojo(Object value) {
        Map<String, Object> fields = new LinkedHashMap<>();
        for (var field : value.getClass().getDeclaredFields()) {
            try {
                field.setAccessible(true);
                fields.put(field.getName(), field.get(value));
            } catch (IllegalAccessException exception) {
                throw new IllegalStateException("Failed to serialize " + value.getClass().getName(), exception);
            }
        }
        return write(fields);
    }

    /** Escapes quotes, backslashes and control characters so multi-line text stays valid JSON. */
    private String escape(String value) {
        StringBuilder escaped = new StringBuilder(value.length() + 8);
        for (int index = 0; index < value.length(); index++) {
            char character = value.charAt(index);
            switch (character) {
                case '"' -> escaped.append("\\\"");
                case '\\' -> escaped.append("\\\\");
                case '\n' -> escaped.append("\\n");
                case '\r' -> escaped.append("\\r");
                case '\t' -> escaped.append("\\t");
                case '\b' -> escaped.append("\\b");
                case '\f' -> escaped.append("\\f");
                default -> {
                    if (character < 0x20) {
                        escaped.append(String.format("\\u%04x", (int) character));
                    } else {
                        escaped.append(character);
                    }
                }
            }
        }
        return escaped.toString();
    }
}

