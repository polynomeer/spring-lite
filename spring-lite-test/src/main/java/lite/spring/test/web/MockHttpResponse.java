package lite.spring.test.web;

import com.sun.net.httpserver.Headers;

public record MockHttpResponse(int statusCode, Headers headers, String body) {
    public String header(String name) {
        return headers.getFirst(name);
    }
}
