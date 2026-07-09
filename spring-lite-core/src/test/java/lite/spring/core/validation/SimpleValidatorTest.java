package lite.spring.core.validation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class SimpleValidatorTest {
    private final SimpleValidator validator = new SimpleValidator();

    @Test
    void validatesAnnotatedScalarValue() {
        assertThatThrownBy(() -> validator.validateValue("quantity", 0, annotationsFrom(ScalarInput.class, "quantity")))
            .isInstanceOf(ValidationException.class)
            .satisfies(exception -> {
                ValidationException validationException = (ValidationException) exception;
                assertThat(validationException.violations())
                    .containsExactly(new ConstraintViolation("quantity", "must be greater than or equal to 1", 0));
            });
    }

    @Test
    void validatesRecordComponentsRecursively() {
        Request request = new Request(null, 0, new Customer("A"));

        assertThatThrownBy(() -> validator.validateObject("request", request))
            .isInstanceOf(ValidationException.class)
            .satisfies(exception -> {
                ValidationException validationException = (ValidationException) exception;
                assertThat(validationException.violations())
                    .containsExactlyInAnyOrder(
                        new ConstraintViolation("request.product", "must not be null", null),
                        new ConstraintViolation("request.quantity", "must be greater than or equal to 1", 0),
                        new ConstraintViolation("request.customer.name", "size must be between 2 and 20", "A")
                    );
            });
    }

    @Test
    void acceptsValidObjectGraphs() {
        Request request = new Request("book", 2, new Customer("codex"));

        validator.validateObject("request", request);
    }

    private java.lang.annotation.Annotation[] annotationsFrom(Class<?> type, String fieldName) {
        try {
            return type.getDeclaredField(fieldName).getAnnotations();
        } catch (NoSuchFieldException exception) {
            throw new IllegalStateException(exception);
        }
    }

    static class ScalarInput {
        @Min(1)
        private int quantity;
    }

    record Request(@NotNull String product, @Min(1) int quantity, @Valid Customer customer) {
    }

    record Customer(@Size(min = 2, max = 20) String name) {
    }
}
