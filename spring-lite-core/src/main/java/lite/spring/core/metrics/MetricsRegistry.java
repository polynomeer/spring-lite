package lite.spring.core.metrics;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.LongAdder;

/** Thread-safe in-memory counters and timers for instructional runtime observability. */
public class MetricsRegistry {
    private final ConcurrentHashMap<String, LongAdder> counters = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, TimerState> timers = new ConcurrentHashMap<>();

    public void increment(String name) { counters.computeIfAbsent(name, ignored -> new LongAdder()).increment(); }

    public void recordNanos(String name, long elapsedNanos) {
        TimerState state = timers.computeIfAbsent(name, ignored -> new TimerState());
        state.count.increment();
        state.totalNanos.add(Math.max(0, elapsedNanos));
    }

    public Map<String, Long> counters() {
        Map<String, Long> snapshot = new LinkedHashMap<>();
        counters.forEach((name, value) -> snapshot.put(name, value.sum()));
        return Map.copyOf(snapshot);
    }

    public Map<String, TimerSnapshot> timers() {
        Map<String, TimerSnapshot> snapshot = new LinkedHashMap<>();
        timers.forEach((name, value) -> snapshot.put(name, new TimerSnapshot(value.count.sum(), value.totalNanos.sum())));
        return Map.copyOf(snapshot);
    }

    public record TimerSnapshot(long count, long totalNanos) { }

    private static final class TimerState { private final LongAdder count = new LongAdder(); private final LongAdder totalNanos = new LongAdder(); }
}
