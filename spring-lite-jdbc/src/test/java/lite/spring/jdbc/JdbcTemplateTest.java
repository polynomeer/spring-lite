package lite.spring.jdbc;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;
import lite.spring.core.trace.TraceEvent;
import lite.spring.core.trace.TraceRecorder;
import lite.spring.tx.support.TransactionManager;
import org.junit.jupiter.api.Test;

class JdbcTemplateTest {
    @Test
    void executesUpdateWithFreshConnectionWhenNoTransactionExists() {
        RecordingJdbc recordingJdbc = new RecordingJdbc(List.of());
        JdbcTemplate jdbcTemplate = new JdbcTemplate(recordingJdbc.dataSource(), new TransactionManager(null));

        int updated = jdbcTemplate.update("update orders set status = ? where id = ?", "PAID", 1L);

        assertThat(updated).isEqualTo(1);
        assertThat(recordingJdbc.preparedSql).containsExactly("update orders set status = ? where id = ?");
        assertThat(recordingJdbc.boundParameters).containsExactly(List.of("PAID", 1L));
        assertThat(recordingJdbc.connectionCloseCount).isEqualTo(1);
    }

    @Test
    void tracesSqlVerbRowsAndConnectionOwner() {
        RecordingJdbc recordingJdbc = new RecordingJdbc(List.of());
        JdbcTemplate jdbcTemplate = new JdbcTemplate(recordingJdbc.dataSource(), new TransactionManager(null));

        try (TraceRecorder.Session session = TraceRecorder.start()) {
            jdbcTemplate.update("insert into orders(product) values (?)", "book");

            TraceEvent event = session.events().getFirst();
            assertThat(event.kind()).isEqualTo("update");
            assertThat(event.marker()).isEqualTo("insert");
            assertThat(event.attributes())
                .containsEntry("rows", "1")
                .containsEntry("sql", "insert into orders(product) values (?)")
                .doesNotContainKey("tx");
        }
    }

    @Test
    void mapsQueryResultsAndReusesTransactionalConnection() {
        RecordingJdbc recordingJdbc = new RecordingJdbc(List.of(
            List.of(1L, "CREATED"),
            List.of(2L, "PAID")
        ));
        TestTransactionManager transactionManager = new TestTransactionManager(recordingJdbc.connection());
        JdbcTemplate jdbcTemplate = new JdbcTemplate(recordingJdbc.dataSource(), transactionManager);

        List<String> values = jdbcTemplate.query(
            "select id, status from orders",
            resultSet -> resultSet.getLong(1) + ":" + resultSet.getString(2)
        );

        assertThat(values).containsExactly("1:CREATED", "2:PAID");
        assertThat(recordingJdbc.connectionCloseCount).isZero();
        assertThat(recordingJdbc.statementCloseCount).isEqualTo(1);
    }

    @Test
    void returnsFirstRowForQueryForObjectAndNullWhenEmpty() {
        RecordingJdbc withRows = new RecordingJdbc(List.of(List.of(7L, "CREATED")));
        JdbcTemplate jdbcTemplate = new JdbcTemplate(withRows.dataSource(), new TransactionManager(null));

        String first = jdbcTemplate.queryForObject("select id, status from orders", rs -> rs.getLong(1) + ":" + rs.getString(2));

        assertThat(first).isEqualTo("7:CREATED");

        RecordingJdbc withoutRows = new RecordingJdbc(List.of());
        JdbcTemplate emptyTemplate = new JdbcTemplate(withoutRows.dataSource(), new TransactionManager(null));

        String none = emptyTemplate.queryForObject("select 1", rs -> rs.getString(1));
        assertThat(none).isNull();
    }

    @Test
    void returnsNoUpdateCountsWithoutOpeningAConnectionForAnEmptyBatch() {
        RecordingJdbc recordingJdbc = new RecordingJdbc(List.of());
        JdbcTemplate jdbcTemplate = new JdbcTemplate(recordingJdbc.dataSource(), new TransactionManager(null));

        assertThat(jdbcTemplate.batchUpdate("update orders set status = ?", List.of())).isEmpty();
        assertThat(recordingJdbc.preparedSql).isEmpty();
        assertThat(recordingJdbc.connectionCloseCount).isZero();
    }

