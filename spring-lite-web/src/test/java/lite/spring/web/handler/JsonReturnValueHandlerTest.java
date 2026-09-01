package lite.spring.web.handler;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import lite.spring.web.http.ResponseEntity;
import lite.spring.web.json.JsonMapper;
import lite.spring.web.support.TestHttpExchange;
import org.junit.jupiter.api.Test;

class JsonReturnValueHandlerTest {
    private final JsonReturnValueHandler handler = new JsonReturnValueHandler(new JsonMapper());

    @Test
    void writesJsonWithDefaultContentType() throws Exception {
        TestHttpExchange exchange = new TestHttpExchange("GET", URI.create("/"), "");

        handler.handleReturnValue(java.util.Map.of("message", "ok"), exchange, 200);

        assertThat(exchange.statusCode()).isEqualTo(200);
        assertThat(exchange.getResponseHeaders().getFirst("Content-Type")).isEqualTo("application/json; charset=utf-8");
        assertThat(exchange.responseBodyAsString()).isEqualTo("{\"message\":\"ok\"}");
    }

    @Test
    void appliesResponseEntityStatusHeadersAndCustomProduces() throws Exception {
        TestHttpExchange exchange = new TestHttpExchange("GET", URI.create("/"), "");
        exchange.setAttribute("springLite.produces", "application/vnd.demo+json");

        handler.handleReturnValue(ResponseEntity.status(201).header("X-Trace", "abc").body(java.util.Map.of("message", "created")), exchange, 200);

        assertThat(exchange.statusCode()).isEqualTo(201);
        assertThat(exchange.getResponseHeaders().getFirst("X-Trace")).isEqualTo("abc");
        assertThat(exchange.getResponseHeaders().getFirst("Content-Type")).isEqualTo("application/vnd.demo+json");
    }

    @Test
    void handlesNullBodiesWithoutWritingPayload() throws Exception {
        TestHttpExchange exchange = new TestHttpExchange("GET", URI.create("/"), "");

        handler.handleReturnValue(ResponseEntity.noContent(), exchange, 200);

        assertThat(exchange.statusCode()).isEqualTo(204);
        assertThat(exchange.responseBodyAsString()).isEmpty();
    }

    @Test
    void writesStringBodyAsPlainTextWhenProducesRequestsIt() throws Exception {
        TestHttpExchange exchange = new TestHttpExchange("GET", URI.create("/"), "");
        exchange.setAttribute("springLite.produces", "text/plain; charset=utf-8");

        handler.handleReturnValue("ready", exchange, 200);

        assertThat(exchange.getResponseHeaders().getFirst("Content-Type")).isEqualTo("text/plain; charset=utf-8");
        assertThat(exchange.responseBodyAsString()).isEqualTo("ready");
    }
}
