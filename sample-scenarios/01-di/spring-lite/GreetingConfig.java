package samples.comparison.di.springlite;

import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Configuration;

@Configuration
public class GreetingConfig {

    @Bean
    public TimeFormatter timeFormatter() {
        return new TimeFormatter("[lite]");
    }
}
