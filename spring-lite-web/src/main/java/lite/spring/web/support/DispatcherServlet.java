package lite.spring.web.support;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lite.spring.context.ApplicationContext;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.PathVariable;
import lite.spring.web.annotation.PostMapping;
import lite.spring.web.annotation.RequestBody;
import lite.spring.web.annotation.RequestMapping;
import lite.spring.web.annotation.RequestParam;
import lite.spring.web.annotation.RestController;
import lite.spring.web.http.HttpMethod;
import lite.spring.web.json.JsonMapper;

public class DispatcherServlet implements HttpHandler {
    private final List<HandlerMethod> handlers;
    private final JsonMapper jsonMapper;

    public DispatcherServlet(ApplicationContext applicationContext, JsonMapper jsonMapper) {
        this.handlers = discoverHandlers(applicationContext);
        this.jsonMapper = jsonMapper;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            HandlerExecution execution = findHandler(exchange.getRequestMethod(), exchange.getRequestURI().getPath());
            if (execution == null) {
                write(exchange, 404, Map.of("error", "Not Found"));
                return;
            }
            Object result = execution.handlerMethod().method().invoke(
                execution.handlerMethod().bean(),
                resolveArguments(execution, exchange)
            );
            write(exchange, 200, result);
        } catch (Exception exception) {
            write(exchange, 500, Map.of("error", exception.getMessage()));
        } finally {
            exchange.close();
        }
    }

    private List<HandlerMethod> discoverHandlers(ApplicationContext applicationContext) {
        Map<String, Object> candidates = applicationContext.getBeansOfType(Object.class);
        List<HandlerMethod> discovered = new ArrayList<>();
        for (Object bean : candidates.values()) {
            if (!bean.getClass().isAnnotationPresent(RestController.class)) {
                continue;
            }
            String classPath = bean.getClass().isAnnotationPresent(RequestMapping.class)
                ? bean.getClass().getAnnotation(RequestMapping.class).value()
                : "";
            for (Method method : bean.getClass().getDeclaredMethods()) {
                if (method.isAnnotationPresent(GetMapping.class)) {
                    discovered.add(newHandler(bean, method, HttpMethod.GET, classPath, method.getAnnotation(GetMapping.class).value()));
                } else if (method.isAnnotationPresent(PostMapping.class)) {
                    discovered.add(newHandler(bean, method, HttpMethod.POST, classPath, method.getAnnotation(PostMapping.class).value()));
                }
            }
        }
        return discovered;
    }

    private HandlerMethod newHandler(Object bean, Method method, HttpMethod httpMethod, String classPath, String methodPath) {
        String pathPattern = normalizePath(classPath + "/" + methodPath);
        Pattern regex = Pattern.compile(pathPattern.replaceAll("\\{([^/]+)}", "(?<$1>[^/]+)"));
        return new HandlerMethod(bean, method, pathPattern, regex, httpMethod);
    }

    private HandlerExecution findHandler(String requestMethod, String requestPath) {
        for (HandlerMethod handler : handlers) {
            if (!handler.httpMethod().name().equalsIgnoreCase(requestMethod)) {
                continue;
            }
            Matcher matcher = handler.regex().matcher(normalizePath(requestPath));
            if (matcher.matches()) {
                Map<String, String> pathVariables = new LinkedHashMap<>();
                Matcher templateMatcher = Pattern.compile("\\{([^/]+)}").matcher(handler.pathPattern());
                while (templateMatcher.find()) {
                    String name = templateMatcher.group(1);
                    pathVariables.put(name, matcher.group(name));
                }
                return new HandlerExecution(handler, pathVariables);
            }
        }
        return null;
    }

    private Object[] resolveArguments(HandlerExecution execution, HttpExchange exchange) throws IOException {
        Parameter[] parameters = execution.handlerMethod().method().getParameters();
        Object[] arguments = new Object[parameters.length];
        Map<String, String> queryParameters = parseQuery(exchange.getRequestURI().getRawQuery());
        String body = readBody(exchange.getRequestBody());
        for (int index = 0; index < parameters.length; index++) {
            Parameter parameter = parameters[index];
            if (parameter.isAnnotationPresent(PathVariable.class)) {
                String name = parameter.getAnnotation(PathVariable.class).value();
                arguments[index] = convert(execution.pathVariables().get(name), parameter.getType());
            } else if (parameter.isAnnotationPresent(RequestParam.class)) {
                String name = parameter.getAnnotation(RequestParam.class).value();
                arguments[index] = convert(queryParameters.get(name), parameter.getType());
            } else if (parameter.isAnnotationPresent(RequestBody.class)) {
                arguments[index] = convertBody(body, parameter.getType());
            } else if (parameter.getType().equals(HttpExchange.class)) {
                arguments[index] = exchange;
            } else {
                arguments[index] = null;
            }
        }
        return arguments;
    }

    private Object convertBody(String body, Class<?> parameterType) {
        if (parameterType.equals(String.class)) {
            return body;
        }
        Object parsed = jsonMapper.readTree(body);
        if (parameterType.isAssignableFrom(Map.class)) {
            return parsed;
        }
        if (parameterType.isRecord() && parsed instanceof Map<?, ?> map) {
            try {
                var components = parameterType.getRecordComponents();
                Object[] arguments = new Object[components.length];
                for (int index = 0; index < components.length; index++) {
                    arguments[index] = convert(String.valueOf(map.get(components[index].getName())), components[index].getType());
                }
                Class<?>[] signature = java.util.Arrays.stream(components).map(component -> component.getType()).toArray(Class<?>[]::new);
                return parameterType.getDeclaredConstructor(signature).newInstance(arguments);
            } catch (ReflectiveOperationException exception) {
                throw new IllegalStateException("Failed to bind request body to " + parameterType.getName(), exception);
            }
        }
        return parsed;
    }

    private Map<String, String> parseQuery(String rawQuery) {
        Map<String, String> result = new HashMap<>();
        if (rawQuery == null || rawQuery.isBlank()) {
            return result;
        }
        for (String pair : rawQuery.split("&")) {
            String[] parts = pair.split("=", 2);
            String key = decode(parts[0]);
            String value = parts.length > 1 ? decode(parts[1]) : "";
            result.put(key, value);
        }
        return result;
    }

    private String readBody(InputStream inputStream) throws IOException {
        return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
    }

    private Object convert(String value, Class<?> targetType) {
        if (targetType.equals(String.class)) {
            return value;
        }
        if (targetType.equals(Long.class) || targetType.equals(long.class)) {
            return Long.parseLong(value);
        }
        if (targetType.equals(Integer.class) || targetType.equals(int.class)) {
            return Integer.parseInt(value);
        }
        if (targetType.equals(Boolean.class) || targetType.equals(boolean.class)) {
            return Boolean.parseBoolean(value);
        }
        return value;
    }

    private String normalizePath(String path) {
        String normalized = path.replaceAll("//+", "/");
        if (!normalized.startsWith("/")) {
            normalized = "/" + normalized;
        }
        if (normalized.length() > 1 && normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private void write(HttpExchange exchange, int statusCode, Object body) throws IOException {
        byte[] response = jsonMapper.write(body).getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(statusCode, response.length);
        try (OutputStream outputStream = exchange.getResponseBody()) {
            outputStream.write(response);
        }
    }

    public record ServerBinding(InetSocketAddress address, DispatcherServlet dispatcherServlet) {
    }

    private record HandlerExecution(HandlerMethod handlerMethod, Map<String, String> pathVariables) {
    }
}

