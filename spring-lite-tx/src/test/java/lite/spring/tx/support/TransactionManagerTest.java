package lite.spring.tx.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.PrintWriter;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;

class TransactionManagerTest {
    @Test
    void commitsPhysicalTransactionOnlyAtOutermostBoundary() {
        RecordingConnection recordingConnection = new RecordingConnection();
        TransactionManager transactionManager = new TransactionManager(recordingConnection.dataSource());

        transactionManager.begin();
        transactionManager.begin();

        assertThat(transactionManager.isTransactionActive()).isTrue();
        transactionManager.commit();
        assertThat(recordingConnection.commitCalls).isZero();

        transactionManager.commit();

        assertThat(recordingConnection.commitCalls).isEqualTo(1);
        assertThat(recordingConnection.rollbackCalls).isZero();
        assertThat(recordingConnection.closeCalls).isEqualTo(1);
    }

    @Test
    void marksNestedTransactionsRollbackOnly() {
        RecordingConnection recordingConnection = new RecordingConnection();
        TransactionManager transactionManager = new TransactionManager(recordingConnection.dataSource());

        transactionManager.begin();
        transactionManager.begin();
        transactionManager.rollback();
        transactionManager.commit();

        assertThat(recordingConnection.commitCalls).isZero();
        assertThat(recordingConnection.rollbackCalls).isEqualTo(1);
        assertThat(recordingConnection.closeCalls).isEqualTo(1);
    }

    private static final class RecordingConnection {
        private int commitCalls;
        private int rollbackCalls;
        private int closeCalls;

        private DataSource dataSource() {
            return new DataSource() {
                @Override
                public Connection getConnection() {
                    return connectionProxy();
                }

                @Override
                public Connection getConnection(String username, String password) {
                    return connectionProxy();
                }

                @Override
                public PrintWriter getLogWriter() {
                    return null;
                }

                @Override
                public void setLogWriter(PrintWriter out) {
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

                @Override
                public <T> T unwrap(Class<T> iface) throws SQLException {
                    throw new SQLException("Not a wrapper");
                }

                @Override
                public boolean isWrapperFor(Class<?> iface) {
                    return false;
                }
            };
        }

        private Connection connectionProxy() {
            return (Connection) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{Connection.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "setAutoCommit", "setReadOnly" -> null;
                    case "getAutoCommit" -> false;
                    case "commit" -> {
                        commitCalls++;
                        yield null;
                    }
                    case "rollback" -> {
                        rollbackCalls++;
                        yield null;
                    }
                    case "close" -> {
                        closeCalls++;
                        yield null;
                    }
                    case "isClosed" -> false;
                    default -> method.getReturnType().isPrimitive() ? primitiveDefault(method.getReturnType()) : null;
                }
            );
        }

        private Object primitiveDefault(Class<?> type) {
            if (type.equals(boolean.class)) {
                return false;
            }
            if (type.equals(int.class) || type.equals(short.class) || type.equals(byte.class)) {
                return 0;
            }
            if (type.equals(long.class)) {
                return 0L;
            }
            if (type.equals(float.class)) {
                return 0f;
            }
            if (type.equals(double.class)) {
                return 0d;
            }
            if (type.equals(char.class)) {
                return '\0';
            }
            return null;
        }
    }
}
