package lite.spring.boot.support.autoconfigure;

import lite.spring.boot.actuate.ActuatorController;
import lite.spring.boot.support.ApplicationProperties;
import lite.spring.context.ApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.metrics.MetricsRegistry;
import lite.spring.core.annotation.ConditionalOnMissingBean;

@Configuration
public class ActuatorAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean(ActuatorController.class)
    ActuatorController actuatorController(ApplicationContext applicationContext, ApplicationProperties properties, MetricsRegistry metricsRegistry) {
        return new ActuatorController(applicationContext, properties, metricsRegistry);
    }
}
