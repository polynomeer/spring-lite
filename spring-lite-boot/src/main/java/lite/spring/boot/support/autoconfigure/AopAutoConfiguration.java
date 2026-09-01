package lite.spring.boot.support.autoconfigure;

import lite.spring.aop.support.AspectBeanPostProcessor;
import lite.spring.aop.support.TimedBeanPostProcessor;
import lite.spring.context.ApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.ConditionalOnMissingBean;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.metrics.MetricsRegistry;

@Configuration
public class AopAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean(AspectBeanPostProcessor.class)
    AspectBeanPostProcessor aspectBeanPostProcessor(ApplicationContext applicationContext) {
        return new AspectBeanPostProcessor(applicationContext);
    }

    @Bean
    @ConditionalOnMissingBean(MetricsRegistry.class)
    MetricsRegistry metricsRegistry() {
        return new MetricsRegistry();
    }

    @Bean
    @ConditionalOnMissingBean(TimedBeanPostProcessor.class)
    TimedBeanPostProcessor timedBeanPostProcessor(MetricsRegistry metricsRegistry) {
        return new TimedBeanPostProcessor(metricsRegistry);
    }
}
