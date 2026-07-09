package lite.spring.test.web;

import com.sun.net.httpserver.Headers;
import java.net.URI;

public final class MockHttpRequest {
    private final String method;
    private final URI uri;
    private final Headers headers;
    private final String body;

    private MockHttpRequest(String method, URI uri, Headers headers, String body) {
        this.method = method;
        this.uri = uri;
        this.headers = headers;
        this.body = body;
    }

    public static Builder get(String path) {
        return new Builder("GET", path);
    }

    public static Builder post(String path) {
        return new Builder("POST", path);
    }

    String method() {
        return method;
    }

    URI uri() {
        return uri;
    }

    Headers headers() {
        return headers;
    }

    String body() {
        return body;
    }

    public static final class Builder {
        private final String method;
        private final String path;
        private final Headers headers = new Headers();
        private String body = "";

        private Builder(String method, String path) {
            this.method = method;
            this.path = path;
        }

        public Builder header(String name, String value) {
            headers.set(name, value);
            return this;
        }

        public Builder contentType(String contentType) {
            return header("Content-Type", contentType);
        }

        public Builder accept(String mediaType) {
            return header("Accept", mediaType);
        }

        public Builder body(String body) {
            this.body = body;
            return this;
        }

        public MockHttpRequest build() {
            return new MockHttpRequest(method, URI.create(path), headers, body);
        }
    }
}
