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

    @Test
    void proxiesTransactionalConcreteClassWithoutInterface() {
        RecordingTransactionManager transactionManager = new RecordingTransactionManager();
        TransactionalBeanPostProcessor processor = new TransactionalBeanPostProcessor(transactionManager);
        ConcreteTransactionalService target = new ConcreteTransactionalService();

        ConcreteTransactionalService proxied =
            (ConcreteTransactionalService) processor.postProcessAfterInitialization("concreteTransactionalService", target);
        String result = proxied.call("ok");

        assertThat(result).isEqualTo("ok");
        assertThat(proxied).isNotSameAs(target);
        assertThat(transactionManager.beginCalls).isEqualTo(1);
        assertThat(transactionManager.commitCalls).isEqualTo(1);
        assertThat(transactionManager.rollbackCalls).isZero();
    }

    @Test
    void commitsWhenExceptionMatchesNoRollbackRule() {
        RecordingTransactionManager transactionManager = new RecordingTransactionManager();
        TransactionalBeanPostProcessor processor = new TransactionalBeanPostProcessor(transactionManager);
        SampleService proxied = (SampleService) processor.postProcessAfterInitialization("sampleService", new SampleServiceImpl());

        assertThatThrownBy(proxied::failWithoutRollback)
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("skip rollback");

        assertThat(transactionManager.beginCalls).isEqualTo(1);
        assertThat(transactionManager.commitCalls).isEqualTo(1);
        assertThat(transactionManager.rollbackCalls).isZero();
    }

    @Test
    void rollsBackWhenExceptionMatchesRollbackForRule() {
        RecordingTransactionManager transactionManager = new RecordingTransactionManager();
        TransactionalBeanPostProcessor processor = new TransactionalBeanPostProcessor(transactionManager);
        SampleService proxied = (SampleService) processor.postProcessAfterInitialization("sampleService", new SampleServiceImpl());

        assertThatThrownBy(proxied::failChecked)
            .isInstanceOf(CheckedFailureException.class)
            .hasMessageContaining("checked");

        assertThat(transactionManager.beginCalls).isEqualTo(1);
        assertThat(transactionManager.commitCalls).isZero();
        assertThat(transactionManager.rollbackCalls).isEqualTo(1);
    }

    interface SampleService {
        String succeed(String input);

        String fail();

        String failWithoutRollback();

        String failChecked() throws CheckedFailureException;
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

        @Override
        @Transactional(noRollbackFor = IllegalArgumentException.class)
        public String failWithoutRollback() {
            throw new IllegalArgumentException("skip rollback");
        }

        @Override
        @Transactional(rollbackFor = CheckedFailureException.class)
        public String failChecked() throws CheckedFailureException {
            throw new CheckedFailureException("checked");
        }
    }

    static class PlainService {
        String call() {
            return "plain";
        }
    }

    public static class ConcreteTransactionalService {
        @Transactional
        public String call(String value) {
            return value;
        }
    }

    static class CheckedFailureException extends Exception {
        CheckedFailureException(String message) {
            super(message);
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
