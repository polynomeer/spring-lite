package lite.spring.context;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Proxy;
import java.util.List;
import lite.spring.context.factory.BeanPostProcessor;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Component;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.annotation.PostConstruct;
import lite.spring.core.exception.BeansException;
import lite.spring.core.trace.TraceEvent;
import org.junit.jupiter.api.Test;

class ContainerTraceTest {
    @Test
    void recordsLifecycleStepsForEachBeanDuringRefresh() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(LifecycleConfig.class)) {
            List<TraceEvent> greeter = eventsFor(context, "greeter");

            assertThat(greeter).extracting(TraceEvent::kind)
                .containsExactly("create", "instantiate", "init", "post-process", "ready");
            assertThat(greeter.get(1).attributes()).containsEntry("dependencies", "greetingRepository");
            assertThat(greeter.get(3).marker()).isEqualTo("proxy");
            assertThat(greeter.get(3).attributes())
                .containsEntry("processors", "WrappingProcessor:replaced")
                .containsEntry("proxied", "true");
        }
    }

    @Test
    void nestsDependencyCreationInsideTheDependentBeansFrame() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(Dependent.class, Dependency.class)) {
            TraceEvent dependencyCreate = context.getRefreshTrace().stream()
                .filter(event -> "create".equals(event.kind()) && "dependency".equals(event.attributes().get("bean")))
                .findFirst()
                .orElseThrow();

            assertThat(dependencyCreate.stack()).containsExactly("dependent", "dependency");
        }
    }

    @Test
    void exposesDependenciesInRuntimeDescriptors() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(LifecycleConfig.class)) {
            BeanRuntimeDescriptor greeter = context.getBeanRuntimeDescriptors().stream()
                .filter(descriptor -> descriptor.name().equals("greeter"))
                .findFirst()
                .orElseThrow();

            assertThat(greeter.dependencies()).containsExactly("greetingRepository");
            assertThat(greeter.proxied()).isTrue();
        }
    }

    @Test
    void keepsTheRefreshTraceWhenACycleStopsStartup() {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(CycleA.class, CycleB.class);

        assertThatThrownBy(context::refresh).isInstanceOf(BeansException.class);
        assertThat(context.getRefreshTrace())
            .filteredOn(event -> "cycle".equals(event.kind()))
            .singleElement()
            .satisfies(event -> assertThat(event.attributes().get("path")).contains("->"));
    }

    private static List<TraceEvent> eventsFor(ApplicationContext context, String beanName) {
        return context.getRefreshTrace().stream()
            .filter(event -> beanName.equals(event.attributes().get("bean")))
            .toList();
    }

    interface Greeter {
        String greet();
    }

    static class GreetingRepository {
        String word() {
            return "hello";
        }
    }

    static class GreetingService implements Greeter {
        private final GreetingRepository repository;
        private boolean initialized;

        GreetingService(GreetingRepository repository) {
            this.repository = repository;
        }

        @PostConstruct
        void initialize() {
            initialized = true;
        }

        @Override
        public String greet() {
            return initialized ? repository.word() : "not ready";
        }
    }

    static class WrappingProcessor implements BeanPostProcessor {
        @Override
        public Object postProcessAfterInitialization(String beanName, Object bean) {
            if (!(bean instanceof Greeter greeter)) {
                return bean;
            }
            return Proxy.newProxyInstance(
                Greeter.class.getClassLoader(),
                new Class<?>[]{Greeter.class},
                (proxy, method, args) -> method.invoke(greeter, args)
            );
        }
    }

    @Configuration
    static class LifecycleConfig {
        @Bean
        WrappingProcessor wrappingProcessor() {
            return new WrappingProcessor();
        }

        @Bean
        GreetingRepository greetingRepository() {
            return new GreetingRepository();
        }

        @Bean
        Greeter greeter(GreetingRepository greetingRepository) {
            return new GreetingService(greetingRepository);
        }
    }

    @Component
    static class Dependent {
        Dependent(Dependency dependency) {
        }
    }

    @Component
    static class Dependency {
    }

    @Component
    static class CycleA {
        CycleA(CycleB cycleB) {
        }
    }

    @Component
    static class CycleB {
        CycleB(CycleA cycleA) {
        }
    }
}
