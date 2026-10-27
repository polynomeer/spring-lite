package lite.spring.context;

import java.util.List;

/**
 * Read-only runtime view of a bean definition. Introspection must not create
 * beans, so callers can inspect the container without changing its state.
 *
 * <p>{@code dependencies} lists the beans that satisfied the constructor or {@code @Bean} method
 * parameters, empty until the bean has been created.
 */
public record BeanRuntimeDescriptor(
    String name,
    String typeName,
    String definitionKind,
    boolean singleton,
    boolean instantiated,
    boolean proxied,
    List<String> dependencies
) {
}
