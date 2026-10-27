package lite.spring.example.lab.pitfall;

import lite.spring.core.annotation.Component;
import lite.spring.tx.annotation.Transactional;

/**
 * A class-based proxy cannot override a {@code final} method, so the call runs on the proxy instance
 * itself, whose fields were never injected.
 */
@Component
public class FinalMethodOrders {
    private final PitfallRows rows;

    public FinalMethodOrders(PitfallRows rows) {
        this.rows = rows;
    }

    @Transactional
    public final void saveFinal(String runId) {
        rows.insert(runId, "orders", "final-method");
        throw new IllegalStateException("save failed after insert");
    }

    @Transactional
    public void save(String runId) {
        rows.insert(runId, "orders", "overridable-method");
        throw new IllegalStateException("save failed after insert");
    }
}