    private static final class TestTransactionManager extends TransactionManager {
        private final Connection connection;

        private TestTransactionManager(Connection connection) {
            super(null);
            this.connection = connection;
        }

        @Override
        public Connection currentConnection() {
            return connection;
        }
    }

    private static final class RecordingJdbc {
        private final List<List<Object>> rows;
        private final List<String> preparedSql = new ArrayList<>();
        private final List<List<Object>> boundParameters = new ArrayList<>();
        private int connectionCloseCount;
        private int statementCloseCount;

        private RecordingJdbc(List<List<Object>> rows) {
            this.rows = rows;
        }

        private DataSource dataSource() {
            return new DataSource() {
                @Override
                public Connection getConnection() {
                    return connection();
                }

                @Override
                public Connection getConnection(String username, String password) {
                    return connection();
                }

                @Override
                public <T> T unwrap(Class<T> iface) throws SQLException {
                    throw new SQLException("Not supported");
                }

                @Override
                public boolean isWrapperFor(Class<?> iface) {
                    return false;
                }

                @Override
                public java.io.PrintWriter getLogWriter() {
                    return new java.io.PrintWriter(System.out);
                }

                @Override
                public void setLogWriter(java.io.PrintWriter out) {
                }

                @Override
                public void setLoginTimeout(int seconds) {
                }

                @Override
                public int getLoginTimeout() {
                    return 0;
                }

                @Override
                public java.util.logging.Logger getParentLogger() {
                    return java.util.logging.Logger.getGlobal();
                }
            };
        }

        private Connection connection() {
            return (Connection) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class[]{Connection.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "prepareStatement" -> {
                        preparedSql.add((String) args[0]);
                        yield preparedStatement();
                    }
                    case "close" -> {
                        connectionCloseCount++;
                        yield null;
                    }
                    case "setAutoCommit", "commit", "rollback" -> null;
                    case "isClosed" -> false;
                    case "unwrap" -> proxy;
                    case "isWrapperFor" -> false;
                    default -> defaultValue(method.getReturnType());
                }
            );
        }

        private PreparedStatement preparedStatement() {
            List<Object> parameters = new ArrayList<>();
            boundParameters.add(parameters);
            return (PreparedStatement) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class[]{PreparedStatement.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "setObject" -> {
                        int index = (Integer) args[0] - 1;
                        while (parameters.size() <= index) {
                            parameters.add(null);
                        }
                        parameters.set(index, args[1]);
                        yield null;
                    }
                    case "executeUpdate" -> 1;
                    case "executeQuery" -> resultSet();
                    case "close" -> {
                        statementCloseCount++;
                        yield null;
                    }
                    default -> defaultValue(method.getReturnType());
                }
            );
        }

        private ResultSet resultSet() {
            final int[] index = {-1};
            return (ResultSet) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class[]{ResultSet.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "next" -> ++index[0] < rows.size();
                    case "getLong" -> ((Number) rows.get(index[0]).get((Integer) args[0] - 1)).longValue();
                    case "getString" -> String.valueOf(rows.get(index[0]).get((Integer) args[0] - 1));
                    case "close" -> null;
                    default -> defaultValue(method.getReturnType());
                }
            );
        }

        private Object defaultValue(Class<?> returnType) {
            if (!returnType.isPrimitive()) {
                return null;
            }
            if (returnType.equals(boolean.class)) {
                return false;
            }
            if (returnType.equals(int.class)) {
                return 0;
            }
            if (returnType.equals(long.class)) {
                return 0L;
            }
            if (returnType.equals(double.class)) {
                return 0d;
            }
            if (returnType.equals(float.class)) {
                return 0f;
            }
            if (returnType.equals(short.class)) {
                return (short) 0;
            }
            if (returnType.equals(byte.class)) {
                return (byte) 0;
            }
            if (returnType.equals(char.class)) {
                return '\0';
            }
            return null;
        }
    }
}
