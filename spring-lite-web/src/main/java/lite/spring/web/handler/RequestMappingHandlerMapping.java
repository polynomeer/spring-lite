package lite.spring.web.handler;

import com.sun.net.httpserver.HttpExchange;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lite.spring.context.ApplicationContext;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.PostMapping;
import lite.spring.web.annotation.RequestMapping;
import lite.spring.web.annotation.RestController;
import lite.spring.web.http.HttpMethod;
import lite.spring.web.support.HandlerMethod;

public class RequestMappingHandlerMapping implements HandlerMapping {
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
            Matcher matcher = handler.regex().matcher(requestPath);
            if (matcher.matches()) {
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
        discovered.sort((left, right) -> {
            int variableCompare = Integer.compare(pathVariableCount(left.pathPattern()), pathVariableCount(right.pathPattern()));
            if (variableCompare != 0) {
                return variableCompare;
            }
            return Integer.compare(right.pathPattern().length(), left.pathPattern().length());
        });
        return discovered;
    }

    private HandlerMethod newHandler(Object bean, Method method, HttpMethod httpMethod, String classPath, String methodPath) {
        String pathPattern = normalizePath(classPath + "/" + methodPath);
        Pattern regex = Pattern.compile(pathPattern.replaceAll("\\{([^/]+)}", "(?<$1>[^/]+)"));
        return new HandlerMethod(bean, method, pathPattern, regex, httpMethod);
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
}
