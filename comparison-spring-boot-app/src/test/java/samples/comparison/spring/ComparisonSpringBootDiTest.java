package samples.comparison.spring;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import samples.comparison.spring.greeting.GreetingService;

@SpringBootTest
class ComparisonSpringBootDiTest {
    @Autowired
    private GreetingService greetingService;

    @Test
    void injectsGreetingDependencies() {
        assertThat(greetingService.greet("Spring")).isEqualTo("[spring] Hello, Spring");
    }
}
