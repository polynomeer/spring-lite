package lite.spring.web.http;

import java.util.LinkedHashMap;
import java.util.Map;

public final class ResponseEntity<T> {
    private final int statusCode;
    private final Map<String, String> headers;
    private final T body;

    private ResponseEntity(int statusCode, Map<String, String> headers, T body) {
        this.statusCode = statusCode;
        this.headers = Map.copyOf(headers);
        this.body = body;
    }

    public static <T> ResponseEntity<T> ok(T body) {
        return status(200).body(body);
    }

    public static HeadersBuilder status(int statusCode) {
        return new HeadersBuilder(statusCode);
    }

    public static ResponseEntity<Void> noContent() {
        return status(204).build();
    }

    public int statusCode() {
        return statusCode;
    }

    public Map<String, String> headers() {
        return headers;
    }

    public T body() {
        return body;
    }

    public static final class HeadersBuilder {
        private final int statusCode;
        private final Map<String, String> headers = new LinkedHashMap<>();

        private HeadersBuilder(int statusCode) {
            this.statusCode = statusCode;
        }

        public HeadersBuilder header(String name, String value) {
            headers.put(name, value);
            return this;
        }

        public <T> ResponseEntity<T> body(T body) {
            return new ResponseEntity<>(statusCode, headers, body);
        }

        public ResponseEntity<Void> build() {
            return new ResponseEntity<>(statusCode, headers, null);
        }
    }
}
