package lite.spring.web.bind;

import com.sun.net.httpserver.HttpExchange;
import java.lang.reflect.Parameter;
import lite.spring.web.handler.HandlerMethodMatch;

public class HttpExchangeArgumentResolver implements HandlerMethodArgumentResolver {
    @Override
    public boolean supportsParameter(Parameter parameter) {
        return parameter.getType().equals(HttpExchange.class);
    }

    @Override
    public Object resolveArgument(Parameter parameter, HandlerMethodMatch handlerMethodMatch, HttpExchange exchange) {
        return exchange;
    }
}

