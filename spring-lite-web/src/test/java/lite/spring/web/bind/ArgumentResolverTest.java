package lite.spring.web.bind;

import static org.assertj.core.api.Assertions.assertThat;

import com.sun.net.httpserver.HttpExchange;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.net.URI;
import java.util.Map;
import lite.spring.web.annotation.PathVariable;
import lite.spring.web.annotation.RequestBody;
import lite.spring.web.annotation.RequestParam;
import lite.spring.web.handler.HandlerMethodMatch;
import lite.spring.web.json.JsonMapper;
import lite.spring.web.support.HandlerMethod;
import lite.spring.web.support.TestHttpExchange;
import org.junit.jupiter.api.Test;

class ArgumentResolverTest {
    private final TypeConverter typeConverter = new TypeConverter();

    @Test
    void convertsSupportedScalarTypes() {
        assertThat(typeConverter.convert("12", int.class)).isEqualTo(12);
        assertThat(typeConverter.convert("3.8", long.class)).isEqualTo(3L);
        assertThat(typeConverter.convert("true", boolean.class)).isEqualTo(true);
        assertThat(typeConverter.convert("text", String.class)).isEqualTo("text");
        assertThat(typeConverter.convert("raw", Object.class)).isEqualTo("raw");
        assertThat(typeConverter.convert(null, Integer.class)).isNull();
    }

    @Test
    void resolvesRequestParamsAndPathVariables() throws Exception {
        RequestParamArgumentResolver requestParamResolver = new RequestParamArgumentResolver(typeConverter);
        PathVariableArgumentResolver pathVariableArgumentResolver = new PathVariableArgumentResolver(typeConverter);
        HandlerMethodMatch match = handlerMatch();
        TestHttpExchange exchange = new TestHttpExchange("GET", URI.create("/orders/7?count=5&name=spring%20lite"), "");
        Parameter requestParam = method("params").getParameters()[0];
        Parameter requestStringParam = method("params").getParameters()[1];
        Parameter pathVariable = method("path").getParameters()[0];

        assertThat(requestParamResolver.supportsParameter(requestParam)).isTrue();
        assertThat(requestParamResolver.resolveArgument(requestParam, match, exchange)).isEqualTo(5);
        assertThat(requestParamResolver.resolveArgument(requestStringParam, match, exchange)).isEqualTo("spring lite");
        assertThat(pathVariableArgumentResolver.supportsParameter(pathVariable)).isTrue();
        assertThat(pathVariableArgumentResolver.resolveArgument(pathVariable, match, exchange)).isEqualTo(7L);
    }

    @Test
    void resolvesRequestBodiesAsStringMapAndRecord() throws Exception {
        RequestBodyArgumentResolver resolver = new RequestBodyArgumentResolver(new JsonMapper(), typeConverter);
        Parameter stringParameter = method("bodyString").getParameters()[0];
        Parameter mapParameter = method("bodyMap").getParameters()[0];
        Parameter recordParameter = method("bodyRecord").getParameters()[0];
        TestHttpExchange stringExchange = new TestHttpExchange("POST", URI.create("/"), "raw-body");
        TestHttpExchange mapExchange = new TestHttpExchange("POST", URI.create("/"), "{\"name\":\"codex\"}");
        TestHttpExchange recordExchange = new TestHttpExchange("POST", URI.create("/"), "{\"name\":\"codex\",\"quantity\":2}");

        assertThat(resolver.supportsParameter(stringParameter)).isTrue();
        assertThat(resolver.resolveArgument(stringParameter, handlerMatch(), stringExchange)).isEqualTo("raw-body");
        assertThat(resolver.resolveArgument(mapParameter, handlerMatch(), mapExchange)).isEqualTo(Map.of("name", "codex"));
        assertThat(resolver.resolveArgument(recordParameter, handlerMatch(), recordExchange)).isEqualTo(new Request("codex", 2));
    }

    @Test
    void resolvesHttpExchangeParametersDirectly() throws Exception {
        HttpExchangeArgumentResolver resolver = new HttpExchangeArgumentResolver();
        Parameter parameter = method("exchange").getParameters()[0];
        TestHttpExchange exchange = new TestHttpExchange("GET", URI.create("/"), "");

        assertThat(resolver.supportsParameter(parameter)).isTrue();
        assertThat(resolver.resolveArgument(parameter, handlerMatch(), exchange)).isSameAs(exchange);
    }

    private Method method(String name) throws NoSuchMethodException {
        return SampleController.class.getDeclaredMethod(name, switch (name) {
            case "params" -> new Class<?>[]{int.class, String.class};
            case "path" -> new Class<?>[]{Long.class};
            case "bodyString" -> new Class<?>[]{String.class};
            case "bodyMap" -> new Class<?>[]{Map.class};
            case "bodyRecord" -> new Class<?>[]{Request.class};
            default -> new Class<?>[]{HttpExchange.class};
        });
    }

    private HandlerMethodMatch handlerMatch() throws NoSuchMethodException {
        Method method = SampleController.class.getDeclaredMethod("path", Long.class);
        HandlerMethod handlerMethod = new HandlerMethod(new SampleController(), method, "/orders/{id}", java.util.regex.Pattern.compile("/orders/(?<id>[^/]+)"), lite.spring.web.http.HttpMethod.GET, java.util.List.of(), java.util.List.of(), java.util.List.of(), java.util.List.of());
        return new HandlerMethodMatch(handlerMethod, Map.of("id", "7"));
    }

    static class SampleController {
        void params(@RequestParam("count") int count, @RequestParam("name") String name) {
        }

        void path(@PathVariable("id") Long id) {
        }

        void bodyString(@RequestBody String body) {
        }

        void bodyMap(@RequestBody Map<String, Object> body) {
        }

        void bodyRecord(@RequestBody Request request) {
        }

        void exchange(HttpExchange exchange) {
        }
    }

    record Request(String name, int quantity) {
    }
}
