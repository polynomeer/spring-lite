package lite.spring.web.handler;

import java.util.Map;
import lite.spring.web.support.HandlerMethod;

public record HandlerMethodMatch(HandlerMethod handlerMethod, Map<String, String> pathVariables) {
}

