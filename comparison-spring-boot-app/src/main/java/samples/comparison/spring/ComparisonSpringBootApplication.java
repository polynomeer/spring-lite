package samples.comparison.spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import samples.comparison.spring.greeting.TimeFormatter;

@SpringBootApplication
public class ComparisonSpringBootApplication {

    @Bean
    TimeFormatter timeFormatter() {
        return new TimeFormatter("[spring]");
    }

    public static void main(String[] args) {
        SpringApplication.run(ComparisonSpringBootApplication.class, args);
    }
}
