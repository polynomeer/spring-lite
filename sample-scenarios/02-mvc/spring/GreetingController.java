package samples.comparison.mvc.spring;

import java.util.Map;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GreetingController {

    @GetMapping("/greetings/{name}")
    public Map<String, Object> greet(
        @PathVariable String name,
        @RequestParam(required = false) String title
    ) {
        if (name.isBlank()) {
            throw new IllegalArgumentException("name must not be blank");
        }
        return Map.of(
            "message", "Hello " + (title == null ? name : title + " " + name),
            "source", "spring"
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public Map<String, Object> handleIllegalArgument(IllegalArgumentException exception) {
        return Map.of("error", exception.getMessage(), "source", "spring");
    }
}
