package samples.comparison.spring.lab.trace;

import javax.sql.DataSource;
import org.springframework.jdbc.support.JdbcTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.DefaultTransactionStatus;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Spring's own JDBC transaction manager with trace hooks on the physical transaction steps. It also
 * registers a {@link TransactionSynchronization} for every new transaction, which exposes callbacks
 * that spring-lite does not have.
 */
public class TracingTransactionManager extends JdbcTransactionManager {
    public TracingTransactionManager(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    protected void doBegin(Object transaction, TransactionDefinition definition) {
        super.doBegin(transaction, definition);
        ComparisonTrace.record("tx.begin", "tx", "DataSourceTransactionManager.doBegin bound a new connection to the thread.",
            "propagation", propagationName(definition.getPropagationBehavior()));
    }

    @Override
    protected void prepareSynchronization(DefaultTransactionStatus status, TransactionDefinition definition) {
        super.prepareSynchronization(status, definition);
        if (status.isNewSynchronization() && ComparisonTrace.isActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TracingSynchronization());
            ComparisonTrace.record("tx.sync.register", "tx", "Synchronization activated; a TransactionSynchronization was registered.");
        }
    }

    @Override
    protected void doCommit(DefaultTransactionStatus status) {
        super.doCommit(status);
        ComparisonTrace.record("tx.commit", "tx", "Connection.commit() completed.");
    }

    @Override
    protected void doRollback(DefaultTransactionStatus status) {
        super.doRollback(status);
        ComparisonTrace.record("tx.rollback", "tx", "Connection.rollback() completed.");
    }

    @Override
    protected void doCleanupAfterCompletion(Object transaction) {
        super.doCleanupAfterCompletion(transaction);
        ComparisonTrace.record("tx.cleanup", "tx", "Connection unbound from the thread and returned to the pool.");
    }

    private static String propagationName(int behavior) {
        return switch (behavior) {
            case TransactionDefinition.PROPAGATION_REQUIRED -> "REQUIRED";
            case TransactionDefinition.PROPAGATION_REQUIRES_NEW -> "REQUIRES_NEW";
            default -> String.valueOf(behavior);
        };
    }

    private static final class TracingSynchronization implements TransactionSynchronization {
        @Override
        public void beforeCommit(boolean readOnly) {
            ComparisonTrace.record("tx.sync.before-commit", "tx", "TransactionSynchronization.beforeCommit callback.");
        }

        @Override
        public void beforeCompletion() {
            ComparisonTrace.record("tx.sync.before-completion", "tx", "TransactionSynchronization.beforeCompletion callback.");
        }

        @Override
        public void afterCommit() {
            ComparisonTrace.record("tx.sync.after-commit", "tx", "TransactionSynchronization.afterCommit callback.");
        }

        @Override
        public void afterCompletion(int status) {
            ComparisonTrace.record("tx.sync.after-completion", "tx", "TransactionSynchronization.afterCompletion callback.",
                "status", status == STATUS_COMMITTED ? "committed" : status == STATUS_ROLLED_BACK ? "rolled back" : "unknown");
        }
    }
}
