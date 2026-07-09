package lite.spring.core.convert;

public interface ConversionService {
    Object convert(String value, Class<?> targetType);
}
