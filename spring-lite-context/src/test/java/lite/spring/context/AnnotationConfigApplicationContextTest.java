package lite.spring.context;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Proxy;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicBoolean;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.context.event.ApplicationListener;
import lite.spring.context.event.ContextClosedEvent;
import lite.spring.context.event.ContextRefreshedEvent;
import lite.spring.context.factory.BeanPostProcessor;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.ComponentScan;
import lite.spring.core.annotation.ConditionalOnBean;
import lite.spring.core.annotation.ConditionalOnMissingBean;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.annotation.PostConstruct;
import lite.spring.core.annotation.PreDestroy;
import lite.spring.core.annotation.Qualifier;
import lite.spring.core.annotation.Scope;
import lite.spring.core.annotation.Value;
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
    void resolvesDependencyByQualifierUsingBeanName() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(QualifierByNameConfig.class)) {
            QualifiedFormatterClient client = context.getBean(QualifiedFormatterClient.class);

            assertThat(client.value()).isEqualTo("second");
        }
    }

    @Test
    void resolvesDependencyByQualifierAnnotationOnBeanDefinition() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(QualifierByAnnotationConfig.class)) {
            QualifiedFormatterClient client = context.getBean(QualifiedFormatterClient.class);

            assertThat(client.value()).isEqualTo("special");
        }
    }

    @Test
    void throwsWhenQualifierHasNoMatchingBean() {
        assertThatThrownBy(() -> new AnnotationConfigApplicationContext(MissingQualifierConfig.class))
            .isInstanceOf(NoSuchBeanException.class)
            .hasMessageContaining("with qualifier missing");
    }

    @Test
    void injectsValueIntoConstructorParametersAndFields() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ValueConfig.class)) {
            ValueClient client = context.getBean(ValueClient.class);
            FieldValueBean fieldValueBean = context.getBean(FieldValueBean.class);

            assertThat(client.message()).isEqualTo("hello-from-properties");
            assertThat(client.enabled()).isTrue();
            assertThat(client.count()).isEqualTo(42);
            assertThat(client.defaultValue()).isEqualTo("fallback");
            assertThat(fieldValueBean.message()).isEqualTo("hello-from-properties");
        }
    }

    @Test
    void failsWhenRequiredValueIsMissing() {
        assertThatThrownBy(() -> new AnnotationConfigApplicationContext(MissingValueConfig.class))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Missing required property");
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
    void invokesDestroyCallbacksForBeansWrappedByPostProcessors() {
        ProxyDestroyConfig.target = null;

        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ProxyDestroyConfig.class)) {
            ProxiedService service = context.getBean(ProxiedService.class);

            assertThat(service.message()).isEqualTo("proxied");
            assertThat(ProxyDestroyConfig.target).isNotNull();
            assertThat(ProxyDestroyConfig.target.destroyed.get()).isFalse();
        }

        assertThat(ProxyDestroyConfig.target.destroyed.get()).isTrue();
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

    @Test
    void createsPrototypeBeansOnEachLookup() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(PrototypeConfig.class)) {
            PrototypeBean first = context.getBean(PrototypeBean.class);
            PrototypeBean second = context.getBean(PrototypeBean.class);

            assertThat(first).isNotSameAs(second);
        }
    }

    @Test
    void keepsSingletonBeansCachedByDefault() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(PrototypeConfig.class)) {
            SingletonBean first = context.getBean(SingletonBean.class);
            SingletonBean second = context.getBean(SingletonBean.class);

            assertThat(first).isSameAs(second);
        }
    }

    @Test
    void exposesReadOnlyBeanRuntimeDescriptorsWithoutCreatingPrototypes() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(PrototypeConfig.class)) {
            BeanRuntimeDescriptor prototype = context.getBeanRuntimeDescriptors().stream()
                .filter(descriptor -> descriptor.name().equals("prototypeBean"))
                .findFirst()
                .orElseThrow();
            BeanRuntimeDescriptor singleton = context.getBeanRuntimeDescriptors().stream()
                .filter(descriptor -> descriptor.name().equals("singletonBean"))
                .findFirst()
                .orElseThrow();

            assertThat(prototype.singleton()).isFalse();
            assertThat(prototype.instantiated()).isFalse();
            assertThat(singleton.singleton()).isTrue();
            assertThat(singleton.instantiated()).isTrue();
        }
    }

    @Test
    void publishesRefreshAndCloseEventsToListeners() {
        EventCollectorListener listener;

        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(EventConfig.class)) {
            listener = context.getBean(EventCollectorListener.class);

            assertThat(listener.events()).containsExactly("refreshed");
        }

        assertThat(listener.events()).containsExactly("refreshed", "closed");
    }

    @Test
    void appliesActiveProfileOverridesAndEnumValueConversion() {
        String previousProfiles = System.getProperty("spring.profiles.active");
        System.setProperty("spring.profiles.active", "local");
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ProfileValueConfig.class)) {
            ProfileValueClient client = context.getBean(ProfileValueClient.class);

            assertThat(client.message()).isEqualTo("hello-from-local-profile");
            assertThat(client.mode()).isEqualTo(Mode.ADVANCED);
        } finally {
            restoreProperty("spring.profiles.active", previousProfiles);
        }
    }

    @Test
    void evaluatesConditionalOnBeanAfterAllDefinitionsAreRegistered() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(
            ConditionalOnBeanConsumerConfig.class,
            ConditionalOnBeanProviderConfig.class
        )) {
            assertThat(context.containsBeanDefinition("dependentBean")).isTrue();
            assertThat(context.getBean(DependentBean.class).message()).isEqualTo("dependency-ready");
        }
    }

    @Test
    void backsOffConditionalOnMissingBeanWhenLaterDefinitionExists() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(
            ConditionalDefaultFormatterConfig.class,
            UserFormatterConfig.class
        )) {
            assertThat(context.containsBeanDefinition("defaultFormatter")).isFalse();
            assertThat(context.getBeansOfType(Formatter.class)).hasSize(1).containsKey("userFormatter");
            assertThat(context.getBean(Formatter.class).value()).isEqualTo("user");
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
    static class QualifierByNameConfig {
        @Bean
        Formatter firstFormatter() {
            return () -> "first";
        }

        @Bean
        Formatter secondFormatter() {
            return () -> "second";
        }

        @Bean
        QualifiedFormatterClient qualifiedFormatterClient(@Qualifier("secondFormatter") Formatter formatter) {
            return new QualifiedFormatterClient(formatter);
        }
    }

    @Configuration
    static class QualifierByAnnotationConfig {
        @Bean
        Formatter plainFormatter() {
            return () -> "plain";
        }

        @Bean
        @Qualifier("special")
        Formatter specialFormatter() {
            return () -> "special";
        }

        @Bean
        QualifiedFormatterClient qualifiedFormatterClient(@Qualifier("special") Formatter formatter) {
            return new QualifiedFormatterClient(formatter);
        }
    }

    @Configuration
    static class MissingQualifierConfig {
        @Bean
        Formatter onlyFormatter() {
            return () -> "only";
        }

        @Bean
        QualifiedFormatterClient qualifiedFormatterClient(@Qualifier("missing") Formatter formatter) {
            return new QualifiedFormatterClient(formatter);
        }
    }

    @Configuration
    static class ValueConfig {
        @Bean
        ValueClient valueClient(
            @Value("${app.greeting.message}") String message,
            @Value("${app.feature.enabled}") boolean enabled,
            @Value("${app.answer.count}") int count,
            @Value("${app.greeting.default:fallback}") String defaultValue
        ) {
            return new ValueClient(message, enabled, count, defaultValue);
        }

        @Bean
        FieldValueBean fieldValueBean() {
            return new FieldValueBean();
        }
    }

    @Configuration
    static class MissingValueConfig {
        @Bean
        MissingValueClient missingValueClient(@Value("${app.missing.value}") String value) {
            return new MissingValueClient(value);
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

    @Configuration
    static class PrototypeConfig {
        @Bean
        @Scope("prototype")
        PrototypeBean prototypeBean() {
            return new PrototypeBean();
        }

        @Bean
        SingletonBean singletonBean() {
            return new SingletonBean();
        }
    }

    @Configuration
    static class EventConfig {
        @Bean
        EventCollectorListener eventCollectorListener() {
            return new EventCollectorListener();
        }
    }

    @Configuration
    static class ProfileValueConfig {
        @Bean
        ProfileValueClient profileValueClient(
            @Value("${app.greeting.message}") String message,
            @Value("${app.mode}") Mode mode
        ) {
            return new ProfileValueClient(message, mode);
        }
    }

    @Configuration
    static class ProxyDestroyConfig {
        private static ProxiedDestroyAwareService target;

        @Bean
        ProxiedDestroyAwareService proxiedDestroyAwareService() {
            target = new ProxiedDestroyAwareService();
            return target;
        }

        @Bean
        BeanPostProcessor proxyingBeanPostProcessor() {
            return new ProxyingBeanPostProcessor();
        }
    }

    @Configuration
    static class ConditionalOnBeanConsumerConfig {
        @Bean
        @ConditionalOnBean(DependencyBean.class)
        DependentBean dependentBean() {
            return new DependentBean("dependency-ready");
        }
    }

    @Configuration
    static class ConditionalOnBeanProviderConfig {
        @Bean
        DependencyBean dependencyBean() {
            return new DependencyBean();
        }
    }

    @Configuration
    static class ConditionalDefaultFormatterConfig {
        @Bean
        @ConditionalOnMissingBean(Formatter.class)
        Formatter defaultFormatter() {
            return () -> "default";
        }
    }

    @Configuration
    static class UserFormatterConfig {
        @Bean
        Formatter userFormatter() {
            return () -> "user";
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

    interface Formatter {
        String value();
    }

    static class QualifiedFormatterClient {
        private final Formatter formatter;

        QualifiedFormatterClient(Formatter formatter) {
            this.formatter = formatter;
        }

        String value() {
            return formatter.value();
        }
    }

    static class ValueClient {
        private final String message;
        private final boolean enabled;
        private final int count;
        private final String defaultValue;

        ValueClient(String message, boolean enabled, int count, String defaultValue) {
            this.message = message;
            this.enabled = enabled;
            this.count = count;
            this.defaultValue = defaultValue;
        }

        String message() {
            return message;
        }

        boolean enabled() {
            return enabled;
        }

        int count() {
            return count;
        }

        String defaultValue() {
            return defaultValue;
        }
    }

    static class FieldValueBean {
        @Value("${app.greeting.message}")
        private String message;

        String message() {
            return message;
        }
    }

    static class MissingValueClient {
        MissingValueClient(String value) {
        }
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

    interface ProxiedService {
        String message();
    }

    static class ProxiedDestroyAwareService implements ProxiedService {
        private final AtomicBoolean destroyed = new AtomicBoolean();

        @Override
        public String message() {
            return "proxied";
        }

        @PreDestroy
        void destroy() {
            destroyed.set(true);
        }
    }

    static class ProxyingBeanPostProcessor implements BeanPostProcessor {
        @Override
        public Object postProcessAfterInitialization(String beanName, Object bean) {
            if (!(bean instanceof ProxiedDestroyAwareService target)) {
                return bean;
            }
            return Proxy.newProxyInstance(
                target.getClass().getClassLoader(),
                new Class<?>[]{ProxiedService.class},
                (proxy, method, args) -> method.invoke(target, args)
            );
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

    static class DependencyBean {
    }

    static class DependentBean {
        private final String message;

        DependentBean(String message) {
            this.message = message;
        }

        String message() {
            return message;
        }
    }

    static class PrototypeBean {
    }

    static class SingletonBean {
    }

    static class EventCollectorListener implements ApplicationListener<Object> {
        private final CopyOnWriteArrayList<String> events = new CopyOnWriteArrayList<>();

        @Override
        public void onApplicationEvent(Object event) {
            if (event instanceof ContextRefreshedEvent) {
                events.add("refreshed");
            }
            if (event instanceof ContextClosedEvent) {
                events.add("closed");
            }
        }

        java.util.List<String> events() {
            return events;
        }
    }

    static class ProfileValueClient {
        private final String message;
        private final Mode mode;

        ProfileValueClient(String message, Mode mode) {
            this.message = message;
            this.mode = mode;
        }

        String message() {
            return message;
        }

        Mode mode() {
            return mode;
        }
    }

    enum Mode {
        BASIC,
        ADVANCED
    }

    private void restoreProperty(String key, String value) {
        if (value == null) {
            System.clearProperty(key);
            return;
        }
        System.setProperty(key, value);
    }
}
