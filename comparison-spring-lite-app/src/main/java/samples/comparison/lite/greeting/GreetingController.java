package samples.comparison.lite.greeting;

import java.util.Map;
import lite.spring.web.annotation.ExceptionHandler;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.PathVariable;
import lite.spring.web.annotation.RequestParam;
import lite.spring.web.annotation.RestController;

@RestController
public class GreetingController {
    private final GreetingService greetingService;

    public GreetingController(GreetingService greetingService) {
        this.greetingService = greetingService;
    }

    @GetMapping("/greetings/{name}")
    public Map<String, Object> greet(
        @PathVariable("name") String name,
        @RequestParam("title") String title
    ) {
        if (name.isBlank()) {
            throw new IllegalArgumentException("name must not be blank");
        }
        String actualName = title == null ? name : title + " " + name;
        return Map.of(
            "message", greetingService.greet(actualName),
            "source", "spring-lite"
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public Map<String, Object> handleIllegalArgument(IllegalArgumentException exception) {
        return Map.of("error", exception.getMessage(), "source", "spring-lite");
    }
}
