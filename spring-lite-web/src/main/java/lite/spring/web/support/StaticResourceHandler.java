package lite.spring.web.support;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLConnection;
import java.util.Map;

/** Serves immutable classpath files after no controller mapping matched a request. */
public final class StaticResourceHandler {
    private static final Map<String, String> CONTENT_TYPES = Map.of(
        "css", "text/css; charset=utf-8",
        "html", "text/html; charset=utf-8",
        "js", "text/javascript; charset=utf-8",
        "json", "application/json; charset=utf-8",
        "svg", "image/svg+xml",
        "txt", "text/plain; charset=utf-8"
    );

    private final ClassLoader classLoader;
    private final String resourceRoot;

    public StaticResourceHandler() {
        this(Thread.currentThread().getContextClassLoader(), "static");
    }

    public StaticResourceHandler(ClassLoader classLoader, String resourceRoot) {
        this.classLoader = classLoader;
        this.resourceRoot = trimSlashes(resourceRoot);
    }

    public boolean handle(HttpExchange exchange) throws IOException {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod()) && !"HEAD".equalsIgnoreCase(exchange.getRequestMethod())) {
            return false;
        }
        String resourcePath = toResourcePath(exchange.getRequestURI().getPath());
        if (resourcePath == null) {
            return false;
        }
        try (InputStream input = classLoader.getResourceAsStream(resourcePath)) {
            if (input == null) {
                return false;
            }
            byte[] body = input.readAllBytes();
            exchange.getResponseHeaders().set("Content-Type", contentType(resourcePath));
            exchange.getResponseHeaders().set("Cache-Control", "public, max-age=3600");
            if ("HEAD".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return true;
            }
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            return true;
        }
    }

    private String toResourcePath(String path) {
        String normalized = path == null || path.isBlank() || "/".equals(path) ? "index.html" : path.substring(1);
        if (normalized.contains("..") || normalized.contains("\\") || normalized.isBlank()) {
            return null;
        }
        return resourceRoot + "/" + normalized;
    }

    private String contentType(String resourcePath) {
        int extensionStart = resourcePath.lastIndexOf('.') + 1;
        String extension = extensionStart == 0 ? "" : resourcePath.substring(extensionStart).toLowerCase();
        String guessed = URLConnection.guessContentTypeFromName(resourcePath);
        return CONTENT_TYPES.getOrDefault(extension, guessed == null ? "application/octet-stream" : guessed);
    }

    private String trimSlashes(String value) {
        String trimmed = value == null ? "static" : value.trim();
        while (trimmed.startsWith("/")) {
            trimmed = trimmed.substring(1);
        }
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed.isBlank() ? "static" : trimmed;
    }
}
