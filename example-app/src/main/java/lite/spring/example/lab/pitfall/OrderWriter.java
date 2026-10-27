package lite.spring.example.lab.pitfall;

import lite.spring.core.annotation.Component;
import lite.spring.tx.annotation.Transactional;

/** The fix for self-invocation: the transactional method lives in another bean, so calls go through its proxy. */
@Component
public class OrderWriter {
    private final PitfallRows rows;

    public OrderWriter(PitfallRows rows) {
        this.rows = rows;
    }

    @Transactional
    public void save(String runId) {
        rows.insert(runId, "orders", "separate-bean");
        throw new IllegalStateException("save failed after insert");
    }
}
