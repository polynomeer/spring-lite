package lite.spring.example.lab.pitfall;

import lite.spring.core.annotation.Component;
import lite.spring.tx.annotation.Transactional;

/** Throws a checked exception after writing, with and without an explicit rollback rule. */
@Component
public class CheckedExceptionOrders {
    private final PitfallRows rows;

    public CheckedExceptionOrders(PitfallRows rows) {
        this.rows = rows;
    }

    @Transactional
    public void save(String runId) throws Exception {
        rows.insert(runId, "orders", "checked-default");
        throw new Exception("checked failure after insert");
    }

    @Transactional(rollbackFor = Exception.class)
    public void saveWithRule(String runId) throws Exception {
        rows.insert(runId, "orders", "checked-rollback-for");
        throw new Exception("checked failure after insert");
    }
}
