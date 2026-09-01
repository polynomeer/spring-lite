package lite.spring.boot;

import lite.spring.boot.support.BootInfrastructureRegistrar;
import lite.spring.boot.support.ApplicationProperties;
import lite.spring.boot.web.WebServer;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.util.PropertyResolver;
import java.util.LinkedHashMap;
import java.util.Map;

public final class SpringLiteApplication {
    private SpringLiteApplication() {
    }

    public static AnnotationConfigApplicationContext run(Class<?> applicationClass, String... args) {
        AnnotationConfigApplicationContext context = bootstrap(applicationClass, args);
        context.getBean(WebServer.class).start();
        return context;
    }

    /** Creates a fully configured context without starting the embedded web server. */
    public static AnnotationConfigApplicationContext bootstrap(Class<?> applicationClass, String... args) {
        return PropertyResolver.withOverrides(parseCommandLineArgs(args), () -> {
            AnnotationConfigApplicationContext createdContext = new AnnotationConfigApplicationContext();
            createdContext.register(applicationClass);
            createdContext.registerSingleton("commandLineApplicationProperties", ApplicationProperties.from(PropertyResolver.loadApplicationProperties()));
            BootInfrastructureRegistrar.registerDefaults(createdContext);
            createdContext.refresh();
            return createdContext;
        });
    }

    private static Map<String, String> parseCommandLineArgs(String[] args) {
        Map<String, String> properties = new LinkedHashMap<>();
        for (String arg : args) {
            if (arg == null || !arg.startsWith("--")) {
                continue;
            }
            int separatorIndex = arg.indexOf('=');
            if (separatorIndex < 3) {
                continue;
            }
            String key = arg.substring(2, separatorIndex);
            String value = arg.substring(separatorIndex + 1);
            properties.put(key, value);
        }
        return properties;
    }

}
