package lite.spring.context.support;

import java.util.Optional;
import lite.spring.core.annotation.Component;
import lite.spring.core.util.ClassUtils;

public final class BeanNameGenerator {
    private BeanNameGenerator() {
    }

    public static String generateBeanName(Class<?> beanType) {
        return explicitName(beanType).orElseGet(() -> ClassUtils.decapitalize(beanType.getSimpleName()));
    }

    public static String generateBeanName(String methodName) {
        return methodName;
    }

    private static Optional<String> explicitName(Class<?> beanType) {
        Component component = beanType.getAnnotation(Component.class);
        if (component != null && !component.value().isBlank()) {
            return Optional.of(component.value());
        }
        return Optional.empty();
    }
}

