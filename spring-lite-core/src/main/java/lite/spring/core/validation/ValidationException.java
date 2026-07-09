package lite.spring.core.validation;

import java.util.List;

public class ValidationException extends RuntimeException {
    private final List<ConstraintViolation> violations;

    public ValidationException(List<ConstraintViolation> violations) {
        super("Validation failed");
        this.violations = List.copyOf(violations);
    }

    public List<ConstraintViolation> violations() {
        return violations;
    }
}
