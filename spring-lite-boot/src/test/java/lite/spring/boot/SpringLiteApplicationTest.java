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
import lite.spring.aop.annotation.Timed;
import lite.spring.aop.support.AspectBeanPostProcessor;
import lite.spring.boot.annotation.SpringLiteBootApplication;
import lite.spring.boot.actuate.ActuatorController;
import lite.spring.boot.actuate.ApiDocumentationController;
import lite.spring.boot.actuate.DatabaseActuatorController;
import lite.spring.boot.diagnostics.ApplicationDiagnostics;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.ConditionalOnClass;
import lite.spring.core.annotation.ConditionalOnProperty;
import lite.spring.jdbc.datasource.DriverManagerDataSource;
import lite.spring.boot.web.WebServer;
import lite.spring.boot.web.WebServerFactory;
import lite.spring.tx.annotation.Transactional;
import lite.spring.web.json.JsonMapper;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.PathVariable;
import lite.spring.web.annotation.RequestBody;
import lite.spring.web.annotation.RequestParam;
import lite.spring.web.annotation.RestController;
import lite.spring.web.support.DispatcherServlet;
import org.junit.jupiter.api.Test;

class SpringLiteApplicationTest {
    @Test
    void autoRegistersTransactionalInfrastructure() {
        try (AnnotationConfigApplicationContext context = runWithRandomPort(BootTestApplication.class)) {
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
    void exposesActuatorLiteHealthAndRuntimeInfo() {
        try (AnnotationConfigApplicationContext context = runWithRandomPort(BootTestApplication.class)) {
            ActuatorController actuator = context.getBean(ActuatorController.class);

            assertThat(actuator.health()).containsEntry("status", "UP");
            assertThat(actuator.info()).containsEntry("application", "spring-lite");
            assertThat((Integer) actuator.info().get("beans")).isPositive();
        }
    }

    @Test
    void recordsTimedServiceCallsAndExposesMetrics() {
        try (AnnotationConfigApplicationContext context = runWithRandomPort(TimedApplication.class)) {
            TimedService service = context.getBean(TimedService.class);
            service.call();
            assertThat(service.fail()).isEqualTo("failed");
            ActuatorController actuator = context.getBean(ActuatorController.class);
            java.util.Map<?, ?> timers = (java.util.Map<?, ?>) actuator.metrics().get("timers");
            assertThat(timers.containsKey("timedService.call")).isTrue();
            assertThat(timers.containsKey("custom.failure")).isTrue();
        }
    }

    @Test
    void exposesRuntimeApiDocumentationForRegisteredControllers() {
        try (AnnotationConfigApplicationContext context = runWithRandomPort(ApiDocsApplication.class)) {
            ApiDocumentationController apiDocs = context.getBean(ApiDocumentationController.class);

            assertThat(apiDocs.apiDocs()).containsEntry("title", "Spring Lite API");
            assertThat((List<?>) apiDocs.apiDocs().get("endpoints"))
                .anySatisfy(endpoint -> assertThat(endpoint.toString()).contains("/api-docs"))
                .anySatisfy(endpoint -> assertThat(endpoint.toString()).contains("/catalog/items/{id}"))
                .anySatisfy(endpoint -> assertThat(endpoint.toString()).contains("responseType=Item"))
                .anySatisfy(endpoint -> assertThat(endpoint.toString()).contains("source=body"));
        }
    }

    @Test
    void bootstrapsDiagnosticsWithoutStartingTheWebServer() {
        try (AnnotationConfigApplicationContext context = SpringLiteApplication.bootstrap(BootTestApplication.class, "--server.port=0")) {
            assertThat(ApplicationDiagnostics.report(context))
                .containsEntry("beanCount", context.getBeanRuntimeDescriptors().size());
            assertThat(((Number) ApplicationDiagnostics.report(context).get("proxiedBeanCount")).longValue()).isPositive();
        }
    }

    @Test
    void appliesAspectStyleAdviceViaBootInfrastructure() {
        BootRecordingAspect.events.clear();
        try (AnnotationConfigApplicationContext context = runWithRandomPort(AspectApplication.class)) {
            AspectSampleService service = context.getBean(AspectSampleService.class);

            String result = service.call("ok");

            assertThat(result).isEqualTo("ok!");
            assertThat(BootRecordingAspect.events).containsExactly("before:call", "after:ok");
        }
    }

    @Test
    void backsOffWhenUserProvidesJsonMapperBean() {
        try (AnnotationConfigApplicationContext context = runWithRandomPort(CustomJsonMapperApplication.class)) {
            assertThat(context.getBeansOfType(JsonMapper.class)).hasSize(1);
            assertThat(context.getBean(JsonMapper.class)).isSameAs(context.getBean("customJsonMapper"));
        }
    }

    @Test
    void registersJdbcTemplateOnlyWhenDataSourceExists() {
        try (AnnotationConfigApplicationContext withoutDataSource = runWithRandomPort(BootTestApplication.class)) {
            assertThat(withoutDataSource.containsBeanOfType(lite.spring.jdbc.JdbcTemplate.class)).isFalse();
            assertThat(withoutDataSource.containsBeanOfType(DatabaseActuatorController.class)).isFalse();
        }
        try (AnnotationConfigApplicationContext withDataSource = runWithRandomPort(DataSourceApplication.class)) {
            assertThat(withDataSource.containsBeanOfType(lite.spring.jdbc.JdbcTemplate.class)).isTrue();
            assertThat(withDataSource.containsBeanOfType(DatabaseActuatorController.class)).isTrue();
            assertThat(withDataSource.getBean(DatabaseActuatorController.class).database()).containsKey("status");
        }
    }

    @Test
    void supportsConditionalAnnotationsOnApplicationBeans() {
        try (AnnotationConfigApplicationContext context = runWithRandomPort(ConditionalBeansApplication.class)) {
            assertThat(context.containsBeanDefinition("classConditionBean")).isTrue();
            assertThat(context.containsBeanDefinition("propertyConditionBean")).isTrue();
            assertThat(context.containsBeanDefinition("missingClassConditionBean")).isFalse();
        }
    }

    @Test
    void usesCustomWebServerBeanWhenProvided() {
        RecordingWebServer.started = false;
        try (AnnotationConfigApplicationContext context = SpringLiteApplication.run(CustomWebServerApplication.class)) {
            assertThat(context.getBean(WebServer.class)).isInstanceOf(RecordingWebServer.class);
            assertThat(RecordingWebServer.started).isTrue();
        }
    }

    @Test
    void appliesCommandLinePropertyOverridesToBootInfrastructure() {
        try (AnnotationConfigApplicationContext context = SpringLiteApplication.run(
            ProfileAwareApplication.class,
            "--spring.profiles.active=local"
        )) {
            assertThat(context.getBeansOfType(lite.spring.boot.support.ApplicationProperties.class)).hasSize(1);
            assertThat(context.getBean(lite.spring.boot.support.ApplicationProperties.class).get("test.feature.name", "missing"))
                .isEqualTo("local-profile");
        }
    }

    @Test
    void appliesCommandLineProfileOverridesDuringBootstrap() {
        try (AnnotationConfigApplicationContext context = SpringLiteApplication.run(
            ProfileAwareApplication.class,
            "--server.port=0",
            "--spring.profiles.active=local"
        )) {
            assertThat(context.getBean(ProfileAwareBean.class).featureName()).isEqualTo("local-profile");
        }
    }

    @SpringLiteBootApplication
    static class BootTestApplication {
        @Bean
        BootSampleService bootSampleService() {
            return new BootSampleServiceImpl();
        }

        @Bean
        WebServerFactory webServerFactory() {
            return new TestWebServerFactory();
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

    @SpringLiteBootApplication
    static class TimedApplication {
        @Bean TimedService timedService() { return new TimedService(); }
        @Bean WebServerFactory webServerFactory() { return new TestWebServerFactory(); }
    }

    static class TimedService {
        @Timed
        String call() {
            return "ok";
        }

        @Timed("custom.failure")
        String fail() {
            return "failed";
        }
    }

    @SpringLiteBootApplication
    static class ApiDocsApplication {
        @Bean CatalogController catalogController() { return new CatalogController(); }
        @Bean WebServerFactory webServerFactory() { return new TestWebServerFactory(); }
    }

    @RestController
    @lite.spring.web.annotation.RequestMapping("/catalog")
    static class CatalogController {
        @GetMapping("/items/{id}")
        Item find(@PathVariable("id") long id, @RequestParam("verbose") boolean verbose) {
            return new Item(id, verbose ? "verbose" : "plain");
        }

        @lite.spring.web.annotation.PostMapping("/items")
        Item create(@RequestBody Item item) {
            return item;
        }
    }

    record Item(long id, String name) { }

    @SpringLiteBootApplication
    static class AspectApplication {
        @Bean
        AspectSampleService aspectSampleService() {
            return new AspectSampleService();
        }

        @Bean
        BootRecordingAspect bootRecordingAspect() {
            return new BootRecordingAspect();
        }

        @Bean
        WebServerFactory webServerFactory() {
            return new TestWebServerFactory();
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

    @SpringLiteBootApplication
    static class CustomJsonMapperApplication {
        @Bean("customJsonMapper")
        JsonMapper customJsonMapper() {
            return new JsonMapper();
        }

        @Bean
        WebServerFactory webServerFactory() {
            return new TestWebServerFactory();
        }
    }

    @SpringLiteBootApplication
    static class DataSourceApplication {
        @Bean
        DataSource dataSource() {
            return new DriverManagerDataSource("jdbc:h2:mem:boot-test;DB_CLOSE_DELAY=-1", "sa", "");
        }

        @Bean
        WebServerFactory webServerFactory() {
            return new TestWebServerFactory();
        }
    }

    @SpringLiteBootApplication
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

        @Bean
        WebServerFactory webServerFactory() {
            return new TestWebServerFactory();
        }
    }

    @SpringLiteBootApplication
    static class CustomWebServerApplication {
        @Bean
        WebServer webServer() {
            return new RecordingWebServer(9191);
        }
    }

    @SpringLiteBootApplication
    static class ProfileAwareApplication {
        @Bean
        ProfileAwareBean profileAwareBean(lite.spring.boot.support.ApplicationProperties properties) {
            return new ProfileAwareBean(properties.get("test.feature.name", "missing"));
        }

        @Bean
        WebServerFactory webServerFactory() {
            return new TestWebServerFactory();
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

    static final class TestWebServerFactory implements WebServerFactory {
        @Override
        public WebServer create(DispatcherServlet dispatcherServlet, int port) {
            return new TestWebServer(port);
        }
    }

    static final class TestWebServer implements WebServer {
        private final int port;
        private boolean started;

        private TestWebServer(int port) {
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
            started = false;
        }

        boolean started() {
            return started;
        }
    }

    static final class ProfileAwareBean {
        private final String featureName;

        private ProfileAwareBean(String featureName) {
            this.featureName = featureName;
        }

        String featureName() {
            return featureName;
        }
    }

    private AnnotationConfigApplicationContext runWithRandomPort(Class<?> applicationClass, String... args) {
        String[] commandLineArgs = new String[args.length + 1];
        commandLineArgs[0] = "--server.port=0";
        System.arraycopy(args, 0, commandLineArgs, 1, args.length);
        return SpringLiteApplication.run(applicationClass, commandLineArgs);
    }
}
