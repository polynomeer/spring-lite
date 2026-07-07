package lite.spring.web.bind;

import com.sun.net.httpserver.HttpExchange;
import java.lang.reflect.Parameter;
import lite.spring.web.annotation.PathVariable;
import lite.spring.web.handler.HandlerMethodMatch;

public class PathVariableArgumentResolver implements HandlerMethodArgumentResolver {
    private final TypeConverter typeConverter;

    public PathVariableArgumentResolver(TypeConverter typeConverter) {
        this.typeConverter = typeConverter;
    }

    @Override
    public boolean supportsParameter(Parameter parameter) {
        return parameter.isAnnotationPresent(PathVariable.class);
    }

    @Override
    public Object resolveArgument(Parameter parameter, HandlerMethodMatch handlerMethodMatch, HttpExchange exchange) {
        String name = parameter.getAnnotation(PathVariable.class).value();
        return typeConverter.convert(handlerMethodMatch.pathVariables().get(name), parameter.getType());
    }
}

