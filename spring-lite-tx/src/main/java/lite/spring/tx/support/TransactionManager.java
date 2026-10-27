package lite.spring.tx.support;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.atomic.AtomicInteger;
import javax.sql.DataSource;
import lite.spring.core.trace.TraceLayer;
import lite.spring.core.trace.TraceRecorder;
import lite.spring.core.whatif.WhatIf;
import lite.spring.tx.annotation.Propagation;

public class TransactionManager {
    private final DataSource dataSource;
    private final ThreadLocal<Deque<TransactionContext>> transactionContexts = ThreadLocal.withInitial(ArrayDeque::new);
    private final AtomicInteger transactionSequence = new AtomicInteger();

    public TransactionManager(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void begin() {
        begin(false);
    }

    public void begin(boolean readOnly) {
        begin(Propagation.REQUIRED, readOnly);
    }

    public void begin(Propagation propagation, boolean readOnly) {
        Deque<TransactionContext> contexts = transactionContexts.get();
        TransactionContext context = contexts.peek();
        if (propagation == Propagation.REQUIRED && context != null) {
            context.incrementDepth();
            trace("join", "join", "Joined the active transaction " + context.name() + ".", context);
            return;
        }
        if (context != null) {
            trace("suspend", "suspend", "Suspended " + context.name() + " to start an independent transaction.", context);
        }
        String name = "tx#" + transactionSequence.incrementAndGet();
        if (dataSource == null) {
            TransactionContext created = new TransactionContext(name, null, readOnly, false);
            contexts.push(created);
            trace("begin", "begin()", "Started " + name + " without a data source.", created);
            return;
        }
        try {
            Connection connection = dataSource.getConnection();
            boolean originalReadOnly = connection.isReadOnly();
            connection.setReadOnly(readOnly);
            connection.setAutoCommit(false);
            TransactionContext created = new TransactionContext(name, connection, readOnly, originalReadOnly);
            contexts.push(created);
            trace("begin", "begin()", "Started " + name + " on a new connection with auto-commit disabled.", created);
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to begin transaction", exception);
        }
    }

    public void commit() {
        Deque<TransactionContext> contexts = transactionContexts.get();
        TransactionContext context = contexts.peek();
        if (context == null) {
            return;
        }
        if (!context.decrementAndIsComplete()) {
            trace("leave", "leave", "Left " + context.name() + " without committing; the outer boundary decides.", context);
            return;
        }
        String rollbackOnlyDetail = "Rolled back " + context.name() + " because a participant marked it rollback-only.";
        if (context.rollbackOnly() && WhatIf.isEnabled(WhatIf.Flag.TX_IGNORE_ROLLBACK_ONLY)) {
            trace("what-if", "ignore rollbackOnly", "What-if: ignored the rollback-only mark on " + context.name() + " and committed anyway.", context);
            context.clearRollbackOnly();
        }
        if (context.connection() == null) {
            if (context.rollbackOnly()) {
                trace("rollback", "rollback()", rollbackOnlyDetail, context);
            } else {
                trace("commit", "commit()", "Committed " + context.name() + ".", context);
            }
            completeContext(contexts);
            return;
        }
        if (context.rollbackOnly()) {
            rollbackConnection(context, rollbackOnlyDetail);
            return;
        }
        try {
            context.connection().commit();
            trace("commit", "commit()", "Committed " + context.name() + ".", context);
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to commit transaction", exception);
        } finally {
            cleanup(context);
        }
    }

    public void rollback() {
        Deque<TransactionContext> contexts = transactionContexts.get();
        TransactionContext context = contexts.peek();
        if (context == null) {
            return;
        }
        context.markRollbackOnly();
        if (!context.decrementAndIsComplete()) {
            trace("mark-rollback-only", "rollbackOnly", "Marked " + context.name() + " rollback-only; the outer boundary will roll back.", context);
            return;
        }
        String detail = "Rolled back " + context.name() + ".";
        if (context.connection() == null) {
            trace("rollback", "rollback()", detail, context);
            completeContext(contexts);
            return;
        }
        rollbackConnection(context, detail);
    }

    public boolean isTransactionActive() {
        return transactionContexts.get().peek() != null;
    }

    /** Returns the name of the innermost active transaction such as {@code tx#1}, or {@code null}. */
    public String currentTransactionName() {
        TransactionContext context = transactionContexts.get().peek();
        return context == null ? null : context.name();
    }

    public Connection currentConnection() {
        TransactionContext context = transactionContexts.get().peek();
        return context == null ? null : context.connection();
    }

    /** Rolls back, then records the event while the connection is still bound so observers see the outcome. */
    private void rollbackConnection(TransactionContext context, String detail) {
        try {
            context.connection().rollback();
            trace("rollback", "rollback()", detail, context);
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to rollback transaction", exception);
        } finally {
            cleanup(context);
        }
    }

    private void cleanup(TransactionContext context) {
        try {
            Connection connection = context.connection();
            connection.setAutoCommit(true);
            connection.setReadOnly(context.originalReadOnly());
            connection.close();
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to close transaction connection", exception);
        } finally {
            completeContext(transactionContexts.get());
        }
    }

    private void completeContext(Deque<TransactionContext> contexts) {
        contexts.pop();
        if (contexts.isEmpty()) {
            transactionContexts.remove();
            return;
        }
        TransactionContext resumed = contexts.peek();
        trace("resume", "resume", "Resumed the suspended transaction " + resumed.name() + ".", resumed);
    }

    private void trace(String kind, String marker, String detail, TransactionContext context) {
        TraceRecorder.record(TraceLayer.TX, kind, marker, detail, TraceRecorder.attributes(
            "tx", context.name(),
            "depth", context.depth(),
            "active", transactionContexts.get().size(),
            "readOnly", context.readOnly(),
            "rollbackOnly", context.rollbackOnly()
        ));
    }

    private static final class TransactionContext {
        private final String name;
        private final Connection connection;
        private final boolean readOnly;
        private final boolean originalReadOnly;
        private int depth = 1;
        private boolean rollbackOnly;

        private TransactionContext(String name, Connection connection, boolean readOnly, boolean originalReadOnly) {
            this.name = name;
            this.connection = connection;
            this.readOnly = readOnly;
            this.originalReadOnly = originalReadOnly;
        }

        private String name() {
            return name;
        }

        private Connection connection() {
            return connection;
        }

        private boolean readOnly() {
            return readOnly;
        }

        private int depth() {
            return depth;
        }

        private boolean originalReadOnly() { return originalReadOnly; }

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

        private void clearRollbackOnly() {
            rollbackOnly = false;
        }

        private boolean rollbackOnly() {
            return rollbackOnly;
        }
    }
}
