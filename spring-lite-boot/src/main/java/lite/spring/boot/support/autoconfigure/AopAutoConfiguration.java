package lite.spring.boot.support.autoconfigure;

import lite.spring.aop.support.AspectBeanPostProcessor;
import lite.spring.context.ApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.ConditionalOnMissingBean;
import lite.spring.core.annotation.Configuration;

@Configuration
public class AopAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean(AspectBeanPostProcessor.class)
    AspectBeanPostProcessor aspectBeanPostProcessor(ApplicationContext applicationContext) {
        return new AspectBeanPostProcessor(applicationContext);
    }
}
