package samples.comparison.di.spring;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class DefaultGreetingService implements GreetingService {
    private final TimeFormatter formatter;
    private final String template;

    public DefaultGreetingService(
        @Qualifier("timeFormatter") TimeFormatter formatter,
        @Value("${greeting.template:Hello, %s}") String template
    ) {
        this.formatter = formatter;
        this.template = template;
    }

    @Override
    public String greet(String name) {
        return formatter.format(template.formatted(name));
    }
}
