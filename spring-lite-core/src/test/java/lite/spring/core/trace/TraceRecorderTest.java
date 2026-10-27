package lite.spring.core.trace;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.groups.Tuple.tuple;

import java.util.Map;
import org.junit.jupiter.api.Test;

class TraceRecorderTest {
    @Test
    void ignoresEventsWithoutOpenSession() {
        TraceRecorder.pushFrame("Ignored.frame");
        TraceRecorder.record(TraceLayer.TX, "begin", "begin()", "no session");
        TraceRecorder.popFrame();

        try (TraceRecorder.Session session = TraceRecorder.start()) {
            assertThat(session.events()).isEmpty();
        }
        assertThat(TraceRecorder.isActive()).isFalse();
    }

    @Test
    void recordsEventsInOrderWithCurrentCallStack() {
        try (TraceRecorder.Session session = TraceRecorder.start()) {
            TraceRecorder.pushFrame("OrderController.create");
            TraceRecorder.record(TraceLayer.WEB, "handler", "handler", "controller selected");
            TraceRecorder.pushFrame("OrderService.createOrder");
            TraceRecorder.record(TraceLayer.TX, "begin", "begin()", "transaction opened", Map.of("tx", "tx#1"));
            TraceRecorder.popFrame();
            TraceRecorder.record(TraceLayer.WEB, "response", "200", "response written");

            assertThat(session.events())
                .extracting(TraceEvent::seq, TraceEvent::kind)
                .containsExactly(
                    tuple(1, "handler"),
                    tuple(2, "begin"),
                    tuple(3, "response")
                );
            assertThat(session.events().get(1).stack())
                .containsExactly("OrderController.create", "OrderService.createOrder");
            assertThat(session.events().get(1).attributes()).containsEntry("tx", "tx#1");
            assertThat(session.events().get(2).stack()).containsExactly("OrderController.create");
        }
    }

    @Test
    void restoresEnclosingSessionWhenNestedSessionCloses() {
        try (TraceRecorder.Session outer = TraceRecorder.start()) {
            TraceRecorder.record(TraceLayer.SERVICE, "outer", "outer", "before nested");
            try (TraceRecorder.Session inner = TraceRecorder.start()) {
                TraceRecorder.record(TraceLayer.SERVICE, "inner", "inner", "inside nested");
                assertThat(inner.events()).extracting(TraceEvent::kind).containsExactly("inner");
            }
            TraceRecorder.record(TraceLayer.SERVICE, "outer", "outer", "after nested");

            assertThat(outer.events()).extracting(TraceEvent::kind).containsExactly("outer", "outer");
        }
        assertThat(TraceRecorder.isActive()).isFalse();
    }

    @Test
    void attachesSnapshotWithoutTracingTheProvidersOwnWork() {
        try (TraceRecorder.Session session = TraceRecorder.start()) {
            session.snapshotWith(event -> {
                TraceRecorder.record(TraceLayer.JDBC, "query", "select", "snapshot query");
                return "insert".equals(event.marker()) ? Map.of("orders.current", "2", "orders.other", "1") : Map.of();
            });

            TraceRecorder.record(TraceLayer.TX, "begin", "begin()", "transaction opened");
            TraceRecorder.record(TraceLayer.JDBC, "update", "insert", "row inserted");

            assertThat(session.events()).extracting(TraceEvent::kind).containsExactly("begin", "update");
            assertThat(session.events().get(0).snapshot()).isEmpty();
            assertThat(session.events().get(1).snapshot())
                .containsEntry("orders.current", "2")
                .containsEntry("orders.other", "1");
        }
    }

    @Test
    void buildsAttributeMapSkippingNullValues() {
        assertThat(TraceRecorder.attributes("tx", "tx#1", "rows", 1, "sql", null))
            .containsExactly(Map.entry("tx", "tx#1"), Map.entry("rows", "1"));
    }
}
