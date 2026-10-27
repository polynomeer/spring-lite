package lite.spring.example.lab;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import lite.spring.core.trace.TraceEvent;

public record LabTraceEventView(
    int seq,
    String layer,
    String kind,
    String marker,
    String detail,
    List<String> stack,
    Map<String, String> attributes,
    Map<String, String> snapshot
) {
    static LabTraceEventView from(TraceEvent event) {
        return new LabTraceEventView(
            event.seq(),
            event.layer().name().toLowerCase(Locale.ROOT),
            event.kind(),
            event.marker(),
            event.detail(),
            event.stack(),
            event.attributes(),
            event.snapshot()
        );
    }
}
