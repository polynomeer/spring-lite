package lite.spring.boot.support;

import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.boot.support.autoconfigure.AopAutoConfiguration;
import lite.spring.boot.support.autoconfigure.JdbcAutoConfiguration;
import lite.spring.boot.support.autoconfigure.JsonAutoConfiguration;
import lite.spring.boot.support.autoconfigure.TransactionAutoConfiguration;
import lite.spring.boot.support.autoconfigure.WebAutoConfiguration;

public final class BootInfrastructureRegistrar {
    private BootInfrastructureRegistrar() {
    }

    public static void registerDefaults(AnnotationConfigApplicationContext context) {
        context.register(
            JsonAutoConfiguration.class,
            AopAutoConfiguration.class,
            TransactionAutoConfiguration.class,
            JdbcAutoConfiguration.class,
            WebAutoConfiguration.class
        );
    }
}
