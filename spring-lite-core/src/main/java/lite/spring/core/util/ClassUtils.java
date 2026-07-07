package lite.spring.core.util;

public final class ClassUtils {
    private ClassUtils() {
    }

    public static String decapitalize(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        if (value.length() == 1) {
            return value.toLowerCase();
        }
        return Character.toLowerCase(value.charAt(0)) + value.substring(1);
    }
}

