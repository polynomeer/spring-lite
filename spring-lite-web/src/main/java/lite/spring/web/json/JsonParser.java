package lite.spring.web.json;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class JsonParser {
    private final String text;
    private int index;

    JsonParser(String text) {
        this.text = text == null ? "" : text.trim();
    }

    Object parse() {
        skipWhitespace();
        Object value = parseValue();
        skipWhitespace();
        return value;
    }

    private Object parseValue() {
        skipWhitespace();
        char current = currentChar();
        return switch (current) {
            case '{' -> parseObject();
            case '[' -> parseArray();
            case '"' -> parseString();
            case 't', 'f' -> parseBoolean();
            case 'n' -> parseNull();
            default -> parseNumber();
        };
    }

    private Map<String, Object> parseObject() {
        expect('{');
        Map<String, Object> result = new LinkedHashMap<>();
        skipWhitespace();
        if (currentChar() == '}') {
            index++;
            return result;
        }
        while (true) {
            String key = parseString();
            skipWhitespace();
            expect(':');
            Object value = parseValue();
            result.put(key, value);
            skipWhitespace();
            if (currentChar() == '}') {
                index++;
                return result;
            }
            expect(',');
        }
    }

    private List<Object> parseArray() {
        expect('[');
        List<Object> result = new ArrayList<>();
        skipWhitespace();
        if (currentChar() == ']') {
            index++;
            return result;
        }
        while (true) {
            result.add(parseValue());
            skipWhitespace();
            if (currentChar() == ']') {
                index++;
                return result;
            }
            expect(',');
        }
    }

    private String parseString() {
        expect('"');
        StringBuilder builder = new StringBuilder();
        while (currentChar() != '"') {
            char current = text.charAt(index++);
            if (current == '\\') {
                builder.append(unescape(text.charAt(index++)));
                continue;
            }
            builder.append(current);
        }
        expect('"');
        return builder.toString();
    }

    private char unescape(char escaped) {
        return switch (escaped) {
            case 'n' -> '\n';
            case 'r' -> '\r';
            case 't' -> '\t';
            case 'b' -> '\b';
            case 'f' -> '\f';
            case 'u' -> {
                char decoded = (char) Integer.parseInt(text.substring(index, index + 4), 16);
                index += 4;
                yield decoded;
            }
            default -> escaped;
        };
    }

    private Boolean parseBoolean() {
        if (text.startsWith("true", index)) {
            index += 4;
            return true;
        }
        if (text.startsWith("false", index)) {
            index += 5;
            return false;
        }
        throw new IllegalStateException("Invalid boolean at " + index);
    }

    private Object parseNull() {
        if (!text.startsWith("null", index)) {
            throw new IllegalStateException("Invalid null at " + index);
        }
        index += 4;
        return null;
    }

    private Number parseNumber() {
        int start = index;
        while (index < text.length() && "-0123456789.".indexOf(text.charAt(index)) >= 0) {
            index++;
        }
        String value = text.substring(start, index);
        return value.contains(".") ? Double.parseDouble(value) : Long.parseLong(value);
    }

    private void expect(char expected) {
        skipWhitespace();
        if (currentChar() != expected) {
            throw new IllegalStateException("Expected '" + expected + "' at " + index);
        }
        index++;
    }

    private char currentChar() {
        if (index >= text.length()) {
            return '\0';
        }
        return text.charAt(index);
    }

    private void skipWhitespace() {
        while (index < text.length() && Character.isWhitespace(text.charAt(index))) {
            index++;
        }
    }
}

