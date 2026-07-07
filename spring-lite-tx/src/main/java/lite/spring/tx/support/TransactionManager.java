package lite.spring.tx.support;

import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;

public class TransactionManager {
    private final DataSource dataSource;
    private final ThreadLocal<ConnectionHolder> connectionHolder = new ThreadLocal<>();

    public TransactionManager(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void begin() {
        if (connectionHolder.get() != null) {
            return;
        }
        if (dataSource == null) {
            connectionHolder.set(new ConnectionHolder(null));
            return;
        }
        try {
            Connection connection = dataSource.getConnection();
            connection.setAutoCommit(false);
            connectionHolder.set(new ConnectionHolder(connection));
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to begin transaction", exception);
        }
    }

    public void commit() {
        ConnectionHolder holder = connectionHolder.get();
        if (holder == null) {
            return;
        }
        if (holder.connection() == null) {
            connectionHolder.remove();
            return;
        }
        try {
            holder.connection().commit();
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to commit transaction", exception);
        } finally {
            cleanup(holder.connection());
        }
    }

    public void rollback() {
        ConnectionHolder holder = connectionHolder.get();
        if (holder == null) {
            return;
        }
        if (holder.connection() == null) {
            connectionHolder.remove();
            return;
        }
        try {
            holder.connection().rollback();
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to rollback transaction", exception);
        } finally {
            cleanup(holder.connection());
        }
    }

    public Connection currentConnection() {
        ConnectionHolder holder = connectionHolder.get();
        return holder == null ? null : holder.connection();
    }

    private void cleanup(Connection connection) {
        try {
            connection.setAutoCommit(true);
            connection.close();
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to close transaction connection", exception);
        } finally {
            connectionHolder.remove();
        }
    }
}
