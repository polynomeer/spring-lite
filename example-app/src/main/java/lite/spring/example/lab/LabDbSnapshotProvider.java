package lite.spring.example.lab;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.sql.DataSource;
import lite.spring.core.annotation.Component;
import lite.spring.core.trace.TraceEvent;
import lite.spring.core.trace.TraceLayer;
import lite.spring.tx.support.TransactionManager;

/**
 * Captures how many order rows two observers see right after a write or a transaction completes:
 * the transaction's own connection ({@code orders.current}) and an unrelated new connection
 * ({@code orders.other}). The gap between them is uncommitted work.
 */
@Component
public class LabDbSnapshotProvider {
    private static final Set<String> JDBC_WRITES = Set.of("update", "batch");
    private static final Set<String> TX_COMPLETIONS = Set.of("commit", "rollback");
    private static final String COUNT_ORDERS = "select count(*) from orders";
    private static final String COUNT_SANDBOX_ROWS = "select count(*) from lab_sandbox_row where run_id = ? and target_table = ?";

    private final DataSource dataSource;
    private final TransactionManager transactionManager;

    public LabDbSnapshotProvider(DataSource dataSource, TransactionManager transactionManager) {
        this.dataSource = dataSource;
        this.transactionManager = transactionManager;
    }

    public Map<String, String> snapshot(TraceEvent event) {
        if (!isCheckpoint(event)) {
            return Map.of();
        }
        return capture(List.of("orders"), (connection, table) -> count(connection, COUNT_ORDERS));
    }

    /** Same as {@link #snapshot} but counts one sandbox run's rows in each of {@code tables}. */
    public Map<String, String> sandboxSnapshot(TraceEvent event, String runId, List<String> tables) {
        if (!isCheckpoint(event)) {
            return Map.of();
        }
        return capture(tables, (connection, table) -> count(connection, COUNT_SANDBOX_ROWS, runId, table));
    }

    private boolean isCheckpoint(TraceEvent event) {
        return (event.layer() == TraceLayer.JDBC && JDBC_WRITES.contains(event.kind()))
            || (event.layer() == TraceLayer.TX && TX_COMPLETIONS.contains(event.kind()));
    }

    private Map<String, String> capture(List<String> tables, RowCounter counter) {
        Map<String, String> snapshot = new LinkedHashMap<>();
        Connection current = transactionManager.currentConnection();
        try (Connection other = dataSource.getConnection()) {
            for (String table : tables) {
                if (current != null) {
                    snapshot.put(table + ".current", String.valueOf(counter.count(current, table)));
                }
                snapshot.put(table + ".other", String.valueOf(counter.count(other, table)));
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to open snapshot connection", exception);
        }
        return snapshot;
    }

    private long count(Connection connection, String sql, Object... args) {
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            for (int index = 0; index < args.length; index++) {
                statement.setObject(index + 1, args[index]);
            }
            try (ResultSet resultSet = statement.executeQuery()) {
                resultSet.next();
                return resultSet.getLong(1);
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to count rows for a lab snapshot", exception);
        }
    }

    @FunctionalInterface
    private interface RowCounter {
        long count(Connection connection, String table);
    }
}
