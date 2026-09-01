package lite.spring.boot.actuate;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lite.spring.aop.support.ProxyFactory;
import lite.spring.context.ApplicationContext;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.PathVariable;
import lite.spring.web.annotation.PostMapping;
import lite.spring.web.annotation.RequestBody;
import lite.spring.web.annotation.RequestMapping;
import lite.spring.web.annotation.RequestParam;
import lite.spring.web.annotation.RestController;

/** A compact runtime API catalogue, intentionally smaller than an OpenAPI implementation. */
@RestController
public class ApiDocumentationController {
    private final ApplicationContext applicationContext;

    public ApiDocumentationController(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @GetMapping("/api-docs")
    public Map<String, Object> apiDocs() {
        List<Map<String, Object>> endpoints = new ArrayList<>();
        for (Map.Entry<String, Object> entry : applicationContext.getBeansWithAnnotation(RestController.class).entrySet()) {
            Class<?> targetClass = ProxyFactory.getTargetClass(entry.getValue());
            String basePath = targetClass.isAnnotationPresent(RequestMapping.class)
                ? targetClass.getAnnotation(RequestMapping.class).value()
                : "";
            for (Method method : targetClass.getDeclaredMethods()) {
                String httpMethod = null;
                String methodPath = null;
                if (method.isAnnotationPresent(GetMapping.class)) {
                    httpMethod = "GET";
                    methodPath = method.getAnnotation(GetMapping.class).value();
                } else if (method.isAnnotationPresent(PostMapping.class)) {
                    httpMethod = "POST";
                    methodPath = method.getAnnotation(PostMapping.class).value();
                }
                if (httpMethod != null) {
                    endpoints.add(describeEndpoint(targetClass, method, httpMethod, normalizePath(basePath, methodPath)));
                }
            }
        }
        endpoints.sort(Comparator.comparing(endpoint -> String.valueOf(endpoint.get("path")) + endpoint.get("method")));
        Map<String, Object> document = new LinkedHashMap<>();
        document.put("title", "Spring Lite API");
        document.put("version", "0.1.0-SNAPSHOT");
        document.put("endpoints", endpoints);
        return document;
    }

    private Map<String, Object> describeEndpoint(Class<?> targetClass, Method method, String httpMethod, String path) {
        Map<String, Object> endpoint = new LinkedHashMap<>();
        endpoint.put("method", httpMethod);
        endpoint.put("path", path);
        endpoint.put("handler", targetClass.getSimpleName() + "#" + method.getName());
        endpoint.put("responseType", typeName(method.getReturnType()));
        endpoint.put("parameters", describeParameters(method));
        if (method.isAnnotationPresent(GetMapping.class)) {
            GetMapping mapping = method.getAnnotation(GetMapping.class);
            endpoint.put("produces", List.of(mapping.produces()));
            endpoint.put("headers", List.of(mapping.headers()));
            endpoint.put("params", List.of(mapping.params()));
        } else {
            PostMapping mapping = method.getAnnotation(PostMapping.class);
            endpoint.put("consumes", List.of(mapping.consumes()));
            endpoint.put("produces", List.of(mapping.produces()));
            endpoint.put("headers", List.of(mapping.headers()));
            endpoint.put("params", List.of(mapping.params()));
        }
        return endpoint;
    }

    private List<Map<String, String>> describeParameters(Method method) {
        List<Map<String, String>> parameters = new ArrayList<>();
        for (Parameter parameter : method.getParameters()) {
            Map<String, String> description = new LinkedHashMap<>();
            description.put("name", parameter.getName());
            description.put("type", typeName(parameter.getType()));
            if (parameter.isAnnotationPresent(RequestParam.class)) {
                description.put("source", "query");
                description.put("name", parameter.getAnnotation(RequestParam.class).value());
            } else if (parameter.isAnnotationPresent(PathVariable.class)) {
                description.put("source", "path");
                description.put("name", parameter.getAnnotation(PathVariable.class).value());
            } else if (parameter.isAnnotationPresent(RequestBody.class)) {
                description.put("source", "body");
            } else {
                description.put("source", "exchange");
            }
            parameters.add(Map.copyOf(description));
        }
        return List.copyOf(parameters);
    }

    private String typeName(Class<?> type) {
        return type.isArray() ? type.getComponentType().getSimpleName() + "[]" : type.getSimpleName();
    }

    private String normalizePath(String basePath, String methodPath) {
        String path = (basePath + "/" + methodPath).replaceAll("//+", "/");
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        return path.length() > 1 && path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
    }
}
