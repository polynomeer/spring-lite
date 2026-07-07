package lite.spring.web.bind;

public class TypeConverter {
    public Object convert(String value, Class<?> targetType) {
        if (value == null) {
            return null;
        }
        if (targetType.equals(String.class)) {
            return value;
        }
        if (targetType.equals(Long.class) || targetType.equals(long.class)) {
            return value.contains(".") ? (long) Double.parseDouble(value) : Long.parseLong(value);
        }
        if (targetType.equals(Integer.class) || targetType.equals(int.class)) {
            return value.contains(".") ? (int) Double.parseDouble(value) : Integer.parseInt(value);
        }
        if (targetType.equals(Boolean.class) || targetType.equals(boolean.class)) {
            return Boolean.parseBoolean(value);
        }
        return value;
    }
}

