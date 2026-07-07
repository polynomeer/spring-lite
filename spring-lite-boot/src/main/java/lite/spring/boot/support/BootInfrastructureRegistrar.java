package lite.spring.boot.support;

import lite.spring.context.support.AnnotationConfigApplicationContext;

public final class BootInfrastructureRegistrar {
    private BootInfrastructureRegistrar() {
    }

    public static void registerDefaults(AnnotationConfigApplicationContext context) {
        context.register(BootInfrastructureConfiguration.class);
    }
}
