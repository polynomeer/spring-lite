package lite.spring.boot;

import lite.spring.boot.support.BootInfrastructureRegistrar;
import lite.spring.boot.web.WebServer;
import lite.spring.context.support.AnnotationConfigApplicationContext;

public final class MiniSpringApplication {
    private MiniSpringApplication() {
    }

    public static AnnotationConfigApplicationContext run(Class<?> applicationClass, String... args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(applicationClass);
        BootInfrastructureRegistrar.registerDefaults(context);
        context.refresh();
        context.getBean(WebServer.class).start();
        return context;
    }
}
