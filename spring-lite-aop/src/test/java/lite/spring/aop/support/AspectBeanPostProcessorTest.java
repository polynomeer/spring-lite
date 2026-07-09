package lite.spring.aop.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.ArrayList;
import java.util.List;
import lite.spring.aop.MethodInvocation;
import lite.spring.aop.annotation.AfterReturning;
import lite.spring.aop.annotation.Around;
import lite.spring.aop.annotation.Aspect;
import lite.spring.aop.annotation.Before;
import lite.spring.context.ApplicationContext;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Configuration;
import org.junit.jupiter.api.Test;

class AspectBeanPostProcessorTest {
    @Test
    void appliesBeforeAroundAndAfterReturningAdviceInChain() {
        RecordingAspect.events.clear();
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(AspectTestConfig.class)) {
            GreetingService greetingService = context.getBean(GreetingService.class);

            String result = greetingService.greet("codex");

            assertThat(result).isEqualTo("hello codex!");
            assertThat(RecordingAspect.events).contains("before:greet", "before-annotated:greet");
            assertThat(RecordingAspect.events).containsSequence(
                "around-before:greet",
                "after-returning:hello codex",
                "around-after:greet"
            );
        }
    }

    @Test
    void appliesAnnotationBasedPointcutOnlyToAnnotatedMethods() {
        RecordingAspect.events.clear();
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(AspectTestConfig.class)) {
            GreetingService greetingService = context.getBean(GreetingService.class);

            greetingService.greet("codex");
            greetingService.plain();

            assertThat(RecordingAspect.events).contains("before-annotated:greet");
            assertThat(RecordingAspect.events).doesNotContain("before-annotated:plain");
        }
    }

    @Configuration
    static class AspectTestConfig {
        @Bean
        AspectBeanPostProcessor aspectBeanPostProcessor(ApplicationContext applicationContext) {
            return new AspectBeanPostProcessor(applicationContext);
        }

        @Bean
        GreetingService greetingService() {
            return new GreetingService();
        }

        @Bean
        RecordingAspect recordingAspect() {
            return new RecordingAspect();
        }
    }

    static class GreetingService {
        @Monitored
        public String greet(String name) {
            return "hello " + name;
        }

        public String plain() {
            return "plain";
        }
    }

    @Aspect
    static class RecordingAspect {
        private static final List<String> events = new ArrayList<>();

        @Before(methodName = "greet")
        void before(MethodInvocation invocation) {
            events.add("before:" + invocation.getMethod().getName());
        }

        @Before(annotation = Monitored.class)
        void beforeAnnotated(MethodInvocation invocation) {
            events.add("before-annotated:" + invocation.getMethod().getName());
        }

        @Around(methodName = "greet")
        Object around(MethodInvocation invocation) throws Throwable {
            events.add("around-before:" + invocation.getMethod().getName());
            Object result = invocation.proceed();
            events.add("around-after:" + invocation.getMethod().getName());
            return result + "!";
        }

        @AfterReturning(methodName = "greet")
        void afterReturning(String returnValue) {
            events.add("after-returning:" + returnValue);
        }
    }

    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @interface Monitored {
    }
}
