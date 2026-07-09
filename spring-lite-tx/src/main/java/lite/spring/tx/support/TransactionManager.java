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
        TransactionContext context = transactionContext.get();
        if (context != null) {
            context.incrementDepth();
            return;
        }
        if (dataSource == null) {
            transactionContext.set(new TransactionContext(null));
            return;
        }
        try {
            Connection connection = dataSource.getConnection();
            connection.setAutoCommit(false);
            transactionContext.set(new TransactionContext(connection));
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
            rollbackConnection(context.connection());
            return;
        }
        try {
            context.connection().commit();
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to commit transaction", exception);
        } finally {
            cleanup(context.connection());
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
        rollbackConnection(context.connection());
    }

    public boolean isTransactionActive() {
        return transactionContext.get() != null;
    }

    public Connection currentConnection() {
        TransactionContext context = transactionContext.get();
        return context == null ? null : context.connection();
    }

    private void rollbackConnection(Connection connection) {
        try {
            connection.rollback();
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to rollback transaction", exception);
        } finally {
            cleanup(connection);
        }
    }

    private void cleanup(Connection connection) {
        try {
            connection.setAutoCommit(true);
            connection.close();
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to close transaction connection", exception);
        } finally {
            transactionContext.remove();
        }
    }

    private static final class TransactionContext {
        private final Connection connection;
        private int depth = 1;
        private boolean rollbackOnly;

        private TransactionContext(Connection connection) {
            this.connection = connection;
        }

        private Connection connection() {
            return connection;
        }

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
