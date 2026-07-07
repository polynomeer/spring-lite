package lite.spring.web.bind;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.lang.reflect.Parameter;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import lite.spring.web.annotation.RequestBody;
import lite.spring.web.handler.HandlerMethodMatch;
import lite.spring.web.json.JsonMapper;

public class RequestBodyArgumentResolver implements HandlerMethodArgumentResolver {
    private final JsonMapper jsonMapper;
    private final TypeConverter typeConverter;

    public RequestBodyArgumentResolver(JsonMapper jsonMapper, TypeConverter typeConverter) {
        this.jsonMapper = jsonMapper;
        this.typeConverter = typeConverter;
    }

    @Override
    public boolean supportsParameter(Parameter parameter) {
        return parameter.isAnnotationPresent(RequestBody.class);
    }

    @Override
    public Object resolveArgument(Parameter parameter, HandlerMethodMatch handlerMethodMatch, HttpExchange exchange) {
        try {
            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            return bindBody(body, parameter.getType());
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to read request body", exception);
        }
    }

    private Object bindBody(String body, Class<?> parameterType) {
        if (parameterType.equals(String.class)) {
            return body;
        }
        Object parsed = jsonMapper.readTree(body);
        if (parameterType.isAssignableFrom(Map.class)) {
            return parsed;
        }
        if (parameterType.isRecord() && parsed instanceof Map<?, ?> map) {
            try {
                var components = parameterType.getRecordComponents();
                Object[] arguments = new Object[components.length];
                for (int index = 0; index < components.length; index++) {
                    Object raw = map.get(components[index].getName());
                    arguments[index] = typeConverter.convert(raw == null ? null : String.valueOf(raw), components[index].getType());
                }
                Class<?>[] signature = java.util.Arrays.stream(components).map(component -> component.getType()).toArray(Class<?>[]::new);
                return parameterType.getDeclaredConstructor(signature).newInstance(arguments);
            } catch (ReflectiveOperationException exception) {
                throw new IllegalStateException("Failed to bind request body to " + parameterType.getName(), exception);
            }
        }
        return parsed;
    }
}

