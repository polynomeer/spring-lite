package samples.comparison.lite.greeting;

import lite.spring.core.annotation.Qualifier;
import lite.spring.core.annotation.Service;
import lite.spring.core.annotation.Value;

@Service
public class DefaultGreetingService implements GreetingService {
    private final TimeFormatter formatter;
    private final String template;

    public DefaultGreetingService(
        @Qualifier("timeFormatter") TimeFormatter formatter,
        @Value("${comparison.greeting.template:Hello, %s}") String template
    ) {
        this.formatter = formatter;
        this.template = template;
    }

    @Override
    public String greet(String name) {
        return formatter.format(template.formatted(name));
    }
}
