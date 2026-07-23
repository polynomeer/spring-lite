package samples.comparison.di.spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class GreetingApplication {

    @Bean
    TimeFormatter timeFormatter() {
        return new TimeFormatter("[spring]");
    }

    public static void main(String[] args) {
        SpringApplication.run(GreetingApplication.class, args);
    }
}
