package lite.spring.aop.support;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import lite.spring.aop.annotation.Timed;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.metrics.MetricsRegistry;
import org.junit.jupiter.api.Test;

class TimedBeanPostProcessorTest {
    @Test
    void recordsAnnotatedCallsIncludingFailuresAndUsesConfiguredNames() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TimedConfig.class)) {
            TimedService service = context.getBean(TimedService.class);
            MetricsRegistry metrics = context.getBean(MetricsRegistry.class);

            assertThat(service.success()).isEqualTo("ok");
            assertThatThrownBy(service::failure).isInstanceOf(IllegalStateException.class);

            assertThat(metrics.timers()).containsKeys("timedService.success", "explicit.failure");
            assertThat(metrics.timers().get("timedService.success").count()).isEqualTo(1);
            assertThat(metrics.timers().get("explicit.failure").count()).isEqualTo(1);
        }
    }

    @Test
    void recordsAllMethodsWhenTheTargetTypeIsTimed() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TypeTimedConfig.class)) {
            TypeTimedService service = context.getBean(TypeTimedService.class);

            assertThat(service.call()).isEqualTo("ok");
            assertThat(context.getBean(MetricsRegistry.class).timers()).containsKey("typeTimedService.call");
        }
    }

    @Configuration
    static class TimedConfig {
        @Bean
        MetricsRegistry metricsRegistry() {
            return new MetricsRegistry();
        }

        @Bean
        TimedBeanPostProcessor timedBeanPostProcessor(MetricsRegistry metricsRegistry) {
            return new TimedBeanPostProcessor(metricsRegistry);
        }

        @Bean
        TimedService timedService() {
            return new TimedService();
        }
    }

    @Configuration
    static class TypeTimedConfig {
        @Bean
        MetricsRegistry metricsRegistry() {
            return new MetricsRegistry();
        }

        @Bean
        TimedBeanPostProcessor timedBeanPostProcessor(MetricsRegistry metricsRegistry) {
            return new TimedBeanPostProcessor(metricsRegistry);
        }

        @Bean
        TypeTimedService typeTimedService() {
            return new TypeTimedService();
        }
    }

    static class TimedService {
        @Timed
        String success() {
            return "ok";
        }

        @Timed("explicit.failure")
        String failure() {
            throw new IllegalStateException("failure");
        }
    }

    @Timed
    static class TypeTimedService {
        String call() {
            return "ok";
        }
    }
}
