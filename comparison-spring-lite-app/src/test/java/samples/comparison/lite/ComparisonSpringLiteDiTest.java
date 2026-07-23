package samples.comparison.lite;

import static org.assertj.core.api.Assertions.assertThat;

import lite.spring.test.SpringLiteTest;
import org.junit.jupiter.api.Test;
import samples.comparison.lite.greeting.GreetingService;

@SpringLiteTest(classes = ComparisonSpringLiteApplication.class)
class ComparisonSpringLiteDiTest {
    @Test
    void injectsGreetingDependencies(GreetingService greetingService) {
        assertThat(greetingService.greet("Spring Lite")).isEqualTo("[spring-lite] Hello, Spring Lite");
    }
}
