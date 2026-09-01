package lite.spring.web.support;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.Map;
import lite.spring.context.ApplicationContext;
import lite.spring.core.validation.SimpleValidator;
import lite.spring.core.validation.Validator;
import lite.spring.core.metrics.MetricsRegistry;
import lite.spring.web.bind.HandlerMethodArgumentResolver;
import lite.spring.web.bind.HttpExchangeArgumentResolver;
import lite.spring.web.bind.PathVariableArgumentResolver;
import lite.spring.web.bind.RequestBodyArgumentResolver;
import lite.spring.web.bind.RequestParamArgumentResolver;
import lite.spring.web.bind.TypeConverter;
import lite.spring.web.exception.DefaultExceptionResolver;
import lite.spring.web.exception.ExceptionHandlingResult;
import lite.spring.web.exception.ExceptionResolver;
import lite.spring.web.handler.HandlerAdapter;
import lite.spring.web.handler.HandlerMapping;
import lite.spring.web.handler.HandlerMethodMatch;
import lite.spring.web.handler.JsonReturnValueHandler;
import lite.spring.web.handler.RequestMappingHandlerAdapter;
import lite.spring.web.handler.RequestMappingHandlerMapping;
import lite.spring.web.handler.ReturnValueHandler;
import lite.spring.web.json.JsonMapper;

public class DispatcherServlet implements HttpHandler {
    private final HandlerMapping handlerMapping;
    private final HandlerAdapter handlerAdapter;
    private final ReturnValueHandler returnValueHandler;
    private final ExceptionResolver exceptionResolver;
    private final StaticResourceHandler staticResourceHandler;
    private final MetricsRegistry metrics;

    public DispatcherServlet(ApplicationContext applicationContext, JsonMapper jsonMapper) {
        this(applicationContext, jsonMapper, new StaticResourceHandler(), new MetricsRegistry());
    }

    public DispatcherServlet(
        ApplicationContext applicationContext,
        JsonMapper jsonMapper,
        StaticResourceHandler staticResourceHandler,
        MetricsRegistry metrics
    ) {
        TypeConverter typeConverter = new TypeConverter();
        Validator validator = new SimpleValidator();
        this.handlerMapping = new RequestMappingHandlerMapping(applicationContext);
        this.handlerAdapter = new RequestMappingHandlerAdapter(
            java.util.List.<HandlerMethodArgumentResolver>of(
                new PathVariableArgumentResolver(typeConverter),
                new RequestParamArgumentResolver(typeConverter),
                new RequestBodyArgumentResolver(jsonMapper, typeConverter),
                new HttpExchangeArgumentResolver()
            ),
            validator
        );
        this.returnValueHandler = new JsonReturnValueHandler(jsonMapper);
        this.exceptionResolver = new DefaultExceptionResolver(applicationContext);
        this.staticResourceHandler = staticResourceHandler;
        this.metrics = metrics;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        HandlerMethodMatch handlerMethodMatch = null;
        long started = System.nanoTime();
        try {
            handlerMethodMatch = handlerMapping.getHandler(exchange);
            if (handlerMethodMatch == null) {
                if (staticResourceHandler.handle(exchange)) {
                    return;
                }
                returnValueHandler.handleReturnValue(Map.of("error", "Not Found"), exchange, 404);
                return;
            }
            Object result = handlerAdapter.handle(handlerMethodMatch, exchange);
            returnValueHandler.handleReturnValue(result, exchange, 200);
        } catch (Exception exception) {
            ExceptionHandlingResult resolved = exceptionResolver.resolve(exception, handlerMethodMatch);
            returnValueHandler.handleReturnValue(resolved.body(), exchange, resolved.statusCode());
        } finally {
            int status = exchange.getResponseCode();
            metrics.increment("http.server.requests." + exchange.getRequestMethod() + "." + status);
            metrics.recordNanos("http.server.duration." + exchange.getRequestMethod() + "." + status, System.nanoTime() - started);
            exchange.close();
        }
    }

    public record ServerBinding(InetSocketAddress address, DispatcherServlet dispatcherServlet) {
    }
}
