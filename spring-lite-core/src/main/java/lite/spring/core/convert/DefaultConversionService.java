package lite.spring.core.convert;

public class DefaultConversionService implements ConversionService {
    @Override
    public Object convert(String value, Class<?> targetType) {
        if (value == null) {
            return null;
        }
        if (targetType.equals(String.class) || targetType.equals(Object.class)) {
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
        if (targetType.equals(Double.class) || targetType.equals(double.class)) {
            return Double.parseDouble(value);
        }
        if (targetType.isEnum()) {
            @SuppressWarnings({"unchecked", "rawtypes"})
            Enum<?> enumValue = Enum.valueOf((Class<? extends Enum>) targetType.asSubclass(Enum.class), value);
            return enumValue;
        }
        throw new IllegalStateException("Unsupported conversion target type " + targetType.getName());
    }
}
