package lite.spring.web.handler;

import com.sun.net.httpserver.HttpExchange;

public interface HandlerAdapter {
    Object handle(HandlerMethodMatch handlerMethodMatch, HttpExchange exchange) throws Exception;
}

