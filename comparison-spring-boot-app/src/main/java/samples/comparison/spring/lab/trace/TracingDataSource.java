package samples.comparison.spring.lab.trace;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Locale;
import javax.sql.DataSource;
import org.springframework.jdbc.datasource.DelegatingDataSource;

/**
 * Wraps the pool so every statement executed while a comparison trace is active is recorded as
 * {@code jdbc.<verb>}, the same step name spring-lite's {@code JdbcTemplate} produces.
 */
public class TracingDataSource extends DelegatingDataSource {
    public TracingDataSource(DataSource target) {
        super(target);
    }

    @Override
    public Connection getConnection() throws SQLException {
        return wrapConnection(super.getConnection());
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        return wrapConnection(super.getConnection(username, password));
    }

    private static Connection wrapConnection(Connection connection) {
        InvocationHandler handler = (proxy, method, args) -> {
            Object result = invoke(connection, method, args);
            if (result instanceof PreparedStatement statement && method.getName().equals("prepareStatement")) {
                return wrapStatement(statement, PreparedStatement.class, (String) args[0]);
            }
            if (result instanceof Statement statement && method.getName().equals("createStatement")) {
                return wrapStatement(statement, Statement.class, null);
            }
            return result;
        };
        return (Connection) Proxy.newProxyInstance(TracingDataSource.class.getClassLoader(), new Class<?>[] {Connection.class}, handler);
    }

    private static <T extends Statement> T wrapStatement(T statement, Class<T> type, String preparedSql) {
        InvocationHandler handler = (proxy, method, args) -> {
            Object result = invoke(statement, method, args);
            if (method.getName().startsWith("execute") && !method.getName().equals("executeBatch")) {
                String sql = preparedSql != null ? preparedSql : args != null && args.length > 0 ? (String) args[0] : null;
                if (sql != null) {
                    ComparisonTrace.record("jdbc." + verb(sql), "jdbc", "Executed on the transaction-bound connection: " + sql,
                        "sql", sql, "rows", result instanceof Integer rows ? rows : null);
                }
            }
            return result;
        };
        return type.cast(Proxy.newProxyInstance(TracingDataSource.class.getClassLoader(), new Class<?>[] {type}, handler));
    }

    private static Object invoke(Object target, java.lang.reflect.Method method, Object[] args) throws Throwable {
        try {
            return method.invoke(target, args);
        } catch (InvocationTargetException exception) {
            throw exception.getTargetException();
        }
    }

    private static String verb(String sql) {
        String trimmed = sql.strip();
        int space = trimmed.indexOf(' ');
        return (space < 0 ? trimmed : trimmed.substring(0, space)).toLowerCase(Locale.ROOT);
    }
}
