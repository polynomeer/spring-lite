package lite.spring.boot;

import static org.assertj.core.api.Assertions.assertThat;

import javax.sql.DataSource;
import java.util.ArrayList;
import java.util.List;
import lite.spring.aop.MethodInvocation;
import lite.spring.aop.annotation.AfterReturning;
import lite.spring.aop.annotation.Around;
import lite.spring.aop.annotation.Aspect;
import lite.spring.aop.annotation.Before;
import lite.spring.aop.support.AspectBeanPostProcessor;
import lite.spring.boot.annotation.MiniSpringBootApplication;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.ConditionalOnClass;
import lite.spring.core.annotation.ConditionalOnProperty;
import lite.spring.jdbc.datasource.DriverManagerDataSource;
import lite.spring.boot.web.WebServer;
import lite.spring.boot.web.WebServerFactory;
import lite.spring.tx.annotation.Transactional;
import lite.spring.web.json.JsonMapper;
import lite.spring.web.support.DispatcherServlet;
import org.junit.jupiter.api.Test;

class MiniSpringApplicationTest {
    @Test
    void autoRegistersTransactionalInfrastructure() {
        try (AnnotationConfigApplicationContext context = MiniSpringApplication.run(BootTestApplication.class)) {
            BootSampleService service = context.getBean(BootSampleService.class);

            assertThat(service.call("ok")).isEqualTo("ok");
            assertThat(context.containsBeanOfType(lite.spring.tx.support.TransactionManager.class)).isTrue();
            assertThat(context.containsBeanOfType(lite.spring.tx.support.TransactionalBeanPostProcessor.class)).isTrue();
            assertThat(context.containsBeanOfType(DispatcherServlet.class)).isTrue();
            assertThat(context.containsBeanOfType(AspectBeanPostProcessor.class)).isTrue();
            assertThat(context.containsBeanOfType(WebServerFactory.class)).isTrue();
            assertThat(context.containsBeanOfType(WebServer.class)).isTrue();
        }
    }

    @Test
    void appliesAspectStyleAdviceViaBootInfrastructure() {
        BootRecordingAspect.events.clear();
        try (AnnotationConfigApplicationContext context = MiniSpringApplication.run(AspectApplication.class)) {
            AspectSampleService service = context.getBean(AspectSampleService.class);

            String result = service.call("ok");

            assertThat(result).isEqualTo("ok!");
            assertThat(BootRecordingAspect.events).containsExactly("before:call", "after:ok");
        }
    }

    @Test
    void backsOffWhenUserProvidesJsonMapperBean() {
        try (AnnotationConfigApplicationContext context = MiniSpringApplication.run(CustomJsonMapperApplication.class)) {
            assertThat(context.getBeansOfType(JsonMapper.class)).hasSize(1);
            assertThat(context.getBean(JsonMapper.class)).isSameAs(context.getBean("customJsonMapper"));
        }
    }

    @Test
    void registersJdbcTemplateOnlyWhenDataSourceExists() {
        try (AnnotationConfigApplicationContext withoutDataSource = MiniSpringApplication.run(BootTestApplication.class)) {
            assertThat(withoutDataSource.containsBeanOfType(lite.spring.jdbc.JdbcTemplate.class)).isFalse();
        }
        try (AnnotationConfigApplicationContext withDataSource = MiniSpringApplication.run(DataSourceApplication.class)) {
            assertThat(withDataSource.containsBeanOfType(lite.spring.jdbc.JdbcTemplate.class)).isTrue();
        }
    }

    @Test
    void supportsConditionalAnnotationsOnApplicationBeans() {
        try (AnnotationConfigApplicationContext context = MiniSpringApplication.run(ConditionalBeansApplication.class)) {
            assertThat(context.containsBeanDefinition("classConditionBean")).isTrue();
            assertThat(context.containsBeanDefinition("propertyConditionBean")).isTrue();
            assertThat(context.containsBeanDefinition("missingClassConditionBean")).isFalse();
        }
    }

    @Test
    void usesCustomWebServerBeanWhenProvided() {
        RecordingWebServer.started = false;
        try (AnnotationConfigApplicationContext context = MiniSpringApplication.run(CustomWebServerApplication.class)) {
            assertThat(context.getBean(WebServer.class)).isInstanceOf(RecordingWebServer.class);
            assertThat(RecordingWebServer.started).isTrue();
        }
    }

    @MiniSpringBootApplication
    static class BootTestApplication {
        @Bean
        BootSampleService bootSampleService() {
            return new BootSampleServiceImpl();
        }
    }

    interface BootSampleService {
        String call(String input);
    }

    static class BootSampleServiceImpl implements BootSampleService {
        @Override
        @Transactional
        public String call(String input) {
            return input;
        }
    }

    @MiniSpringBootApplication
    static class AspectApplication {
        @Bean
        AspectSampleService aspectSampleService() {
            return new AspectSampleService();
        }

        @Bean
        BootRecordingAspect bootRecordingAspect() {
            return new BootRecordingAspect();
        }
    }

    static class AspectSampleService {
        public String call(String value) {
            return value;
        }
    }

    @Aspect
    static class BootRecordingAspect {
        private static final List<String> events = new ArrayList<>();

        @Before(methodName = "call")
        void before(MethodInvocation invocation) {
            events.add("before:" + invocation.getMethod().getName());
        }

        @Around(methodName = "call")
        Object around(MethodInvocation invocation) throws Throwable {
            return invocation.proceed() + "!";
        }

        @AfterReturning(methodName = "call")
        void afterReturning(String returnValue) {
            events.add("after:" + returnValue);
        }
    }

    @MiniSpringBootApplication
    static class CustomJsonMapperApplication {
        @Bean("customJsonMapper")
        JsonMapper customJsonMapper() {
            return new JsonMapper();
        }
    }

    @MiniSpringBootApplication
    static class DataSourceApplication {
        @Bean
        DataSource dataSource() {
            return new DriverManagerDataSource("jdbc:h2:mem:boot-test;DB_CLOSE_DELAY=-1", "sa", "");
        }
    }

    @MiniSpringBootApplication
    static class ConditionalBeansApplication {
        @Bean
        @ConditionalOnClass(name = "java.lang.String")
        String classConditionBean() {
            return "class-ok";
        }

        @Bean
        @ConditionalOnProperty(name = "test.feature.enabled", havingValue = "true")
        Integer propertyConditionBean() {
            return 7;
        }

        @Bean
        @ConditionalOnClass(name = "lite.spring.missing.DoesNotExist")
        Long missingClassConditionBean() {
            return 1L;
        }
    }

    @MiniSpringBootApplication
    static class CustomWebServerApplication {
        @Bean
        WebServer webServer() {
            return new RecordingWebServer(9191);
        }
    }

    static final class RecordingWebServer implements WebServer {
        private static boolean started;
        private final int port;

        private RecordingWebServer(int port) {
            this.port = port;
        }

        @Override
        public void start() {
            started = true;
        }

        @Override
        public int port() {
            return port;
        }

        @Override
        public void close() {
        }
    }
}
