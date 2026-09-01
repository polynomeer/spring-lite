package lite.spring.web.exception;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lite.spring.context.ApplicationContext;
import lite.spring.core.validation.ConstraintViolation;
import lite.spring.core.validation.ValidationException;
import lite.spring.web.annotation.ControllerAdvice;
import lite.spring.web.annotation.ExceptionHandler;
import lite.spring.web.annotation.ResponseStatus;
import lite.spring.web.handler.HandlerMethodMatch;

public class DefaultExceptionResolver implements ExceptionResolver {
    private final ApplicationContext applicationContext;

    public DefaultExceptionResolver(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @Override
    public ExceptionHandlingResult resolve(Exception exception, HandlerMethodMatch handlerMethodMatch) {
        if (handlerMethodMatch != null) {
            Method handler = findExceptionHandlerMethod(handlerMethodMatch.handlerMethod().bean().getClass(), exception);
            if (handler != null) {
                return invokeHandler(handlerMethodMatch.handlerMethod().bean(), handler, exception);
            }
        }
        for (Object adviceBean : applicationContext.getBeansWithAnnotation(ControllerAdvice.class).values()) {
            Method handler = findExceptionHandlerMethod(adviceBean.getClass(), exception);
            if (handler != null) {
                return invokeHandler(adviceBean, handler, exception);
            }
        }
        if (exception instanceof ValidationException validationException) {
            return new ExceptionHandlingResult(400, Map.of(
                "error", "Validation failed",
                "violations", toViolationPayload(validationException.violations())
            ));
        }
        if (exception instanceof IllegalArgumentException) {
            return new ExceptionHandlingResult(400, Map.of("error", exception.getMessage()));
        }
        return new ExceptionHandlingResult(resolveStatus(exception.getClass(), 500), Map.of("error", exception.getMessage()));
    }

    private ExceptionHandlingResult invokeHandler(Object target, Method handler, Exception exception) {
        try {
            handler.setAccessible(true);
            Object body = handler.invoke(target, exception);
            return new ExceptionHandlingResult(resolveStatus(handler, resolveStatus(exception.getClass(), 400)), body);
        } catch (IllegalAccessException | InvocationTargetException invocationException) {
            throw new IllegalStateException("Failed to invoke exception handler", invocationException);
        }
    }

    private int resolveStatus(java.lang.reflect.AnnotatedElement source, int defaultStatus) {
        ResponseStatus responseStatus = source.getAnnotation(ResponseStatus.class);
        return responseStatus == null ? defaultStatus : responseStatus.value();
    }

    private List<Map<String, Object>> toViolationPayload(List<ConstraintViolation> violations) {
        return violations.stream()
            .map(violation -> {
                Map<String, Object> payload = new LinkedHashMap<>();
                payload.put("path", violation.path());
                payload.put("message", violation.message());
                payload.put("rejectedValue", violation.rejectedValue());
                return payload;
            })
            .toList();
    }

    private Method findExceptionHandlerMethod(Class<?> beanType, Exception exception) {
        for (Method method : beanType.getDeclaredMethods()) {
            ExceptionHandler exceptionHandler = method.getAnnotation(ExceptionHandler.class);
            if (exceptionHandler == null) {
                continue;
            }
            for (Class<? extends Throwable> handledType : exceptionHandler.value()) {
                if (handledType.isAssignableFrom(exception.getClass())) {
                    return method;
                }
            }
        }
        return null;
    }
}
