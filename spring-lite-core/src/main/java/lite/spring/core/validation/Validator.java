package lite.spring.core.validation;

import java.lang.annotation.Annotation;

public interface Validator {
    void validateValue(String path, Object value, Annotation[] annotations);

    void validateObject(String path, Object target);
}
