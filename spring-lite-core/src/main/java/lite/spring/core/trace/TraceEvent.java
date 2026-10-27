package lite.spring.core.trace;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * One observed step inside a trace session.
 *
 * @param seq 1-based order inside the session
 * @param layer runtime layer that emitted the event
 * @param kind machine-readable event type such as {@code begin} or {@code update}
 * @param marker short label shown on timelines such as {@code begin()} or {@code insert}
 * @param detail human-readable description
 * @param thread name of the emitting thread
 * @param stack call frames active when the event was recorded, outermost first
 * @param attributes extra state such as transaction name or SQL text
 * @param snapshot state captured right after the event, such as row counts seen by different
 *     connections; empty unless the session has a snapshot provider
 */
public record TraceEvent(
    int seq,
    TraceLayer layer,
    String kind,
    String marker,
    String detail,
    String thread,
    List<String> stack,
    Map<String, String> attributes,
    Map<String, String> snapshot
) {
    public TraceEvent {
        stack = List.copyOf(stack);
        attributes = Collections.unmodifiableMap(new LinkedHashMap<>(attributes));
        snapshot = Collections.unmodifiableMap(new LinkedHashMap<>(snapshot));
    }

    TraceEvent withSnapshot(Map<String, String> captured) {
        return new TraceEvent(seq, layer, kind, marker, detail, thread, stack, attributes, captured);
    }
}
