package lite.spring.web.bind;

import com.sun.net.httpserver.HttpExchange;
import java.lang.reflect.Parameter;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import lite.spring.web.annotation.RequestParam;
import lite.spring.web.handler.HandlerMethodMatch;

public class RequestParamArgumentResolver implements HandlerMethodArgumentResolver {
    private final TypeConverter typeConverter;

    public RequestParamArgumentResolver(TypeConverter typeConverter) {
        this.typeConverter = typeConverter;
    }

    @Override
    public boolean supportsParameter(Parameter parameter) {
        return parameter.isAnnotationPresent(RequestParam.class);
    }

    @Override
    public Object resolveArgument(Parameter parameter, HandlerMethodMatch handlerMethodMatch, HttpExchange exchange) {
        String name = parameter.getAnnotation(RequestParam.class).value();
        String value = parseQuery(exchange.getRequestURI().getRawQuery()).get(name);
        return typeConverter.convert(value, parameter.getType());
    }

    private Map<String, String> parseQuery(String rawQuery) {
        Map<String, String> result = new LinkedHashMap<>();
        if (rawQuery == null || rawQuery.isBlank()) {
            return result;
        }
        for (String pair : rawQuery.split("&")) {
            String[] parts = pair.split("=", 2);
            String key = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
            String value = parts.length > 1 ? URLDecoder.decode(parts[1], StandardCharsets.UTF_8) : "";
            result.put(key, value);
        }
        return result;
    }
}

