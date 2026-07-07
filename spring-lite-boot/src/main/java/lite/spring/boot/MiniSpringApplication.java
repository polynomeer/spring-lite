package lite.spring.boot;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import lite.spring.boot.support.ApplicationProperties;
import lite.spring.boot.support.BootInfrastructureRegistrar;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.web.json.JsonMapper;
import lite.spring.web.support.DispatcherServlet;

public final class MiniSpringApplication {
    private MiniSpringApplication() {
    }

    public static AnnotationConfigApplicationContext run(Class<?> applicationClass, String... args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(applicationClass);
        BootInfrastructureRegistrar.registerDefaults(context);
        context.refresh();
        startHttpServerIfPossible(context, context.getBean(JsonMapper.class));
        return context;
    }

    private static void startHttpServerIfPossible(AnnotationConfigApplicationContext context, JsonMapper jsonMapper) {
        try {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, jsonMapper);
            ApplicationProperties properties = ApplicationProperties.load();
            int port = Integer.parseInt(properties.get("server.port", "8080"));
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
            server.createContext("/", dispatcherServlet);
            server.setExecutor(null);
            server.start();
            context.registerSingleton("httpServer", server);
            context.registerSingleton("httpServerShutdown", (AutoCloseable) () -> server.stop(0));
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to start embedded HTTP server", exception);
        }
    }
}
