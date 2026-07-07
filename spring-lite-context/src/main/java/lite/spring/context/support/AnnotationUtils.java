package lite.spring.context.support;

import java.lang.annotation.Annotation;
import java.util.HashSet;
import java.util.Set;

public final class AnnotationUtils {
    private AnnotationUtils() {
    }

    public static boolean hasAnnotation(Class<?> type, Class<? extends Annotation> annotationType) {
        return hasAnnotation(type, annotationType, new HashSet<>());
    }

    public static <A extends Annotation> A findAnnotation(Class<?> type, Class<A> annotationType) {
        return findAnnotation(type, annotationType, new HashSet<>());
    }

    private static boolean hasAnnotation(Class<?> type, Class<? extends Annotation> annotationType, Set<Class<?>> visited) {
        if (!visited.add(type)) {
            return false;
        }
        if (type.isAnnotationPresent(annotationType)) {
            return true;
        }
        for (Annotation annotation : type.getAnnotations()) {
            Class<? extends Annotation> candidate = annotation.annotationType();
            if (candidate.equals(annotationType)) {
                return true;
            }
            if (!candidate.getName().startsWith("java.lang.annotation")
                && hasAnnotation(candidate, annotationType, visited)) {
                return true;
            }
        }
        return false;
    }

    private static <A extends Annotation> A findAnnotation(Class<?> type, Class<A> annotationType, Set<Class<?>> visited) {
        if (!visited.add(type)) {
            return null;
        }
        A direct = type.getAnnotation(annotationType);
        if (direct != null) {
            return direct;
        }
        for (Annotation annotation : type.getAnnotations()) {
            Class<? extends Annotation> candidate = annotation.annotationType();
            if (candidate.getName().startsWith("java.lang.annotation")) {
                continue;
            }
            A nested = findAnnotation(candidate, annotationType, visited);
            if (nested != null) {
                return nested;
            }
        }
        return null;
    }
}
