package lite.spring.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import javax.sql.DataSource;
import lite.spring.core.trace.TraceLayer;
import lite.spring.core.trace.TraceRecorder;
import lite.spring.tx.support.TransactionManager;

public class JdbcTemplate {
    private final DataSource dataSource;
    private final TransactionManager transactionManager;

    public JdbcTemplate(DataSource dataSource, TransactionManager transactionManager) {
        this.dataSource = dataSource;
        this.transactionManager = transactionManager;
    }

    public int update(String sql, Object... args) {
        try (
            Connection connection = obtainConnectionIfNeeded();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            bind(statement, args);
            int updated = statement.executeUpdate();
            trace("update", sql, updated);
            if (transactionManager.currentConnection() != null) {
                statement.close();
            }
            return updated;
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to execute update: " + sql, exception);
        }
    }

    /** Executes one prepared statement for each argument set and returns JDBC update counts. */
    public int[] batchUpdate(String sql, List<Object[]> batchArguments) {
        if (batchArguments.isEmpty()) {
            return new int[0];
        }
        try (
            Connection connection = obtainConnectionIfNeeded();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            for (Object[] arguments : batchArguments) {
                bind(statement, arguments);
                statement.addBatch();
            }
            int[] counts = statement.executeBatch();
            trace("batch", sql, counts.length);
            return counts;
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to execute batch update: " + sql, exception);
        }
    }

    public <T> List<T> query(String sql, RowMapper<T> rowMapper, Object... args) {
        try (
            Connection connection = obtainConnectionIfNeeded();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            bind(statement, args);
            try (ResultSet resultSet = statement.executeQuery()) {
                List<T> results = new ArrayList<>();
                while (resultSet.next()) {
                    results.add(rowMapper.mapRow(resultSet));
                }
                trace("query", sql, results.size());
                return results;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to execute query: " + sql, exception);
        }
    }

    public <T> T queryForObject(String sql, RowMapper<T> rowMapper, Object... args) {
        List<T> results = query(sql, rowMapper, args);
        return results.isEmpty() ? null : results.getFirst();
    }

    private Connection obtainConnectionIfNeeded() throws SQLException {
        Connection current = transactionManager.currentConnection();
        if (current != null) {
            return new SingleConnectionProxy(current);
        }
        return dataSource.getConnection();
    }

    private void trace(String kind, String sql, int rows) {
        if (!TraceRecorder.isActive()) {
            return;
        }
        String transaction = transactionManager.currentTransactionName();
        TraceRecorder.record(TraceLayer.JDBC, kind, sqlVerb(sql),
            (transaction == null ? "Ran on its own connection: " : "Ran inside " + transaction + ": ") + sql,
            TraceRecorder.attributes("sql", sql, "rows", rows, "tx", transaction));
    }

    private String sqlVerb(String sql) {
        String trimmed = sql.strip();
        int space = trimmed.indexOf(' ');
        return (space < 0 ? trimmed : trimmed.substring(0, space)).toLowerCase(Locale.ROOT);
    }

    private void bind(PreparedStatement statement, Object[] args) throws SQLException {
        for (int index = 0; index < args.length; index++) {
            statement.setObject(index + 1, args[index]);
        }
    }
}
