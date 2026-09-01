package lite.spring.tx.support;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayDeque;
import java.util.Deque;
import javax.sql.DataSource;
import lite.spring.tx.annotation.Propagation;

public class TransactionManager {
    private final DataSource dataSource;
    private final ThreadLocal<Deque<TransactionContext>> transactionContexts = ThreadLocal.withInitial(ArrayDeque::new);

    public TransactionManager(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void begin() {
        begin(false);
    }

    public void begin(boolean readOnly) {
        begin(Propagation.REQUIRED, readOnly);
    }

    public void begin(Propagation propagation, boolean readOnly) {
        Deque<TransactionContext> contexts = transactionContexts.get();
        TransactionContext context = contexts.peek();
        if (propagation == Propagation.REQUIRED && context != null) {
            context.incrementDepth();
            return;
        }
        if (dataSource == null) {
            contexts.push(new TransactionContext(null, readOnly, false));
            return;
        }
        try {
            Connection connection = dataSource.getConnection();
            boolean originalReadOnly = connection.isReadOnly();
            connection.setReadOnly(readOnly);
            connection.setAutoCommit(false);
            contexts.push(new TransactionContext(connection, readOnly, originalReadOnly));
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to begin transaction", exception);
        }
    }

    public void commit() {
        Deque<TransactionContext> contexts = transactionContexts.get();
        TransactionContext context = contexts.peek();
        if (context == null) {
            return;
        }
        if (!context.decrementAndIsComplete()) {
            return;
        }
        if (context.connection() == null) {
            completeContext(contexts);
            return;
        }
        if (context.rollbackOnly()) {
            rollbackConnection(context);
            return;
        }
        try {
            context.connection().commit();
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to commit transaction", exception);
        } finally {
            cleanup(context);
        }
    }

    public void rollback() {
        Deque<TransactionContext> contexts = transactionContexts.get();
        TransactionContext context = contexts.peek();
        if (context == null) {
            return;
        }
        context.markRollbackOnly();
        if (!context.decrementAndIsComplete()) {
            return;
        }
        if (context.connection() == null) {
            completeContext(contexts);
            return;
        }
        rollbackConnection(context);
    }

    public boolean isTransactionActive() {
        return transactionContexts.get().peek() != null;
    }

    public Connection currentConnection() {
        TransactionContext context = transactionContexts.get().peek();
        return context == null ? null : context.connection();
    }

    private void rollbackConnection(TransactionContext context) {
        try {
            context.connection().rollback();
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to rollback transaction", exception);
        } finally {
            cleanup(context);
        }
    }

    private void cleanup(TransactionContext context) {
        try {
            Connection connection = context.connection();
            connection.setAutoCommit(true);
            connection.setReadOnly(context.originalReadOnly());
            connection.close();
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to close transaction connection", exception);
        } finally {
            completeContext(transactionContexts.get());
        }
    }

    private void completeContext(Deque<TransactionContext> contexts) {
        contexts.pop();
        if (contexts.isEmpty()) {
            transactionContexts.remove();
        }
    }

    private static final class TransactionContext {
        private final Connection connection;
        private final boolean readOnly;
        private final boolean originalReadOnly;
        private int depth = 1;
        private boolean rollbackOnly;

        private TransactionContext(Connection connection, boolean readOnly, boolean originalReadOnly) {
            this.connection = connection;
            this.readOnly = readOnly;
            this.originalReadOnly = originalReadOnly;
        }

        private Connection connection() {
            return connection;
        }

        private boolean originalReadOnly() { return originalReadOnly; }

        private void incrementDepth() {
            depth++;
        }

        private boolean decrementAndIsComplete() {
            depth--;
            return depth == 0;
        }

        private void markRollbackOnly() {
            rollbackOnly = true;
        }

        private boolean rollbackOnly() {
            return rollbackOnly;
        }
    }
}
