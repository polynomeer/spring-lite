package lite.spring.web.handler;

import java.nio.charset.StandardCharsets;

public class PlainTextMessageConverter implements HttpMessageConverter {
    @Override public boolean canWrite(Object body, String contentType) { return body instanceof CharSequence && contentType.startsWith("text/plain"); }

    @Override public byte[] write(Object body) { return body.toString().getBytes(StandardCharsets.UTF_8); }
}
