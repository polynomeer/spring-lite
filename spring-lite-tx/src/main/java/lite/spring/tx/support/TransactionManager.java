package lite.spring.tx.support;

import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;

public class TransactionManager {
    private final DataSource dataSource;
    private final ThreadLocal<TransactionContext> transactionContext = new ThreadLocal<>();

    public TransactionManager(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void begin() {
        begin(false);
    }

    public void begin(boolean readOnly) {
        TransactionContext context = transactionContext.get();
        if (context != null) {
            context.incrementDepth();
            return;
        }
        if (dataSource == null) {
            transactionContext.set(new TransactionContext(null, readOnly, false));
            return;
        }
        try {
            Connection connection = dataSource.getConnection();
            boolean originalReadOnly = connection.isReadOnly();
            connection.setReadOnly(readOnly);
            connection.setAutoCommit(false);
            transactionContext.set(new TransactionContext(connection, readOnly, originalReadOnly));
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to begin transaction", exception);
        }
    }

    public void commit() {
        TransactionContext context = transactionContext.get();
        if (context == null) {
            return;
        }
        if (!context.decrementAndIsComplete()) {
            return;
        }
        if (context.connection() == null) {
            transactionContext.remove();
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
        TransactionContext context = transactionContext.get();
        if (context == null) {
            return;
        }
        context.markRollbackOnly();
        if (!context.decrementAndIsComplete()) {
            return;
        }
        if (context.connection() == null) {
            transactionContext.remove();
            return;
        }
        rollbackConnection(context);
    }

    public boolean isTransactionActive() {
        return transactionContext.get() != null;
    }

    public Connection currentConnection() {
        TransactionContext context = transactionContext.get();
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
            transactionContext.remove();
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
