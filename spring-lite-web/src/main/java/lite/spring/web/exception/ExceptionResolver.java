package lite.spring.web.exception;

import lite.spring.web.handler.HandlerMethodMatch;

public interface ExceptionResolver {
    ExceptionHandlingResult resolve(Exception exception, HandlerMethodMatch handlerMethodMatch);
}

