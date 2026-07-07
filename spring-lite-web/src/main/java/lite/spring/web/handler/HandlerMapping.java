package lite.spring.web.handler;

import com.sun.net.httpserver.HttpExchange;

public interface HandlerMapping {
    HandlerMethodMatch getHandler(HttpExchange exchange);
}

