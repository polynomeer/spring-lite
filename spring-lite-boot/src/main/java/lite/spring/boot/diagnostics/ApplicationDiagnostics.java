package lite.spring.boot.diagnostics;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import lite.spring.context.ApplicationContext;
import lite.spring.context.BeanRuntimeDescriptor;

/** Stable, serializable container snapshot for a CLI or management endpoint. */
public final class ApplicationDiagnostics {
    private ApplicationDiagnostics() {
    }

    public static Map<String, Object> report(ApplicationContext context) {
        List<Map<String, Object>> beans = context.getBeanRuntimeDescriptors().stream()
            .sorted(Comparator.comparing(BeanRuntimeDescriptor::name))
            .map(descriptor -> Map.<String, Object>of(
                "name", descriptor.name(),
                "type", descriptor.typeName(),
                "definitionKind", descriptor.definitionKind(),
                "singleton", descriptor.singleton(),
                "instantiated", descriptor.instantiated(),
                "proxied", descriptor.proxied()
            ))
            .toList();
        long proxied = beans.stream().filter(bean -> Boolean.TRUE.equals(bean.get("proxied"))).count();
        return Map.of("beanCount", beans.size(), "proxiedBeanCount", proxied, "beans", beans);
    }
}
