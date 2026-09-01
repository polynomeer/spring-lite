package lite.spring.boot.actuate;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lite.spring.aop.support.ProxyFactory;
import lite.spring.context.ApplicationContext;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.PostMapping;
import lite.spring.web.annotation.RequestMapping;
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
        List<Map<String, String>> endpoints = new ArrayList<>();
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
                    endpoints.add(Map.of(
                        "method", httpMethod,
                        "path", normalizePath(basePath, methodPath),
                        "handler", targetClass.getSimpleName() + "#" + method.getName()
                    ));
                }
            }
        }
        endpoints.sort(Comparator.comparing(endpoint -> endpoint.get("path") + endpoint.get("method")));
        Map<String, Object> document = new LinkedHashMap<>();
        document.put("title", "Spring Lite API");
        document.put("version", "0.1.0-SNAPSHOT");
        document.put("endpoints", endpoints);
        return document;
    }

    private String normalizePath(String basePath, String methodPath) {
        String path = (basePath + "/" + methodPath).replaceAll("//+", "/");
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        return path.length() > 1 && path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
    }
}
