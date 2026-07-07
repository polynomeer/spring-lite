package lite.spring.tx.support;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import lite.spring.tx.annotation.Transactional;
import org.junit.jupiter.api.Test;

class TransactionalBeanPostProcessorTest {
    @Test
    void wrapsTransactionalInterfaceBeanAndCommitsOnSuccess() {
        RecordingTransactionManager transactionManager = new RecordingTransactionManager();
        TransactionalBeanPostProcessor processor = new TransactionalBeanPostProcessor(transactionManager);
        SampleService target = new SampleServiceImpl();

        SampleService proxied = (SampleService) processor.postProcessAfterInitialization("sampleService", target);
        String value = proxied.succeed("ok");

        assertThat(value).isEqualTo("ok");
        assertThat(proxied).isNotSameAs(target);
        assertThat(transactionManager.beginCalls).isEqualTo(1);
        assertThat(transactionManager.commitCalls).isEqualTo(1);
        assertThat(transactionManager.rollbackCalls).isZero();
    }

    @Test
    void rollsBackWhenTransactionalMethodThrows() {
        RecordingTransactionManager transactionManager = new RecordingTransactionManager();
        TransactionalBeanPostProcessor processor = new TransactionalBeanPostProcessor(transactionManager);
        SampleService proxied = (SampleService) processor.postProcessAfterInitialization("sampleService", new SampleServiceImpl());

        assertThatThrownBy(proxied::fail)
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("boom");

        assertThat(transactionManager.beginCalls).isEqualTo(1);
        assertThat(transactionManager.commitCalls).isZero();
        assertThat(transactionManager.rollbackCalls).isEqualTo(1);
    }

    @Test
    void leavesNonTransactionalBeanUntouched() {
        RecordingTransactionManager transactionManager = new RecordingTransactionManager();
        TransactionalBeanPostProcessor processor = new TransactionalBeanPostProcessor(transactionManager);
        PlainService target = new PlainService();

        Object bean = processor.postProcessAfterInitialization("plainService", target);

        assertThat(bean).isSameAs(target);
    }

    interface SampleService {
        String succeed(String input);

        String fail();
    }

    static class SampleServiceImpl implements SampleService {
        @Override
        @Transactional
        public String succeed(String input) {
            return input;
        }

        @Override
        @Transactional
        public String fail() {
            throw new IllegalStateException("boom");
        }
    }

    static class PlainService {
        String call() {
            return "plain";
        }
    }

    static class RecordingTransactionManager extends TransactionManager {
        private int beginCalls;
        private int commitCalls;
        private int rollbackCalls;

        RecordingTransactionManager() {
            super(null);
        }

        @Override
        public void begin() {
            beginCalls++;
        }

        @Override
        public void commit() {
            commitCalls++;
        }

        @Override
        public void rollback() {
            rollbackCalls++;
        }
    }
}

