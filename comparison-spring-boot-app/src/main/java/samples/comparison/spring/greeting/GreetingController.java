package samples.comparison.spring.greeting;

import java.util.Map;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GreetingController {
    private final GreetingService greetingService;

    public GreetingController(GreetingService greetingService) {
        this.greetingService = greetingService;
    }

    @GetMapping("/greetings/{name}")
    public Map<String, Object> greet(
        @PathVariable("name") String name,
        @RequestParam(value = "title", required = false) String title
    ) {
        if (name.isBlank()) {
            throw new IllegalArgumentException("name must not be blank");
        }
        String actualName = title == null ? name : title + " " + name;
        return Map.of(
            "message", greetingService.greet(actualName),
            "source", "spring"
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public Map<String, Object> handleIllegalArgument(IllegalArgumentException exception) {
        return Map.of("error", exception.getMessage(), "source", "spring");
    }
}
