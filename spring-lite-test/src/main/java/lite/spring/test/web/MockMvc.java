package lite.spring.test.web;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpPrincipal;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import lite.spring.context.ApplicationContext;
import lite.spring.web.json.JsonMapper;
import lite.spring.web.support.DispatcherServlet;

public final class MockMvc {
    private final DispatcherServlet dispatcherServlet;

    private MockMvc(DispatcherServlet dispatcherServlet) {
        this.dispatcherServlet = dispatcherServlet;
    }

    public static MockMvc from(ApplicationContext applicationContext) {
        JsonMapper jsonMapper = applicationContext.containsBeanOfType(JsonMapper.class)
            ? applicationContext.getBean(JsonMapper.class)
            : new JsonMapper();
        DispatcherServlet dispatcherServlet = applicationContext.containsBeanOfType(DispatcherServlet.class)
            ? applicationContext.getBean(DispatcherServlet.class)
            : new DispatcherServlet(applicationContext, jsonMapper);
        return new MockMvc(dispatcherServlet);
    }

    public MockHttpResponse perform(MockHttpRequest request) {
        MockHttpExchange exchange = new MockHttpExchange(request);
        try {
            dispatcherServlet.handle(exchange);
        } catch (Exception exception) {
            throw new IllegalStateException("Mock MVC request failed", exception);
        }
        return new MockHttpResponse(exchange.statusCode(), exchange.getResponseHeaders(), exchange.responseBodyAsString());
    }

    public MockHttpResponse get(String path) {
        return perform(MockHttpRequest.get(path).build());
    }

    public MockHttpResponse postJson(String path, String body) {
        return perform(MockHttpRequest.post(path).contentType("application/json").body(body).build());
    }

    static final class MockHttpExchange extends HttpExchange {
        private final Headers requestHeaders = new Headers();
        private final Headers responseHeaders = new Headers();
        private final java.net.URI uri;
        private final String method;
        private final InputStream requestBody;
        private final ByteArrayOutputStream responseBody = new ByteArrayOutputStream();
        private final Map<String, Object> attributes = new LinkedHashMap<>();
        private int statusCode;

        MockHttpExchange(MockHttpRequest request) {
            this.uri = request.uri();
            this.method = request.method();
            this.requestHeaders.putAll(request.headers());
            this.requestBody = new ByteArrayInputStream(request.body().getBytes(StandardCharsets.UTF_8));
        }

        String responseBodyAsString() {
            return responseBody.toString(StandardCharsets.UTF_8);
        }

        int statusCode() {
            return statusCode;
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
        public java.net.URI getRequestURI() {
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
}
