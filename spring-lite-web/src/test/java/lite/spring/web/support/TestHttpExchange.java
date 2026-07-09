package lite.spring.web.support;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpPrincipal;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

public final class TestHttpExchange extends HttpExchange {
    private final Headers requestHeaders = new Headers();
    private final Headers responseHeaders = new Headers();
    private final String method;
    private final URI uri;
    private final InputStream requestBody;
    private final ByteArrayOutputStream responseBody = new ByteArrayOutputStream();
    private final Map<String, Object> attributes = new LinkedHashMap<>();
    private int statusCode;

    public TestHttpExchange(String method, URI uri, String body) {
        this.method = method;
        this.uri = uri;
        this.requestBody = new ByteArrayInputStream(body.getBytes(StandardCharsets.UTF_8));
    }

    public int statusCode() {
        return statusCode;
    }

    public String responseBodyAsString() {
        return responseBody.toString(StandardCharsets.UTF_8);
    }

    @Override
    public Headers getRequestHeaders() {
        return requestHeaders;
    }

    @Override
    public Headers getResponseHeaders() {
        return responseHeaders;
    }

    @Override
    public URI getRequestURI() {
        return uri;
    }

    @Override
    public String getRequestMethod() {
        return method;
    }

    @Override
    public HttpContext getHttpContext() {
        return null;
    }

    @Override
    public void close() {
    }

    @Override
    public InputStream getRequestBody() {
        return requestBody;
    }

    @Override
    public OutputStream getResponseBody() {
        return responseBody;
    }

    @Override
    public void sendResponseHeaders(int rCode, long responseLength) {
        this.statusCode = rCode;
    }

    @Override
    public InetSocketAddress getRemoteAddress() {
        return new InetSocketAddress(0);
    }

    @Override
    public int getResponseCode() {
        return statusCode;
    }

    @Override
    public InetSocketAddress getLocalAddress() {
        return new InetSocketAddress(0);
    }

    @Override
    public String getProtocol() {
        return "HTTP/1.1";
    }

    @Override
    public Object getAttribute(String name) {
        return attributes.get(name);
    }

    @Override
    public void setAttribute(String name, Object value) {
        attributes.put(name, value);
    }

    @Override
    public void setStreams(InputStream i, OutputStream o) {
    }

    @Override
    public HttpPrincipal getPrincipal() {
        return null;
    }
}
