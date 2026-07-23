package samples.comparison.mvc.springlite;

import java.util.Map;
import lite.spring.core.annotation.Component;
import lite.spring.web.annotation.ExceptionHandler;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.PathVariable;
import lite.spring.web.annotation.RequestParam;
import lite.spring.web.annotation.RestController;

@RestController
@Component
public class GreetingController {

    @GetMapping("/greetings/{name}")
    public Map<String, Object> greet(
        @PathVariable("name") String name,
        @RequestParam(value = "title", required = false) String title
    ) {
        if (name.isBlank()) {
            throw new IllegalArgumentException("name must not be blank");
        }
        return Map.of(
            "message", "Hello " + (title == null ? name : title + " " + name),
            "source", "spring-lite"
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public Map<String, Object> handleIllegalArgument(IllegalArgumentException exception) {
        return Map.of("error", exception.getMessage(), "source", "spring-lite");
    }
}
