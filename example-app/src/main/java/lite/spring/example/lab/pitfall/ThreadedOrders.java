package lite.spring.example.lab.pitfall;

import lite.spring.core.annotation.Component;
import lite.spring.tx.annotation.Transactional;

/** Writes from a second thread inside a transaction; that thread never sees the transaction's connection. */
@Component
public class ThreadedOrders {
    private final PitfallRows rows;

    public ThreadedOrders(PitfallRows rows) {
        this.rows = rows;
    }

    @Transactional
    public void placeWithThread(String runId) throws InterruptedException {
        rows.insert(runId, "orders", "caller-thread");
        Thread worker = new Thread(() -> rows.insert(runId, "audit_log", "worker-thread"), "pitfall-worker");
        worker.start();
        worker.join();
        throw new IllegalStateException("failed after both writes");
    }

    @Transactional
    public void placeInSameThread(String runId) {
        rows.insert(runId, "orders", "caller-thread");
        rows.insert(runId, "audit_log", "caller-thread");
        throw new IllegalStateException("failed after both writes");
    }
}
