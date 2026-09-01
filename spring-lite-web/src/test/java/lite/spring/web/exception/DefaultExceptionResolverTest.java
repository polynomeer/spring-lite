package lite.spring.web.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import lite.spring.context.ApplicationContext;
import lite.spring.core.validation.ConstraintViolation;
import lite.spring.core.validation.ValidationException;
import lite.spring.web.annotation.ExceptionHandler;
import lite.spring.web.handler.HandlerMethodMatch;
import lite.spring.web.http.HttpMethod;
import lite.spring.web.support.HandlerMethod;
import org.junit.jupiter.api.Test;

class DefaultExceptionResolverTest {
    private final DefaultExceptionResolver resolver = new DefaultExceptionResolver(new NoOpApplicationContext());

    @Test
    void usesControllerExceptionHandlerWhenAvailable() throws Exception {
        ControllerWithHandler controller = new ControllerWithHandler();
        HandlerMethodMatch match = matchFor(controller, "endpoint");

        ExceptionHandlingResult result = resolver.resolve(new CustomException("boom"), match);

        assertThat(result.statusCode()).isEqualTo(400);
        assertThat(result.body()).isEqualTo(Map.of("message", "handled"));
    }

    @Test
    void mapsValidationAndIllegalArgumentExceptions() {
        ValidationException validationException = new ValidationException(List.of(new ConstraintViolation("request.name", "must not be null", null)));

        ExceptionHandlingResult validation = resolver.resolve(validationException, null);
        ExceptionHandlingResult illegalArgument = resolver.resolve(new IllegalArgumentException("bad request"), null);
        ExceptionHandlingResult runtime = resolver.resolve(new RuntimeException("server error"), null);

        assertThat(validation.statusCode()).isEqualTo(400);
        assertThat(validation.body()).isInstanceOf(Map.class);
        Map<?, ?> validationBody = (Map<?, ?>) validation.body();
        assertThat(validationBody.get("error")).isEqualTo("Validation failed");
        assertThat((List<?>) validationBody.get("violations")).hasSize(1);
        Map<?, ?> firstViolation = (Map<?, ?>) ((List<?>) validationBody.get("violations")).getFirst();
        assertThat(firstViolation.get("path")).isEqualTo("request.name");
        assertThat(firstViolation.get("message")).isEqualTo("must not be null");
        assertThat(firstViolation.get("rejectedValue")).isNull();
        assertThat(illegalArgument.statusCode()).isEqualTo(400);
        assertThat(runtime.statusCode()).isEqualTo(500);
    }

    @Test
    void wrapsFailingExceptionHandlerInvocation() throws Exception {
        HandlerMethodMatch match = matchFor(new ControllerWithBrokenHandler(), "endpoint");

        assertThatThrownBy(() -> resolver.resolve(new CustomException("boom"), match))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Failed to invoke exception handler");
    }

    private HandlerMethodMatch matchFor(Object bean, String methodName) throws Exception {
        Method method = bean.getClass().getDeclaredMethod(methodName);
        return new HandlerMethodMatch(
            new HandlerMethod(bean, method, "/test", java.util.regex.Pattern.compile("/test"), HttpMethod.GET, List.of(), List.of(), List.of(), List.of()),
            Map.of()
        );
    }

    static class ControllerWithHandler {
        void endpoint() {
        }

        @ExceptionHandler(CustomException.class)
        Map<String, String> handle(CustomException exception) {
            return Map.of("message", "handled");
        }
    }

    static class ControllerWithBrokenHandler {
        void endpoint() {
        }

        @ExceptionHandler(CustomException.class)
        Map<String, String> handle(CustomException exception) {
            throw new IllegalStateException("broken");
        }
    }

    static class CustomException extends RuntimeException {
        CustomException(String message) {
            super(message);
        }
    }

    static class NoOpApplicationContext implements ApplicationContext {
        @Override
        public <T> T getBean(Class<T> type) {
            throw new UnsupportedOperationException();
        }

        @Override
        public Object getBean(String name) {
            throw new UnsupportedOperationException();
        }

        @Override
        public <T> Map<String, T> getBeansOfType(Class<T> type) {
            return Map.of();
        }

        @Override
        public Map<String, Object> getBeansWithAnnotation(Class<? extends java.lang.annotation.Annotation> annotationType) {
            return Map.of();
        }

        @Override
        public java.util.List<lite.spring.context.BeanRuntimeDescriptor> getBeanRuntimeDescriptors() {
            return java.util.List.of();
        }

        @Override
        public boolean containsBeanOfType(Class<?> type) {
            return false;
        }

        @Override
        public void publishEvent(Object event) {
        }

        @Override
        public void close() {
        }
    }
}
