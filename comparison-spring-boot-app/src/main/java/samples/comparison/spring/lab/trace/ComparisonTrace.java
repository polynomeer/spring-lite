package samples.comparison.spring.lab.trace;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import samples.comparison.spring.lab.ComparisonTraceEvent;

/**
 * Thread-bound event buffer for the Boot side of the comparison. Spring has no equivalent of
 * spring-lite's {@code TraceRecorder}, so the adapters in this package observe the real Spring
 * infrastructure and record steps under the same normalized names. Recording is a no-op outside
 * {@link #start()} and {@link #stop()}.
 */
public final class ComparisonTrace {
    private static final ThreadLocal<List<ComparisonTraceEvent>> EVENTS = new ThreadLocal<>();

    private ComparisonTrace() {
    }

    public static void start() {
        EVENTS.set(new ArrayList<>());
    }

    public static List<ComparisonTraceEvent> stop() {
        List<ComparisonTraceEvent> events = EVENTS.get();
        EVENTS.remove();
        return events == null ? List.of() : List.copyOf(events);
    }

    public static boolean isActive() {
        return EVENTS.get() != null;
    }

    /** Records one step; attributes are alternating key/value pairs and null values are skipped. */
    public static void record(String step, String layer, String detail, Object... attributes) {
        List<ComparisonTraceEvent> events = EVENTS.get();
        if (events == null) {
            return;
        }
        Map<String, String> values = new LinkedHashMap<>();
        for (int index = 0; index + 1 < attributes.length; index += 2) {
            if (attributes[index + 1] != null) {
                values.put(String.valueOf(attributes[index]), String.valueOf(attributes[index + 1]));
            }
        }
        events.add(new ComparisonTraceEvent(events.size() + 1, step, layer, detail, Map.copyOf(values)));
    }
}
