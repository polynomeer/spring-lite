package lite.spring.web.handler;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import lite.spring.web.http.ResponseEntity;
import lite.spring.web.json.JsonMapper;

public class JsonReturnValueHandler implements ReturnValueHandler {
    private final JsonMapper jsonMapper;

    public JsonReturnValueHandler(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
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
        byte[] response = jsonMapper.write(body).getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().putIfAbsent("Content-Type", java.util.List.of("application/json; charset=utf-8"));
        exchange.sendResponseHeaders(responseStatus, response.length);
        try (OutputStream outputStream = exchange.getResponseBody()) {
            outputStream.write(response);
        }
    }
}
