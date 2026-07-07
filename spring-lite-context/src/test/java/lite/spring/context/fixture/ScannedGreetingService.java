package lite.spring.context.fixture;

import lite.spring.core.annotation.Service;

@Service
public class ScannedGreetingService {
    public String greet() {
        return "hello from scan";
    }
}

