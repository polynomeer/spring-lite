package lite.spring.web.handler;

import com.sun.net.httpserver.HttpExchange;
import java.lang.reflect.Method;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lite.spring.context.ApplicationContext;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.PutMapping;
import lite.spring.web.annotation.DeleteMapping;
import lite.spring.web.annotation.PostMapping;
import lite.spring.web.annotation.RequestMapping;
import lite.spring.web.annotation.RestController;
import lite.spring.web.http.HttpMethod;
import lite.spring.web.support.HandlerMethod;

public class RequestMappingHandlerMapping implements HandlerMapping {
    private static final String PRODUCES_ATTRIBUTE = "springLite.produces";
    private final List<HandlerMethod> handlers;

    public RequestMappingHandlerMapping(ApplicationContext applicationContext) {
        this.handlers = discoverHandlers(applicationContext);
    }

    @Override
    public HandlerMethodMatch getHandler(HttpExchange exchange) {
        String requestMethod = exchange.getRequestMethod();
        String requestPath = normalizePath(exchange.getRequestURI().getPath());
        for (HandlerMethod handler : handlers) {
            if (!handler.httpMethod().name().equalsIgnoreCase(requestMethod)) {
                continue;
            }
            if (!matchesConditions(handler, exchange)) {
                continue;
            }
            Matcher matcher = handler.regex().matcher(requestPath);
            if (matcher.matches()) {
                if (!handler.produces().isEmpty()) {
                    exchange.setAttribute(PRODUCES_ATTRIBUTE, handler.produces().getFirst());
                }
                Map<String, String> pathVariables = new LinkedHashMap<>();
                Matcher templateMatcher = Pattern.compile("\\{([^/]+)}").matcher(handler.pathPattern());
                while (templateMatcher.find()) {
                    String name = templateMatcher.group(1);
                    pathVariables.put(name, matcher.group(name));
                }
                return new HandlerMethodMatch(handler, pathVariables);
            }
        }
        return null;
    }

    private List<HandlerMethod> discoverHandlers(ApplicationContext applicationContext) {
        Map<String, Object> candidates = applicationContext.getBeansWithAnnotation(RestController.class);
        List<HandlerMethod> discovered = new ArrayList<>();
        for (Object bean : candidates.values()) {
            RequestMapping classMapping = bean.getClass().getAnnotation(RequestMapping.class);
            String classPath = classMapping != null ? classMapping.value() : "";
            RequestConditions classConditions = classMapping == null
                ? RequestConditions.empty()
                : RequestConditions.fromRequestMapping(classMapping);
            for (Method method : bean.getClass().getDeclaredMethods()) {
                if (method.isAnnotationPresent(GetMapping.class)) {
                    GetMapping mapping = method.getAnnotation(GetMapping.class);
                    discovered.add(newHandler(
                        bean,
                        method,
                        HttpMethod.GET,
                        classPath,
                        mapping.value(),
                        classConditions.merge(RequestConditions.fromGetMapping(mapping))
                    ));
                } else if (method.isAnnotationPresent(PostMapping.class)) {
                    PostMapping mapping = method.getAnnotation(PostMapping.class);
                    discovered.add(newHandler(
                        bean,
                        method,
                        HttpMethod.POST,
                        classPath,
                        mapping.value(),
                        classConditions.merge(RequestConditions.fromPostMapping(mapping))
                    ));
                } else if (method.isAnnotationPresent(PutMapping.class)) {
                    PutMapping mapping = method.getAnnotation(PutMapping.class);
                    discovered.add(newHandler(
                        bean, method, HttpMethod.PUT, classPath, mapping.value(),
                        classConditions.merge(RequestConditions.fromPutMapping(mapping))
                    ));
                } else if (method.isAnnotationPresent(DeleteMapping.class)) {
                    DeleteMapping mapping = method.getAnnotation(DeleteMapping.class);
                    discovered.add(newHandler(
                        bean, method, HttpMethod.DELETE, classPath, mapping.value(),
                        classConditions.merge(RequestConditions.fromDeleteMapping(mapping))
                    ));
                }
            }
        }
        discovered.sort((left, right) -> {
            int variableCompare = Integer.compare(pathVariableCount(left.pathPattern()), pathVariableCount(right.pathPattern()));
            if (variableCompare != 0) {
                return variableCompare;
            }
            return Integer.compare(right.pathPattern().length(), left.pathPattern().length());
        });
        return discovered;
    }

    private HandlerMethod newHandler(
        Object bean,
        Method method,
        HttpMethod httpMethod,
        String classPath,
        String methodPath,
        RequestConditions conditions
    ) {
        String pathPattern = normalizePath(classPath + "/" + methodPath);
        Pattern regex = Pattern.compile(pathPattern.replaceAll("\\{([^/]+)}", "(?<$1>[^/]+)"));
        return new HandlerMethod(bean, method, pathPattern, regex, httpMethod, conditions.consumes(), conditions.produces(), conditions.headers(), conditions.params());
    }

    private boolean matchesConditions(HandlerMethod handler, HttpExchange exchange) {
        return matchesConsumes(handler.consumes(), exchange)
            && matchesProduces(handler.produces(), exchange)
            && matchesHeaders(handler.headers(), exchange)
            && matchesParams(handler.params(), exchange);
    }

    private boolean matchesConsumes(List<String> consumes, HttpExchange exchange) {
        if (consumes.isEmpty()) {
            return true;
        }
        String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
        if (contentType == null) {
            return false;
        }
        return consumes.stream().anyMatch(expected -> contentType.equalsIgnoreCase(expected) || contentType.startsWith(expected + ";"));
    }

