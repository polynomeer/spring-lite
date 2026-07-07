package lite.spring.boot;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import lite.spring.boot.support.ApplicationProperties;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.web.json.JsonMapper;
import lite.spring.web.support.DispatcherServlet;

public final class MiniSpringApplication {
    private MiniSpringApplication() {
    }

    public static AnnotationConfigApplicationContext run(Class<?> applicationClass, String... args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(applicationClass);
        startHttpServerIfPossible(context);
        return context;
    }

    private static void startHttpServerIfPossible(AnnotationConfigApplicationContext context) {
        try {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            ApplicationProperties properties = ApplicationProperties.load();
            int port = Integer.parseInt(properties.get("server.port", "8080"));
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
            server.createContext("/", dispatcherServlet);
            server.setExecutor(null);
            server.start();
            context.registerSingleton("httpServer", server);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to start embedded HTTP server", exception);
        }
    }
}

