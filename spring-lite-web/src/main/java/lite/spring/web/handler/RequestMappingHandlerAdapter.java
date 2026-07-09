package lite.spring.web.handler;

import com.sun.net.httpserver.HttpExchange;
import java.lang.annotation.Annotation;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.List;
import lite.spring.core.validation.Validator;
import lite.spring.web.annotation.PathVariable;
import lite.spring.web.annotation.RequestBody;
import lite.spring.web.annotation.RequestParam;
import lite.spring.web.bind.HandlerMethodArgumentResolver;

public class RequestMappingHandlerAdapter implements HandlerAdapter {
    private final List<HandlerMethodArgumentResolver> argumentResolvers;
    private final Validator validator;

    public RequestMappingHandlerAdapter(List<HandlerMethodArgumentResolver> argumentResolvers, Validator validator) {
        this.argumentResolvers = argumentResolvers;
        this.validator = validator;
    }

    @Override
    public Object handle(HandlerMethodMatch handlerMethodMatch, HttpExchange exchange) throws Exception {
        Method method = handlerMethodMatch.handlerMethod().method();
        method.setAccessible(true);
        Object[] arguments = new Object[method.getParameterCount()];
        Parameter[] parameters = method.getParameters();
        for (int index = 0; index < parameters.length; index++) {
            arguments[index] = resolveArgument(parameters[index], handlerMethodMatch, exchange);
            validateArgument(parameters[index], arguments[index]);
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

    private void validateArgument(Parameter parameter, Object argument) {
        Annotation[] annotations = parameter.getAnnotations();
        if (annotations.length == 0) {
            return;
        }
        validator.validateValue(resolveValidationPath(parameter), argument, annotations);
    }

    private String resolveValidationPath(Parameter parameter) {
        RequestParam requestParam = parameter.getAnnotation(RequestParam.class);
        if (requestParam != null) {
            return requestParam.value();
        }
        PathVariable pathVariable = parameter.getAnnotation(PathVariable.class);
        if (pathVariable != null) {
            return pathVariable.value();
        }
        if (parameter.isAnnotationPresent(RequestBody.class)) {
            return "request";
        }
        return parameter.getName();
    }
}
