package lite.spring.example.lab;

import static org.assertj.core.api.Assertions.assertThat;

import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.example.ExampleApplication;
import org.junit.jupiter.api.Test;

class VisualLabEventTraceTest {
    @Test
    void snapshotsShowUncommittedInsertOnlyToTheTransactionsOwnConnection() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ExampleApplication.class)) {
            VisualLabTraceService service = context.getBean(VisualLabTraceService.class);

            LabEventTraceResponse response = service.runWithEvents(
                new LabTraceRequest("example-flow", "rollback", "live", "snapshot-book", "1")
            );

            LabTraceEventView insert = response.events().stream()
                .filter(event -> "insert".equals(event.marker()))
                .findFirst()
                .orElseThrow();
            LabTraceEventView rollback = response.events().stream()
                .filter(event -> "rollback".equals(event.kind()))
                .findFirst()
                .orElseThrow();
            long other = Long.parseLong(insert.snapshot().get("orders.other"));

            assertThat(Long.parseLong(insert.snapshot().get("orders.current"))).isEqualTo(other + 1);
            assertThat(rollback.snapshot())
                .containsEntry("orders.current", String.valueOf(other))
                .containsEntry("orders.other", String.valueOf(other));
            assertThat(response.events())
                .filteredOn(event -> "query".equals(event.kind()))
                .allSatisfy(event -> assertThat(event.snapshot()).isEmpty());
        }
    }

    @Test
    void snapshotsShowCommittedInsertToEveryConnection() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ExampleApplication.class)) {
            VisualLabTraceService service = context.getBean(VisualLabTraceService.class);

            LabEventTraceResponse response = service.runWithEvents(
                new LabTraceRequest("example-flow", "create", "live", "snapshot-pen", "2")
            );

            LabTraceEventView commit = response.events().stream()
                .filter(event -> "commit".equals(event.kind()))
                .findFirst()
                .orElseThrow();

            assertThat(commit.snapshot().get("orders.current")).isEqualTo(commit.snapshot().get("orders.other"));
        }
    }
}
