package lite.spring.boot.support.autoconfigure;

import lite.spring.context.ApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.ConditionalOnMissingBean;
import lite.spring.core.annotation.Configuration;
import lite.spring.web.json.JsonMapper;
import lite.spring.web.support.DispatcherServlet;

@Configuration
public class WebAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean(DispatcherServlet.class)
    DispatcherServlet dispatcherServlet(ApplicationContext applicationContext, JsonMapper jsonMapper) {
        return new DispatcherServlet(applicationContext, jsonMapper);
    }
}
