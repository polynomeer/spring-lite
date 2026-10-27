package lite.spring.example.lab.sandbox;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lite.spring.core.annotation.PostConstruct;
import lite.spring.core.annotation.Service;
import lite.spring.core.trace.TraceLayer;
import lite.spring.core.trace.TraceRecorder;
import lite.spring.example.lab.LabDbSnapshotProvider;
import lite.spring.example.lab.LabTraceEventView;
import lite.spring.jdbc.JdbcTemplate;

/**
 * Runs a learner-built call tree through real {@code @Transactional} proxies and reports the recorded
 * events together with the rows that actually survived.
 */
@Service
public class SandboxService {
    private static final List<String> TABLES = List.of("orders", "audit_log");
    private static final String INSERT_ROW = "insert into lab_sandbox_row(run_id, target_table, label) values (?, ?, ?)";
    private static final String COUNT_ROWS = "select count(*) from lab_sandbox_row where run_id = ? and target_table = ?";

    private final SandboxTransactions transactions;
    private final JdbcTemplate jdbcTemplate;
    private final LabDbSnapshotProvider snapshotProvider;

    public SandboxService(SandboxTransactions transactions, JdbcTemplate jdbcTemplate, LabDbSnapshotProvider snapshotProvider) {
        this.transactions = transactions;
        this.jdbcTemplate = jdbcTemplate;
        this.snapshotProvider = snapshotProvider;
    }

    @PostConstruct
    void initialize() {
        jdbcTemplate.update(
            """
            create table if not exists lab_sandbox_row (
                id bigint auto_increment primary key,
                run_id varchar(36) not null,
                target_table varchar(32) not null,
                label varchar(64) not null
            )
            """
        );
    }

    public SandboxRunResponse run(Map<?, ?> body) {
        SandboxNode root = SandboxScenarioParser.parse(body);
        String runId = UUID.randomUUID().toString();
        String outcome = "completed";
        String exceptionMessage = null;
        List<LabTraceEventView> events;
        try (TraceRecorder.Session session = TraceRecorder.start()
            .snapshotWith(event -> snapshotProvider.sandboxSnapshot(event, runId, TABLES))) {
            try {
                execute(root, runId);
            } catch (SandboxFailure failure) {
                outcome = "exception";
                exceptionMessage = failure.getMessage();
            }
            events = session.events().stream().map(LabTraceEventView::from).toList();
        }
        Map<String, Long> rows = new LinkedHashMap<>();
        for (String table : TABLES) {
            rows.put(table, jdbcTemplate.queryForObject(COUNT_ROWS, resultSet -> resultSet.getLong(1), runId, table));
        }
        return new SandboxRunResponse(runId, outcome, exceptionMessage, events, rows);
    }

    private void execute(SandboxNode node, String runId) {
        Runnable body = () -> runBody(node, runId);
        switch (node.propagation()) {
            case "REQUIRED" -> transactions.required(body);
            case "REQUIRES_NEW" -> transactions.requiresNew(body);
            default -> body.run();
        }
    }

    private void runBody(SandboxNode node, String runId) {
        TraceRecorder.pushFrame(node.name());
        try {
            TraceRecorder.record(TraceLayer.SERVICE, "invoke", node.name(),
                "Entered " + node.name() + " (" + node.propagation() + ").",
                TraceRecorder.attributes("method", node.name(), "propagation", node.propagation()));
            for (SandboxStep step : node.steps()) {
                switch (step.type()) {
                    case "insert" -> jdbcTemplate.update(INSERT_ROW, runId, step.target(), node.name());
                    case "call" -> call(node, step, runId);
                    case "throw" -> {
                        TraceRecorder.record(TraceLayer.SERVICE, "raise", "throw", node.name() + " throws SandboxFailure.",
                            TraceRecorder.attributes("method", node.name()));
                        throw new SandboxFailure(node.name());
                    }
                    default -> throw new IllegalStateException("Unknown sandbox step " + step.type());
                }
            }
        } finally {
            TraceRecorder.popFrame();
        }
    }

    private void call(SandboxNode caller, SandboxStep step, String runId) {
        if (!step.catchFailure()) {
            execute(step.call(), runId);
            return;
        }
        try {
            execute(step.call(), runId);
        } catch (SandboxFailure failure) {
            TraceRecorder.record(TraceLayer.SERVICE, "catch", "catch",
                caller.name() + " caught the failure from " + step.call().name() + " and continued.",
                TraceRecorder.attributes("method", caller.name(), "from", step.call().name()));
        }
    }
}
