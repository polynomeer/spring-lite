package lite.spring.web.handler;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import lite.spring.web.json.JsonMapper;

public class JsonReturnValueHandler implements ReturnValueHandler {
    private final JsonMapper jsonMapper;

    public JsonReturnValueHandler(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
    }

    @Override
    public void handleReturnValue(Object returnValue, HttpExchange exchange, int statusCode) throws IOException {
        byte[] response = jsonMapper.write(returnValue).getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(statusCode, response.length);
        try (OutputStream outputStream = exchange.getResponseBody()) {
            outputStream.write(response);
        }
    }
}

