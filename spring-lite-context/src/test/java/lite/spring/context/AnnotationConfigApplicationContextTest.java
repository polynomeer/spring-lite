package lite.spring.context;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.ComponentScan;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.annotation.PostConstruct;
import lite.spring.core.annotation.PreDestroy;
import lite.spring.core.exception.BeansException;
import lite.spring.core.exception.NoSuchBeanException;
import lite.spring.core.exception.NoUniqueBeanException;
import lite.spring.context.fixture.ScannedGreetingService;
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

    @Test
    void exposesApplicationContextAsDependency() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ContextAwareConfig.class)) {
            ContextAwareBean bean = context.getBean(ContextAwareBean.class);

            assertThat(bean.applicationContext()).isSameAs(context);
        }
    }

    @Test
    void returnsAllBeansOfType() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(MultiFormatterConfig.class)) {
            Map<String, Formatter> formatters = context.getBeansOfType(Formatter.class);

            assertThat(formatters).hasSize(2).containsKeys("firstFormatter", "secondFormatter");
        }
    }

    @Test
    void throwsForMissingBean() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TestConfig.class)) {
            assertThatThrownBy(() -> context.getBean(MissingBean.class))
                .isInstanceOf(NoSuchBeanException.class)
                .hasMessageContaining(MissingBean.class.getName());
        }
    }

    @Test
    void throwsForNonUniqueBeanLookup() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(MultiFormatterConfig.class)) {
            assertThatThrownBy(() -> context.getBean(Formatter.class))
                .isInstanceOf(NoUniqueBeanException.class)
                .hasMessageContaining(Formatter.class.getName());
        }
    }

    @Test
    void invokesPreDestroyAndAutoCloseableCallbacksOnClose() {
        DestroyAwareBean destroyAwareBean;
        CloseTrackingBean closeTrackingBean;

        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(DestroyConfig.class)) {
            destroyAwareBean = context.getBean(DestroyAwareBean.class);
            closeTrackingBean = context.getBean(CloseTrackingBean.class);
            assertThat(destroyAwareBean.destroyed.get()).isFalse();
            assertThat(closeTrackingBean.closed.get()).isFalse();
        }

        assertThat(destroyAwareBean.destroyed.get()).isTrue();
        assertThat(closeTrackingBean.closed.get()).isTrue();
    }

    @Test
    void detectsCircularDependencies() {
        assertThatThrownBy(() -> new AnnotationConfigApplicationContext(CircularConfig.class))
            .isInstanceOf(BeansException.class)
            .hasMessageContaining("Circular dependency");
    }

    @Test
    void supportsComponentScanAndMetaAnnotations() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ScannedConfig.class)) {
            ScannedGreetingService greetingService = context.getBean(ScannedGreetingService.class);

            assertThat(greetingService.greet()).isEqualTo("hello from scan");
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

    @Configuration
    static class ContextAwareConfig {
        @Bean
        ContextAwareBean contextAwareBean(ApplicationContext applicationContext) {
            return new ContextAwareBean(applicationContext);
        }
    }

    @Configuration
    static class MultiFormatterConfig {
        @Bean
        Formatter firstFormatter() {
            return () -> "first";
        }

        @Bean
        Formatter secondFormatter() {
            return () -> "second";
        }
    }

    @Configuration
    static class DestroyConfig {
        @Bean
        DestroyAwareBean destroyAwareBean() {
            return new DestroyAwareBean();
        }

        @Bean
        CloseTrackingBean closeTrackingBean() {
            return new CloseTrackingBean();
        }
    }

    @Configuration
    static class CircularConfig {
        @Bean
        CircularA circularA(CircularB circularB) {
            return new CircularA(circularB);
        }

        @Bean
        CircularB circularB(CircularA circularA) {
            return new CircularB(circularA);
        }
    }

    @Configuration
    @ComponentScan(basePackages = "lite.spring.context.fixture")
    static class ScannedConfig {
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

    interface Formatter {
        String value();
    }

    static class ContextAwareBean {
        private final ApplicationContext applicationContext;

        ContextAwareBean(ApplicationContext applicationContext) {
            this.applicationContext = applicationContext;
        }

        ApplicationContext applicationContext() {
            return applicationContext;
        }
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

    static class DestroyAwareBean {
        private final AtomicBoolean destroyed = new AtomicBoolean();

        @PreDestroy
        void destroy() {
            destroyed.set(true);
        }
    }

    static class CloseTrackingBean implements AutoCloseable {
        private final AtomicBoolean closed = new AtomicBoolean();

        @Override
        public void close() {
            closed.set(true);
        }
    }

    static class CircularA {
        CircularA(CircularB circularB) {
        }
    }

    static class CircularB {
        CircularB(CircularA circularA) {
        }
    }

    static class MissingBean {
    }
}
