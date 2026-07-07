package lite.spring.boot;

import static org.assertj.core.api.Assertions.assertThat;

import lite.spring.boot.annotation.MiniSpringBootApplication;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Service;
import lite.spring.tx.annotation.Transactional;
import org.junit.jupiter.api.Test;

class MiniSpringApplicationTest {
    @Test
    void autoRegistersTransactionalInfrastructure() {
        try (AnnotationConfigApplicationContext context = MiniSpringApplication.run(BootTestApplication.class)) {
            BootSampleService service = context.getBean(BootSampleService.class);

            assertThat(service.call("ok")).isEqualTo("ok");
            assertThat(context.containsBeanOfType(lite.spring.tx.support.TransactionManager.class)).isTrue();
            assertThat(context.containsBeanOfType(lite.spring.tx.support.TransactionalBeanPostProcessor.class)).isTrue();
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
}