    private boolean matchesProduces(List<String> produces, HttpExchange exchange) {
        if (produces.isEmpty()) {
            return true;
        }
        String accept = exchange.getRequestHeaders().getFirst("Accept");
        if (accept == null || accept.equals("*/*")) {
            return true;
        }
        List<MediaRange> acceptedTypes = Arrays.stream(accept.split(","))
            .map(MediaRange::parse)
            .filter(range -> range.quality() > 0)
            .sorted(java.util.Comparator.comparingDouble(MediaRange::quality).reversed())
            .toList();
        return produces.stream().anyMatch(expected -> acceptedTypes.stream().anyMatch(actual -> actual.matches(expected)));
    }

    private boolean matchesHeaders(List<String> headers, HttpExchange exchange) {
        for (String headerCondition : headers) {
            if (!matchesHeaderCondition(headerCondition, exchange)) {
                return false;
            }
        }
        return true;
    }

    private boolean matchesParams(List<String> params, HttpExchange exchange) {
        Map<String, String> queryParameters = parseQueryParams(exchange.getRequestURI().getRawQuery());
        for (String paramCondition : params) {
            if (!matchesKeyValueCondition(paramCondition, queryParameters)) {
                return false;
            }
        }
        return true;
    }

    private boolean matchesKeyValueCondition(String condition, Map<String, ?> source) {
        int separatorIndex = condition.indexOf('=');
        if (separatorIndex < 0) {
            return source.containsKey(condition);
        }
        String key = condition.substring(0, separatorIndex);
        Object actual = source.get(key);
        return actual != null && condition.substring(separatorIndex + 1).equals(actual.toString());
    }

    private boolean matchesHeaderCondition(String condition, HttpExchange exchange) {
        int separatorIndex = condition.indexOf('=');
        if (separatorIndex < 0) {
            return exchange.getRequestHeaders().containsKey(condition);
        }
        String key = condition.substring(0, separatorIndex);
        String actual = exchange.getRequestHeaders().getFirst(key);
        return actual != null && condition.substring(separatorIndex + 1).equals(actual);
    }

    private Map<String, String> parseQueryParams(String query) {
        Map<String, String> result = new LinkedHashMap<>();
        if (query == null || query.isBlank()) {
            return result;
        }
        for (String pair : query.split("&")) {
            String[] parts = pair.split("=", 2);
            String key = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
            String value = parts.length > 1 ? URLDecoder.decode(parts[1], StandardCharsets.UTF_8) : "";
            result.put(key, value);
        }
        return result;
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

    private int pathVariableCount(String pathPattern) {
        Matcher matcher = Pattern.compile("\\{([^/]+)}").matcher(pathPattern);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }

    private record RequestConditions(
        List<String> consumes,
        List<String> produces,
        List<String> headers,
        List<String> params
    ) {
        private static RequestConditions empty() {
            return new RequestConditions(List.of(), List.of(), List.of(), List.of());
        }

        private static RequestConditions fromRequestMapping(RequestMapping requestMapping) {
            return new RequestConditions(
                List.of(requestMapping.consumes()),
                List.of(requestMapping.produces()),
                List.of(requestMapping.headers()),
                List.of(requestMapping.params())
            );
        }

        private static RequestConditions fromGetMapping(GetMapping getMapping) {
            return new RequestConditions(
                List.of(),
                List.of(getMapping.produces()),
                List.of(getMapping.headers()),
                List.of(getMapping.params())
            );
        }

        private static RequestConditions fromPostMapping(PostMapping postMapping) {
            return new RequestConditions(
                List.of(postMapping.consumes()),
                List.of(postMapping.produces()),
                List.of(postMapping.headers()),
                List.of(postMapping.params())
            );
        }

        private static RequestConditions fromPutMapping(PutMapping putMapping) {
            return new RequestConditions(List.of(putMapping.consumes()), List.of(putMapping.produces()), List.of(putMapping.headers()), List.of(putMapping.params()));
        }

        private static RequestConditions fromDeleteMapping(DeleteMapping deleteMapping) {
            return new RequestConditions(List.of(), List.of(deleteMapping.produces()), List.of(deleteMapping.headers()), List.of(deleteMapping.params()));
        }

        private RequestConditions merge(RequestConditions other) {
            return new RequestConditions(
                mergeValues(consumes, other.consumes),
                mergeValues(produces, other.produces),
                mergeValues(headers, other.headers),
                mergeValues(params, other.params)
            );
        }

        private List<String> mergeValues(List<String> left, List<String> right) {
            Set<String> merged = new LinkedHashSet<>(left);
            merged.addAll(right);
            return List.copyOf(merged);
        }
    }

    private record MediaRange(String type, double quality) {
        private static MediaRange parse(String value) {
            String[] parts = value.split(";");
            String type = parts[0].trim().toLowerCase();
            double quality = 1.0;
            for (int index = 1; index < parts.length; index++) {
                String parameter = parts[index].trim();
                if (parameter.startsWith("q=")) {
                    try {
                        quality = Double.parseDouble(parameter.substring(2));
                    } catch (NumberFormatException ignored) {
                        quality = 0;
                    }
                }
            }
            return new MediaRange(type, quality);
        }

        private boolean matches(String producedType) {
            String expected = producedType.toLowerCase();
            if (type.equals("*/*") || type.equals(expected)) {
                return true;
            }
            int separator = type.indexOf('/');
            return separator > 0 && type.endsWith("/*") && expected.startsWith(type.substring(0, separator + 1));
        }
    }
}
