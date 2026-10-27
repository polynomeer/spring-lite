package lite.spring.example.lab.sandbox;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.example.ExampleApplication;
import lite.spring.example.lab.LabTraceEventView;
import org.junit.jupiter.api.Test;

class SandboxServiceTest {
    @Test
    void requiresNewFailureCaughtOutsideKeepsOuterInsertOnly() {
        SandboxRunResponse response = run(Map.of("root", method("OrderService.placeOrder", "REQUIRED",
            insert("orders"),
            call(true, method("AuditService.log", "REQUIRES_NEW", insert("audit_log"), Map.of("type", "throw")))
        )));

        assertThat(response.outcome()).isEqualTo("completed");
        assertThat(response.rows()).containsEntry("orders", 1L).containsEntry("audit_log", 0L);
        assertThat(kinds(response, "tx")).containsExactly("begin", "suspend", "begin", "rollback", "resume", "commit");
        assertThat(response.events()).extracting(LabTraceEventView::kind).contains("raise", "catch");
    }

    @Test
    void swallowedFailureInsideRequiredStillRollsBackEverything() {
        SandboxRunResponse response = run(Map.of("root", method("OrderService.placeOrder", "REQUIRED",
            insert("orders"),
            call(true, method("AuditService.log", "REQUIRED", insert("audit_log"), Map.of("type", "throw")))
        )));

        assertThat(response.outcome()).isEqualTo("completed");
        assertThat(response.rows()).containsEntry("orders", 0L).containsEntry("audit_log", 0L);
        assertThat(kinds(response, "tx")).containsExactly("begin", "join", "mark-rollback-only", "rollback");
    }

    @Test
    void plainMethodKeepsInsertEvenWhenItThrows() {
        SandboxRunResponse response = run(Map.of("root", method("Batch.run", "NONE", insert("orders"), Map.of("type", "throw"))));

        assertThat(response.outcome()).isEqualTo("exception");
        assertThat(response.exceptionMessage()).contains("Batch.run");
        assertThat(response.rows()).containsEntry("orders", 1L);
        assertThat(kinds(response, "tx")).isEmpty();
    }

    @Test
    void snapshotShowsInnerInsertOnlyToItsOwnTransaction() {
        SandboxRunResponse response = run(Map.of("root", method("OrderService.placeOrder", "REQUIRED",
            insert("orders"),
            call(false, method("AuditService.log", "REQUIRES_NEW", insert("audit_log")))
        )));

        LabTraceEventView auditInsert = response.events().stream()
            .filter(event -> "update".equals(event.kind()))
            .reduce((first, second) -> second)
            .orElseThrow();
        assertThat(auditInsert.snapshot())
            .containsEntry("audit_log.current", "1")
            .containsEntry("audit_log.other", "0")
            .containsEntry("orders.current", "0")
            .containsEntry("orders.other", "0");
        assertThat(response.rows()).containsEntry("orders", 1L).containsEntry("audit_log", 1L);
    }

    @Test
    void rejectsUnsupportedPropagation() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ExampleApplication.class)) {
            SandboxService service = context.getBean(SandboxService.class);

            assertThatThrownBy(() -> service.run(Map.of("root", method("A.b", "NESTED"))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("NESTED");
        }
    }

    private static SandboxRunResponse run(Map<String, Object> body) {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ExampleApplication.class)) {
            return context.getBean(SandboxService.class).run(body);
        }
    }

    private static List<String> kinds(SandboxRunResponse response, String layer) {
        return response.events().stream().filter(event -> layer.equals(event.layer())).map(LabTraceEventView::kind).toList();
    }

    private static Map<String, Object> method(String name, String propagation, Object... steps) {
        return Map.of("name", name, "propagation", propagation, "steps", List.of(steps));
    }

    private static Map<String, Object> insert(String table) {
        return Map.of("type", "insert", "target", table);
    }

    private static Map<String, Object> call(boolean catchFailure, Map<String, Object> method) {
        return Map.of("type", "call", "catch", catchFailure, "call", method);
    }
}
