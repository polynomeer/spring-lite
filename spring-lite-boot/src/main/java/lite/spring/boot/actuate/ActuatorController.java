package lite.spring.boot.actuate;

import java.util.Map;
import lite.spring.boot.support.ApplicationProperties;
import lite.spring.context.ApplicationContext;
import lite.spring.context.BeanRuntimeDescriptor;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.RestController;

@RestController
public class ActuatorController {
    private final ApplicationContext applicationContext;
    private final ApplicationProperties properties;

    public ActuatorController(ApplicationContext applicationContext, ApplicationProperties properties) {
        this.applicationContext = applicationContext;
        this.properties = properties;
    }

    @GetMapping("/actuator/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }

    @GetMapping("/actuator/info")
    public Map<String, Object> info() {
        var descriptors = applicationContext.getBeanRuntimeDescriptors();
        long proxied = descriptors.stream().filter(BeanRuntimeDescriptor::proxied).count();
        return Map.of(
            "application", properties.get("spring.application.name", "spring-lite"),
            "beans", descriptors.size(),
            "proxiedBeans", proxied
        );
    }
}
