package lite.spring.context;

import static org.assertj.core.api.Assertions.assertThat;

import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.annotation.PostConstruct;
import org.junit.jupiter.api.Test;

class AnnotationConfigApplicationContextTest {
    @Test
    void resolvesConstructorDependenciesAndBeanMethods() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TestConfig.class)) {
            GreetingService greetingService = context.getBean(GreetingService.class);
            LifecycleBean lifecycleBean = context.getBean(LifecycleBean.class);

            assertThat(greetingService.message()).isEqualTo("hello spring-lite");
            assertThat(lifecycleBean.initialized()).isTrue();
        }
    }

    @Configuration
    static class TestConfig {
        @Bean
        GreetingFormatter greetingFormatter() {
            return new GreetingFormatter("spring-lite");
        }

        @Bean
        GreetingService greetingService(GreetingFormatter greetingFormatter) {
            return new GreetingService(greetingFormatter);
        }

        @Bean
        LifecycleBean lifecycleBean() {
            return new LifecycleBean();
        }
    }

    static class GreetingService {
        private final GreetingFormatter greetingFormatter;

        GreetingService(GreetingFormatter greetingFormatter) {
            this.greetingFormatter = greetingFormatter;
        }

        String message() {
            return "hello " + greetingFormatter.name();
        }
    }

    static record GreetingFormatter(String name) {
    }

    static class LifecycleBean {
        private boolean initialized;

        @PostConstruct
        void initialize() {
            initialized = true;
        }

        boolean initialized() {
            return initialized;
        }
    }
}
