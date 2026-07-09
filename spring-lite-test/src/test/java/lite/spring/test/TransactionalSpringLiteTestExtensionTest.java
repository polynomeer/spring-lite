package lite.spring.test;

import static org.assertj.core.api.Assertions.assertThat;

import lite.spring.context.ApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Configuration;
import lite.spring.tx.annotation.Transactional;
import lite.spring.tx.support.TransactionManager;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

@SpringLiteTest(classes = TransactionalSpringLiteTestExtensionTest.TransactionalTestConfig.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class TransactionalSpringLiteTestExtensionTest {
    @Test
    @Order(1)
    @Transactional
    void startsTransactionForTransactionalTestMethod(ApplicationContext context, TransactionalProbe probe) {
        assertThat(context.getBean(TransactionManager.class)).isSameAs(probe.transactionManager());
        assertThat(probe.transactionManager().isTransactionActive()).isTrue();
        assertThat(probe.transactionManager().beginCalls()).isEqualTo(1);
        assertThat(probe.transactionManager().rollbackCalls()).isEqualTo(0);
    }

    @Test
    @Order(2)
    void rollsBackTransactionAfterTransactionalTestMethod(TransactionalProbe probe) {
        assertThat(probe.transactionManager().beginCalls()).isEqualTo(1);
        assertThat(probe.transactionManager().rollbackCalls()).isEqualTo(1);
        assertThat(probe.transactionManager().isTransactionActive()).isFalse();
    }

    @Configuration
    static class TransactionalTestConfig {
        @Bean
        RecordingTransactionManager recordingTransactionManager() {
            return new RecordingTransactionManager();
        }

        @Bean
        TransactionalProbe transactionalProbe(RecordingTransactionManager transactionManager) {
            return new TransactionalProbe(transactionManager);
        }
    }

    static class TransactionalProbe {
        private final RecordingTransactionManager transactionManager;

        TransactionalProbe(RecordingTransactionManager transactionManager) {
            this.transactionManager = transactionManager;
        }

        RecordingTransactionManager transactionManager() {
            return transactionManager;
        }
    }

    static class RecordingTransactionManager extends TransactionManager {
        private int beginCalls;
        private int rollbackCalls;

        RecordingTransactionManager() {
            super(null);
        }

        @Override
        public void begin() {
            beginCalls++;
            super.begin();
        }

        @Override
        public void rollback() {
            rollbackCalls++;
            super.rollback();
        }

        int beginCalls() {
            return beginCalls;
        }

        int rollbackCalls() {
            return rollbackCalls;
        }
    }
}
