package lite.spring.core.validation;

import java.lang.annotation.Annotation;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.RecordComponent;
import java.util.ArrayList;
import java.util.Collection;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class SimpleValidator implements Validator {
    @Override
    public void validateValue(String path, Object value, Annotation[] annotations) {
        List<ConstraintViolation> violations = new ArrayList<>();
        Set<Object> visited = java.util.Collections.newSetFromMap(new IdentityHashMap<>());
        validateValue(path, value, annotations, violations, visited);
        if (!violations.isEmpty()) {
            throw new ValidationException(violations);
        }
    }

    @Override
    public void validateObject(String path, Object target) {
        List<ConstraintViolation> violations = new ArrayList<>();
        Set<Object> visited = java.util.Collections.newSetFromMap(new IdentityHashMap<>());
        validateObject(path, target, violations, visited);
        if (!violations.isEmpty()) {
            throw new ValidationException(violations);
        }
    }

    private void validateValue(
        String path,
        Object value,
        Annotation[] annotations,
        List<ConstraintViolation> violations,
        Set<Object> visited
    ) {
        boolean cascade = false;
        for (Annotation annotation : annotations) {
            if (annotation instanceof NotNull && value == null) {
                violations.add(new ConstraintViolation(path, "must not be null", null));
            }
            if (annotation instanceof Min min) {
                validateMin(path, value, min, violations);
            }
            if (annotation instanceof Size size) {
                validateSize(path, value, size, violations);
            }
            if (annotation instanceof Valid) {
                cascade = true;
            }
        }
        if (cascade && value != null) {
            validateObject(path, value, violations, visited);
        }
    }

    private void validateObject(String path, Object target, List<ConstraintViolation> violations, Set<Object> visited) {
        if (target == null || isSimpleValue(target.getClass()) || !visited.add(target)) {
            return;
        }
        if (target.getClass().isRecord()) {
            validateRecord(path, target, violations, visited);
            return;
        }
        validateFields(path, target, violations, visited);
    }

    private void validateRecord(String path, Object target, List<ConstraintViolation> violations, Set<Object> visited) {
        for (RecordComponent component : target.getClass().getRecordComponents()) {
            Object value;
            try {
                value = component.getAccessor().invoke(target);
            } catch (ReflectiveOperationException exception) {
                throw new IllegalStateException("Failed to inspect record component " + component.getName(), exception);
            }
            String nestedPath = nestedPath(path, component.getName());
            validateValue(nestedPath, value, component.getAnnotations(), violations, visited);
        }
    }

    private void validateFields(String path, Object target, List<ConstraintViolation> violations, Set<Object> visited) {
        for (Field field : target.getClass().getDeclaredFields()) {
            field.setAccessible(true);
            Object value;
            try {
                value = field.get(target);
            } catch (IllegalAccessException exception) {
                throw new IllegalStateException("Failed to inspect field " + field.getName(), exception);
            }
            String nestedPath = nestedPath(path, field.getName());
            validateValue(nestedPath, value, field.getAnnotations(), violations, visited);
        }
    }

    private void validateMin(String path, Object value, Min min, List<ConstraintViolation> violations) {
        if (value == null) {
            return;
        }
        Long numericValue = extractLong(value);
        if (numericValue == null) {
            violations.add(new ConstraintViolation(path, "must be a numeric value", value));
            return;
        }
        if (numericValue < min.value()) {
            violations.add(new ConstraintViolation(path, "must be greater than or equal to " + min.value(), value));
        }
    }

    private void validateSize(String path, Object value, Size size, List<ConstraintViolation> violations) {
        if (value == null) {
            return;
        }
        Integer actualSize = extractSize(value);
        if (actualSize == null) {
            violations.add(new ConstraintViolation(path, "does not support size validation", value));
            return;
        }
        if (actualSize < size.min() || actualSize > size.max()) {
            violations.add(
                new ConstraintViolation(
                    path,
                    "size must be between " + size.min() + " and " + size.max(),
                    value
                )
            );
        }
    }

    private Long extractLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String string) {
            try {
                return Long.parseLong(string);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private Integer extractSize(Object value) {
        if (value instanceof CharSequence sequence) {
            return sequence.length();
        }
        if (value instanceof Collection<?> collection) {
            return collection.size();
        }
        if (value instanceof Map<?, ?> map) {
            return map.size();
        }
        if (value.getClass().isArray()) {
            return Array.getLength(value);
        }
        return null;
    }

    private boolean isSimpleValue(Class<?> type) {
        return type.isPrimitive()
            || Number.class.isAssignableFrom(type)
            || CharSequence.class.isAssignableFrom(type)
            || Boolean.class.equals(type)
            || Enum.class.isAssignableFrom(type);
    }

    private String nestedPath(String path, String name) {
        return path == null || path.isBlank() ? name : path + "." + name;
    }
}
