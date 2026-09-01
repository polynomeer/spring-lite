package lite.spring.context;

/**
 * Read-only runtime view of a bean definition. Introspection must not create
 * beans, so callers can inspect the container without changing its state.
 */
public record BeanRuntimeDescriptor(
    String name,
    String typeName,
    String definitionKind,
    boolean singleton,
    boolean instantiated,
    boolean proxied
) {
}
