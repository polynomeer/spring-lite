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
import lite.spring.core.metrics.MetricsRegistry;
import lite.spring.core.trace.TraceEvent;
import lite.spring.core.trace.TraceRecorder;
import lite.spring.web.annotation.ControllerAdvice;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.PutMapping;
import lite.spring.web.annotation.DeleteMapping;
import lite.spring.web.annotation.ExceptionHandler;
import lite.spring.web.annotation.PathVariable;
import lite.spring.web.annotation.PostMapping;
import lite.spring.web.annotation.RequestBody;
import lite.spring.web.annotation.RequestMapping;
import lite.spring.web.annotation.RequestParam;
import lite.spring.web.annotation.ResponseStatus;
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
    void dispatchesPutAndDeleteRequests() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange put = new StubHttpExchange("PUT", URI.create("/greetings/7"), "{\"name\":\"updated\",\"quantity\":1}");
            put.getRequestHeaders().set("Content-Type", "application/json");
            StubHttpExchange delete = new StubHttpExchange("DELETE", URI.create("/greetings/7"), "");

            dispatcherServlet.handle(put);
            dispatcherServlet.handle(delete);

            assertThat(put.statusCode()).isEqualTo(200);
            assertThat(put.responseBodyAsString()).isEqualTo("{\"message\":\"updated 7 to updated\"}");
            assertThat(delete.statusCode()).isEqualTo(200);
            assertThat(delete.responseBodyAsString()).isEqualTo("{\"message\":\"deleted 7\"}");
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
    void recordsRequestStatusAndDurationMetricsForEveryResponsePath() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            MetricsRegistry metrics = new MetricsRegistry();
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper(), new StaticResourceHandler(), metrics);
            dispatcherServlet.handle(new StubHttpExchange("GET", URI.create("/greetings/7?name=codex"), ""));
            dispatcherServlet.handle(new StubHttpExchange("GET", URI.create("/missing"), ""));

            assertThat(metrics.counters()).containsEntry("http.server.requests.GET.200", 1L);
            assertThat(metrics.counters()).containsEntry("http.server.requests.GET.404", 1L);
            assertThat(metrics.timers()).containsKeys("http.server.duration.GET.200", "http.server.duration.GET.404");
        }
    }

    @Test
    void tracesRequestHandlerAndResponseWhenSessionIsOpen() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class);
             TraceRecorder.Session session = TraceRecorder.start()) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            dispatcherServlet.handle(new StubHttpExchange("GET", URI.create("/greetings/7?name=codex"), ""));

            assertThat(session.events())
                .extracting(TraceEvent::kind)
                .containsExactly("request", "handler", "response");
            assertThat(session.events().get(0).attributes()).containsEntry("path", "/greetings/7");
            assertThat(session.events().get(1).stack()).hasSize(2).first().isEqualTo("DispatcherServlet.handle");
            assertThat(session.events().get(2).attributes()).containsEntry("status", "200");
            assertThat(session.events().get(2).stack()).containsExactly("DispatcherServlet.handle");
        }
    }

    @Test
    void servesClasspathStaticResourcesAfterNoControllerMappingMatches() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/hello.txt"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(200);
            assertThat(exchange.responseBodyAsString()).isEqualTo("hello from spring-lite\n");
            assertThat(exchange.getResponseHeaders().getFirst("Content-Type")).isEqualTo("text/plain; charset=utf-8");
            assertThat(exchange.getResponseHeaders().getFirst("Cache-Control")).isEqualTo("public, max-age=3600");
        }
    }

    @Test
    void returnsNotModifiedWhenStaticResourceEtagMatches() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange initial = new StubHttpExchange("GET", URI.create("/hello.txt"), "");
            dispatcherServlet.handle(initial);
            StubHttpExchange conditional = new StubHttpExchange("GET", URI.create("/hello.txt"), "");
            conditional.getRequestHeaders().set("If-None-Match", initial.getResponseHeaders().getFirst("ETag"));

            dispatcherServlet.handle(conditional);

            assertThat(conditional.statusCode()).isEqualTo(304);
            assertThat(conditional.responseBodyAsString()).isEmpty();
            assertThat(conditional.getResponseHeaders().getFirst("ETag")).isEqualTo(initial.getResponseHeaders().getFirst("ETag"));
        }
    }

    @Test
    void servesStaticResourceHeadersWithoutABodyForHeadRequests() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("HEAD", URI.create("/hello.txt"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(200);
            assertThat(exchange.responseBodyAsString()).isEmpty();
            assertThat(exchange.getResponseHeaders().getFirst("ETag")).isNotBlank();
        }
    }

    @Test
    void rejectsTraversalAttemptsBeforeLoadingStaticResources() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/../hello.txt"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(404);
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
    void resolvesStatusDeclaredOnUnhandledExceptionType() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/missing-resource"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(404);
            assertThat(exchange.responseBodyAsString()).contains("resource missing");
        }
    }

    @Test
    void usesExceptionHandlerMethodWhenPresent() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/handled"), "");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(409);
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
    void matchesProducedMediaTypeAgainstAcceptWildcardAndQualityFactor() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/metadata/negotiated"), "");
            exchange.getRequestHeaders().set("Accept", "text/plain;q=0.1, application/*;q=0.8");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(200);
            assertThat(exchange.getResponseHeaders().getFirst("Content-Type")).isEqualTo("application/json");
        }
    }

    @Test
    void rejectsProducedMediaTypeWhenAcceptQualityIsZero() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebTestConfig.class)) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            StubHttpExchange exchange = new StubHttpExchange("GET", URI.create("/greetings/metadata/negotiated"), "");
            exchange.getRequestHeaders().set("Accept", "application/json;q=0");

            dispatcherServlet.handle(exchange);

            assertThat(exchange.statusCode()).isEqualTo(404);
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

        @PutMapping(value = "/{id}", consumes = "application/json")
        public Response update(@PathVariable("id") Long id, @RequestBody Request request) {
            return new Response("updated " + id + " to " + request.name());
        }

        @DeleteMapping("/{id}")
        public Response delete(@PathVariable("id") Long id) {
            return new Response("deleted " + id);
        }

        @GetMapping("/error")
        public Response error() {
            throw new IllegalArgumentException("invalid greeting request");
        }

        @GetMapping("/handled")
        public Response handled() {
            throw new CustomWebException("boom");
        }

        @GetMapping("/missing-resource")
        public Response missingResource() {
            throw new MissingResourceException("resource missing");
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

        @GetMapping(value = "/metadata/negotiated", produces = "application/json")
        public Response negotiated() {
            return new Response("negotiated");
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
        @ResponseStatus(409)
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

            assertThat(exchange.statusCode()).isEqualTo(409);
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

    @ResponseStatus(404)
    static class MissingResourceException extends RuntimeException {
        MissingResourceException(String message) {
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
