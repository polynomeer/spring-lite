package lite.spring.web.support;

import static org.assertj.core.api.Assertions.assertThat;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpPrincipal;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.validation.Min;
import lite.spring.core.validation.NotNull;
import lite.spring.core.validation.Size;
import lite.spring.core.validation.Valid;
import lite.spring.web.annotation.ControllerAdvice;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.ExceptionHandler;
import lite.spring.web.annotation.PathVariable;
import lite.spring.web.annotation.PostMapping;
import lite.spring.web.annotation.RequestBody;
import lite.spring.web.annotation.RequestMapping;
import lite.spring.web.annotation.RequestParam;
import lite.spring.web.annotation.RestController;
import lite.spring.web.http.ResponseEntity;
import lite.spring.web.json.JsonMapper;
import org.junit.jupiter.api.Test;

class DispatcherServletTest {
    @Test
    void dispatchesGetRequestsWithPathVariablesAndQueryParams() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/7?name=codex"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).withFailMessage(exchange.responseBodyAsString()).isEqualTo(200);
            assertThat(exchange.responseBodyAsString()).isEqualTo("{\"message\":\"hello codex #7\"}");
        }
    }

    @Test
    void dispatchesPostRequestsWithRecordBodyBinding() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("POST", URI.create("/greetings"), "{\"name\":\"spring-lite\",\"quantity\":2}");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).withFailMessage(exchange.responseBodyAsString()).isEqualTo(200);
            assertThat(exchange.responseBodyAsString()).isEqualTo("{\"message\":\"created spring-lite x2\"}");
        }
    }

    @Test
    void returns404WhenNoHandlerMatches() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/missing"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(404);
            assertThat(exchange.responseBodyAsString()).contains("Not Found");
        }
    }

    @Test
    void mapsIllegalArgumentExceptionTo400() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/error"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(400);
            assertThat(exchange.responseBodyAsString()).contains("invalid greeting request");
        }
    }

    @Test
    void usesExceptionHandlerMethodWhenPresent() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/handled"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(400);
            assertThat(exchange.responseBodyAsString()).isEqualTo("{\"message\":\"handled by controller\"}");
        }
    }

    @Test
    void supportsResponseEntityStatusHeadersAndBody() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/response-entity"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(201);
            assertThat(exchange.getResponseHeaders().getFirst("X-Trace-Id")).isEqualTo("trace-123");
            assertThat(exchange.responseBodyAsString()).isEqualTo("{\"message\":\"created via response entity\"}");
        }
    }

    @Test
    void supportsEmptyResponseEntityBody() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/no-content"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(204);
            assertThat(exchange.responseBodyAsString()).isEmpty();
        }
    }

    @Test
    void selectsHandlerByRequestParamCondition() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/conditional?mode=summary"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(200);
            assertThat(exchange.responseBodyAsString()).isEqualTo("{\"message\":\"summary\"}");
        }
    }

    @Test
    void selectsHandlerByDecodedRequestParamCondition() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/conditional/encoded?name=spring%20lite"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(200);
            assertThat(exchange.responseBodyAsString()).isEqualTo("{\"message\":\"decoded\"}");
        }
    }

    @Test
    void selectsHandlerByHeaderCondition() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/header-check"), "");
            exchange.getRequestHeaders().set("X-Mode", "debug");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(200);
            assertThat(exchange.responseBodyAsString()).isEqualTo("{\"message\":\"header\"}");
        }
    }

    @Test
    void selectsHandlerByConsumesCondition() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("POST", URI.create("/greetings/typed"), "{\"name\":\"typed\",\"quantity\":1}");
            exchange.getRequestHeaders().set("Content-Type", "application/vnd.demo+json");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(200);
            assertThat(exchange.responseBodyAsString()).isEqualTo("{\"message\":\"typed\"}");
        }
    }

    @Test
    void selectsHandlerByProducesConditionAndAppliesResponseContentType() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/produces"), "");
            exchange.getRequestHeaders().set("Accept", "application/vnd.demo+json");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(200);
            assertThat(exchange.getResponseHeaders().getFirst("Content-Type")).isEqualTo("application/vnd.demo+json");
            assertThat(exchange.responseBodyAsString()).isEqualTo("{\"message\":\"produced\"}");
        }
    }

    @Test
    void returnsNotFoundWhenRequestConditionsDoNotMatch() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("POST", URI.create("/greetings/typed"), "{\"name\":\"typed\",\"quantity\":1}");
            exchange.getRequestHeaders().set("Content-Type", "application/json");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(404);
        }
    }

    @Test
    void validatesRequestBodyRecordsWhenAnnotatedWithValid() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("POST", URI.create("/greetings/validated"), "{\"name\":\"x\",\"quantity\":0}");
            exchange.getRequestHeaders().set("Content-Type", "application/json");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(400);
            assertThat(exchange.responseBodyAsString()).contains("\"error\":\"Validation failed\"");
            assertThat(exchange.responseBodyAsString()).contains("\"path\":\"request.name\"");
            assertThat(exchange.responseBodyAsString()).contains("\"path\":\"request.quantity\"");
        }
    }

    @Test
    void validatesRequestParameters() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/validate-param?count=0"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(400);
            assertThat(exchange.responseBodyAsString()).contains("\"path\":\"count\"");
            assertThat(exchange.responseBodyAsString()).contains("greater than or equal to 1");
        }
    }

    @Test
    void acceptsValidatedRequestsWhenConstraintsPass() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("POST", URI.create("/greetings/validated"), "{\"name\":\"valid-name\",\"quantity\":2}");
            exchange.getRequestHeaders().set("Content-Type", "application/json");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(200);
            assertThat(exchange.responseBodyAsString()).isEqualTo("{\"message\":\"validated valid-name x2\"}");
        }
    }

    @Configuration
    static class WebTestConfig {
        @Bean
        GreetingController greetingController() {
            return new GreetingController();
        }

        @Bean
        GlobalGreetingAdvice globalGreetingAdvice() {
            return new GlobalGreetingAdvice();
        }
    }

    @RestController
    @RequestMapping("/greetings")
    public static class GreetingController {
        @GetMapping("/{id}")
        public Response get(@PathVariable("id") Long id, @RequestParam("name") String name) {
            return new Response("hello " + name + " #" + id);
        }

        @PostMapping
        public Response create(@RequestBody Request request) {
            return new Response("created " + request.name() + " x" + request.quantity());
        }

        @GetMapping("/error")
        public Response error() {
            throw new IllegalArgumentException("invalid greeting request");
        }

        @GetMapping("/handled")
        public Response handled() {
            throw new CustomWebException("boom");
        }

        @GetMapping("/global")
        public Response global() {
            throw new IllegalStateException("global failure");
        }

        @GetMapping("/response-entity")
        public ResponseEntity<Response> responseEntity() {
            return ResponseEntity.status(201)
                .header("X-Trace-Id", "trace-123")
                .body(new Response("created via response entity"));
        }

        @GetMapping("/no-content")
        public ResponseEntity<Void> noContent() {
            return ResponseEntity.noContent();
        }

        @GetMapping(value = "/conditional", params = "mode=summary")
        public Response conditionalByParam() {
            return new Response("summary");
        }

        @GetMapping(value = "/conditional/encoded", params = "name=spring lite")
        public Response conditionalByDecodedParam() {
            return new Response("decoded");
        }

        @GetMapping(value = "/header-check", headers = "X-Mode=debug")
        public Response conditionalByHeader() {
            return new Response("header");
        }

        @PostMapping(value = "/typed", consumes = "application/vnd.demo+json")
        public Response conditionalByConsumes(@RequestBody Request request) {
            return new Response(request.name());
        }

        @GetMapping(value = "/produces", produces = "application/vnd.demo+json")
        public Response conditionalByProduces() {
            return new Response("produced");
        }

        @PostMapping("/validated")
        public Response validated(@Valid @RequestBody ValidatedRequest request) {
            return new Response("validated " + request.name() + " x" + request.quantity());
        }

        @GetMapping("/validate-param")
        public Response validateParam(@RequestParam("count") @Min(1) int count) {
            return new Response("count " + count);
        }

        @ExceptionHandler(CustomWebException.class)
        public Response handleCustom(CustomWebException exception) {
            return new Response("handled by controller");
        }
    }

    @ControllerAdvice
    public static class GlobalGreetingAdvice {
        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<Response> handleIllegalState(IllegalStateException exception) {
            return ResponseEntity.status(422)
                .header("X-Advice", "global")
                .body(new Response("handled globally: " + exception.getMessage()));
        }

        @ExceptionHandler(CustomWebException.class)
        public Response handleCustom(CustomWebException exception) {
            return new Response("handled by advice");
        }
    }

    @Test
    void usesGlobalControllerAdviceWhenControllerDoesNotHandleException() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/global"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(422);
            assertThat(exchange.getResponseHeaders().getFirst("X-Advice")).isEqualTo("global");
            assertThat(exchange.responseBodyAsString()).isEqualTo("{\"message\":\"handled globally: global failure\"}");
        }
    }

    @Test
    void prefersControllerLocalExceptionHandlerOverGlobalAdvice() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/handled"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(400);
            assertThat(exchange.responseBodyAsString()).isEqualTo("{\"message\":\"handled by controller\"}");
        }
    }

    public record Request(String name, int quantity) {
    }

    public record Response(String message) {
    }

    public record ValidatedRequest(@NotNull @Size(min = 2, max = 20) String name, @Min(1) int quantity) {
    }

    static class CustomWebException extends RuntimeException {
        CustomWebException(String message) {
            super(message);
        }
    }

    static final class StubHttpExchange extends HttpExchange {
        private final Headers requestHeaders = new Headers();
        private final Headers responseHeaders = new Headers();
        private final String method;
        private final URI uri;
        private final InputStream requestBody;
        private final ByteArrayOutputStream responseBody = new ByteArrayOutputStream();
        private final Map<String, Object> attributes = new LinkedHashMap<>();
        private int statusCode;

        StubHttpExchange(String method, URI uri, String body) {
            this.method = method;
            this.uri = uri;
            this.requestBody = new ByteArrayInputStream(body.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }

        int statusCode() {
            return statusCode;
        }

        String responseBodyAsString() {
            return responseBody.toString(java.nio.charset.StandardCharsets.UTF_8);
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
        public URI getRequestURI() {
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
