package lite.spring.web.handler;

import com.sun.net.httpserver.HttpExchange;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.List;
import lite.spring.web.bind.HandlerMethodArgumentResolver;

public class RequestMappingHandlerAdapter implements HandlerAdapter {
    private final List<HandlerMethodArgumentResolver> argumentResolvers;

    public RequestMappingHandlerAdapter(List<HandlerMethodArgumentResolver> argumentResolvers) {
        this.argumentResolvers = argumentResolvers;
    }

    @Override
    public Object handle(HandlerMethodMatch handlerMethodMatch, HttpExchange exchange) throws Exception {
        Method method = handlerMethodMatch.handlerMethod().method();
        method.setAccessible(true);
        Object[] arguments = new Object[method.getParameterCount()];
        Parameter[] parameters = method.getParameters();
        for (int index = 0; index < parameters.length; index++) {
            arguments[index] = resolveArgument(parameters[index], handlerMethodMatch, exchange);
        }
        try {
            return method.invoke(handlerMethodMatch.handlerMethod().bean(), arguments);
        } catch (InvocationTargetException exception) {
            Throwable target = exception.getTargetException();
            if (target instanceof Exception ex) {
                throw ex;
            }
            throw new IllegalStateException(target);
        }
    }

    private Object resolveArgument(Parameter parameter, HandlerMethodMatch handlerMethodMatch, HttpExchange exchange) {
        for (HandlerMethodArgumentResolver resolver : argumentResolvers) {
            if (resolver.supportsParameter(parameter)) {
                return resolver.resolveArgument(parameter, handlerMethodMatch, exchange);
            }
        }
        return null;
    }
}

