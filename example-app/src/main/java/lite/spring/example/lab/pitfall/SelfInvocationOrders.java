package lite.spring.example.lab.pitfall;

import lite.spring.core.annotation.Component;
import lite.spring.tx.annotation.Transactional;

/** Calls its own {@code @Transactional} method through {@code this}, bypassing the proxy. */
@Component
public class SelfInvocationOrders {
    private final PitfallRows rows;

    public SelfInvocationOrders(PitfallRows rows) {
        this.rows = rows;
    }

    public void placeAll(String runId) {
        this.save(runId);
    }

    @Transactional
    public void save(String runId) {
        rows.insert(runId, "orders", "self-invocation");
        throw new IllegalStateException("save failed after insert");
    }
}
