package lite.spring.web.handler;

import java.nio.charset.StandardCharsets;
import lite.spring.web.json.JsonMapper;

public class JsonMessageConverter implements HttpMessageConverter {
    private final JsonMapper jsonMapper;

    public JsonMessageConverter(JsonMapper jsonMapper) { this.jsonMapper = jsonMapper; }

    @Override public boolean canWrite(Object body, String contentType) { return contentType.startsWith("application/json") || contentType.contains("+json"); }

    @Override public byte[] write(Object body) { return jsonMapper.write(body).getBytes(StandardCharsets.UTF_8); }
}
