package lite.spring.tx.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import lite.spring.aop.MethodInvocation;
import lite.spring.aop.annotation.Around;
import lite.spring.aop.annotation.Aspect;
import lite.spring.aop.support.AspectBeanPostProcessor;
import lite.spring.context.ApplicationContext;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.annotation.Order;
import lite.spring.tx.annotation.Transactional;
import org.junit.jupiter.api.Test;

class TransactionalAspectChainTest {
    @Test
    void composesOrderedAspectsAndTransactionalInterceptorIntoSingleChain() {
        OrderedAroundAspect.events.clear();
        RecordingTransactionManager.events.clear();
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(OrderedChainConfig.class)) {
            OrderedGreetingService greetingService = context.getBean(OrderedGreetingService.class);

            String result = greetingService.greet("codex");

            assertThat(result).isEqualTo("hello codex");
            assertThat(OrderedAroundAspect.events).containsExactly(
                "outer-before:greet",
                "inner-before:greet",
                "inner-after:greet",
                "outer-after:greet"
            );
            assertThat(RecordingTransactionManager.events).containsExactly("tx-begin", "tx-commit");
        }
    }

    @Configuration
    static class OrderedChainConfig {
        @Bean
        AspectBeanPostProcessor aspectBeanPostProcessor(ApplicationContext applicationContext) {
            return new AspectBeanPostProcessor(applicationContext);
        }

        @Bean
        TransactionalBeanPostProcessor transactionalBeanPostProcessor(RecordingTransactionManager transactionManager) {
            return new TransactionalBeanPostProcessor(transactionManager);
        }

        @Bean
        RecordingTransactionManager recordingTransactionManager() {
            return new RecordingTransactionManager();
        }

        @Bean
        OrderedGreetingService orderedGreetingService() {
            return new OrderedGreetingService();
        }

        @Bean
        @Order(-10)
        OrderedAroundAspect outerAspect() {
            return new OrderedAroundAspect("outer");
        }

        @Bean
        @Order(10)
        OrderedAroundAspect innerAspect() {
            return new OrderedAroundAspect("inner");
        }
    }

    static class OrderedGreetingService {
        @Transactional
        public String greet(String name) {
            return "hello " + name;
        }
    }

    @Aspect
    static class OrderedAroundAspect {
        private static final List<String> events = new ArrayList<>();
        private final String label;

        OrderedAroundAspect(String label) {
            this.label = label;
        }

        @Around(methodName = "greet")
        Object around(MethodInvocation invocation) throws Throwable {
            events.add(label + "-before:" + invocation.getMethod().getName());
            Object result = invocation.proceed();
            events.add(label + "-after:" + invocation.getMethod().getName());
            return result;
        }
    }

    static class RecordingTransactionManager extends TransactionManager {
        private static final List<String> events = new ArrayList<>();

        RecordingTransactionManager() {
            super(null);
        }

        @Override
        public void begin() {
            events.add("tx-begin");
        }

        @Override
        public void commit() {
            events.add("tx-commit");
        }

        @Override
        public void rollback() {
            events.add("tx-rollback");
        }
    }
}
