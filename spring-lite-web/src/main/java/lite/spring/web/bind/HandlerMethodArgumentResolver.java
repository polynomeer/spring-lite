package lite.spring.web.bind;

import com.sun.net.httpserver.HttpExchange;
import java.lang.reflect.Parameter;
import lite.spring.web.handler.HandlerMethodMatch;

public interface HandlerMethodArgumentResolver {
    boolean supportsParameter(Parameter parameter);

    Object resolveArgument(Parameter parameter, HandlerMethodMatch handlerMethodMatch, HttpExchange exchange);
}

