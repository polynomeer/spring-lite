package lite.spring.web.handler;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import lite.spring.web.http.ResponseEntity;
import lite.spring.web.json.JsonMapper;

public class JsonReturnValueHandler implements ReturnValueHandler {
    private static final String PRODUCES_ATTRIBUTE = "springLite.produces";
    private final JsonMapper jsonMapper;
    private final List<HttpMessageConverter> messageConverters;

    public JsonReturnValueHandler(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
        this.messageConverters = List.of(new PlainTextMessageConverter(), new JsonMessageConverter(jsonMapper));
    }

    @Override
    public void handleReturnValue(Object returnValue, HttpExchange exchange, int statusCode) throws IOException {
        Object body = returnValue;
        int responseStatus = statusCode;
        if (returnValue instanceof ResponseEntity<?> responseEntity) {
            responseStatus = responseEntity.statusCode();
            responseEntity.headers().forEach((name, value) -> exchange.getResponseHeaders().set(name, value));
            body = responseEntity.body();
        }
        if (body == null) {
            exchange.sendResponseHeaders(responseStatus, 0);
            return;
        }
        Object produces = exchange.getAttribute(PRODUCES_ATTRIBUTE);
        String contentType = produces instanceof String value ? value : "application/json; charset=utf-8";
        Object responseBody = body;
        HttpMessageConverter converter = messageConverters.stream()
            .filter(candidate -> candidate.canWrite(responseBody, contentType))
            .findFirst()
            .orElseGet(() -> new JsonMessageConverter(jsonMapper));
        byte[] response = converter.write(responseBody);
        exchange.getResponseHeaders().putIfAbsent("Content-Type", java.util.List.of(contentType));
        exchange.sendResponseHeaders(responseStatus, response.length);
        try (OutputStream outputStream = exchange.getResponseBody()) {
            outputStream.write(response);
        }
    }
}
