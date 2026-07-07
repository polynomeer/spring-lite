package lite.spring.boot.web;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import lite.spring.web.support.DispatcherServlet;

public final class JdkWebServer implements WebServer {
    private final DispatcherServlet dispatcherServlet;
    private final int port;
    private HttpServer server;

    public JdkWebServer(DispatcherServlet dispatcherServlet, int port) {
        this.dispatcherServlet = dispatcherServlet;
        this.port = port;
    }

    @Override
    public void start() {
        if (server != null) {
            return;
        }
        try {
            HttpServer httpServer = HttpServer.create(new InetSocketAddress(port), 0);
            httpServer.createContext("/", dispatcherServlet);
            httpServer.setExecutor(null);
            httpServer.start();
            this.server = httpServer;
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to start embedded HTTP server", exception);
        }
    }

    @Override
    public int port() {
        return port;
    }

    @Override
    public void close() {
        if (server != null) {
            server.stop(0);
            server = null;
        }
    }
}
