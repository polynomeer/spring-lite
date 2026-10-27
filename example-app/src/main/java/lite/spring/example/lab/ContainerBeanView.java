package lite.spring.example.lab;

import java.util.List;
import lite.spring.context.BeanRuntimeDescriptor;

public record ContainerBeanView(
    String name,
    String typeName,
    String simpleType,
    String definitionKind,
    String scope,
    boolean instantiated,
    boolean proxied,
    List<String> dependencies
) {
    static ContainerBeanView from(BeanRuntimeDescriptor descriptor) {
        String typeName = descriptor.typeName();
        return new ContainerBeanView(
            descriptor.name(),
            typeName,
            typeName.substring(typeName.lastIndexOf('.') + 1),
            descriptor.definitionKind(),
            descriptor.singleton() ? "singleton" : "prototype",
            descriptor.instantiated(),
            descriptor.proxied(),
            descriptor.dependencies()
        );
    }
}
