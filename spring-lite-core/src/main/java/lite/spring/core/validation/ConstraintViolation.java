package lite.spring.core.validation;

public record ConstraintViolation(String path, String message, Object rejectedValue) {
}
