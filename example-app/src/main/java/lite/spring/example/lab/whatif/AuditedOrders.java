package lite.spring.example.lab.whatif;

import lite.spring.core.annotation.Component;
import lite.spring.example.lab.pitfall.PitfallRows;
import lite.spring.tx.annotation.Transactional;

@Component
public class AuditedOrders {
    private final PitfallRows rows;

    public AuditedOrders(PitfallRows rows) {
        this.rows = rows;
    }

    @Transactional
    @AuditedOperation
    public void place(String runId) {
        rows.insert(runId, "orders", "audited-order");
    }
}
