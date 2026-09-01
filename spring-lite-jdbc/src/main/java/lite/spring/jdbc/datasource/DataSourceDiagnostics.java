package lite.spring.jdbc.datasource;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;
import java.util.Map;
import javax.sql.DataSource;

/** Performs an explicit, short-lived connectivity probe without retaining a connection. */
public final class DataSourceDiagnostics {
    private DataSourceDiagnostics() {
    }

    public static Map<String, Object> inspect(DataSource dataSource) {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metadata = connection.getMetaData();
            return Map.of(
                "status", "UP",
                "database", metadata.getDatabaseProductName(),
                "databaseVersion", metadata.getDatabaseProductVersion(),
                "url", metadata.getURL(),
                "readOnly", connection.isReadOnly()
            );
        } catch (SQLException exception) {
            return Map.of("status", "DOWN", "error", exception.getMessage() == null ? exception.getClass().getSimpleName() : exception.getMessage());
        }
    }
}
