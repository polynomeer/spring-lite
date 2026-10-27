package lite.spring.example.lab;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedHashMap;
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

    private final DataSource dataSource;
    private final TransactionManager transactionManager;

    public LabDbSnapshotProvider(DataSource dataSource, TransactionManager transactionManager) {
        this.dataSource = dataSource;
        this.transactionManager = transactionManager;
    }

    public Map<String, String> snapshot(TraceEvent event) {
        boolean checkpoint = (event.layer() == TraceLayer.JDBC && JDBC_WRITES.contains(event.kind()))
            || (event.layer() == TraceLayer.TX && TX_COMPLETIONS.contains(event.kind()));
        if (!checkpoint) {
            return Map.of();
        }
        Map<String, String> snapshot = new LinkedHashMap<>();
        Connection current = transactionManager.currentConnection();
        if (current != null) {
            snapshot.put("orders.current", String.valueOf(countOrders(current)));
        }
        try (Connection other = dataSource.getConnection()) {
            snapshot.put("orders.other", String.valueOf(countOrders(other)));
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to open snapshot connection", exception);
        }
        return snapshot;
    }

    private long countOrders(Connection connection) {
        try (PreparedStatement statement = connection.prepareStatement(COUNT_ORDERS);
             ResultSet resultSet = statement.executeQuery()) {
            resultSet.next();
            return resultSet.getLong(1);
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to count orders for a lab snapshot", exception);
        }
    }
}
