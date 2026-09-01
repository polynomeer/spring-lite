package lite.spring.boot.support.autoconfigure;

import lite.spring.boot.support.ApplicationProperties;
import lite.spring.boot.web.JdkWebServerFactory;
import lite.spring.boot.web.WebServer;
import lite.spring.boot.web.WebServerFactory;
import lite.spring.context.ApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.ConditionalOnMissingBean;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.metrics.MetricsRegistry;
import lite.spring.web.json.JsonMapper;
import lite.spring.web.support.DispatcherServlet;

@Configuration
public class WebAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean(ApplicationProperties.class)
    ApplicationProperties applicationProperties() {
        return ApplicationProperties.load();
    }

    @Bean
    @ConditionalOnMissingBean(DispatcherServlet.class)
    DispatcherServlet dispatcherServlet(ApplicationContext applicationContext, JsonMapper jsonMapper, MetricsRegistry metricsRegistry) {
        return new DispatcherServlet(applicationContext, jsonMapper, new lite.spring.web.support.StaticResourceHandler(), metricsRegistry);
    }

    @Bean
    @ConditionalOnMissingBean(WebServerFactory.class)
    WebServerFactory webServerFactory() {
        return new JdkWebServerFactory();
    }

    @Bean
    @ConditionalOnMissingBean(WebServer.class)
    WebServer webServer(DispatcherServlet dispatcherServlet, WebServerFactory webServerFactory, ApplicationProperties applicationProperties) {
        int port = Integer.parseInt(applicationProperties.get("server.port", "8080"));
        return webServerFactory.create(dispatcherServlet, port);
    }
}
