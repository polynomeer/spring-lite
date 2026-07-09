package lite.spring.web.bind;

import lite.spring.core.convert.ConversionService;
import lite.spring.core.convert.DefaultConversionService;

public class TypeConverter {
    private final ConversionService conversionService;

    public TypeConverter() {
        this(new DefaultConversionService());
    }

    public TypeConverter(ConversionService conversionService) {
        this.conversionService = conversionService;
    }

    public Object convert(String value, Class<?> targetType) {
        return conversionService.convert(value, targetType);
    }
}
