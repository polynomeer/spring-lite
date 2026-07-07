package lite.spring.tx.support;

import java.sql.Connection;

public final class ConnectionHolder {
    private final Connection connection;
    private final boolean active;

    public ConnectionHolder(Connection connection) {
        this.connection = connection;
        this.active = true;
    }

    public Connection connection() {
        return connection;
    }

    public boolean active() {
        return active;
    }
}
