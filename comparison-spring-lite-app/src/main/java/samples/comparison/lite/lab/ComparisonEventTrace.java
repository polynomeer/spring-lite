package samples.comparison.lite.lab;

import java.util.List;

/** Normalized events from one scenario run, plus the persisted outcome both runtimes must agree on. */
public record ComparisonEventTrace(
    String runtime,
    String scenario,
    String outcome,
    long ordersBefore,
    long ordersAfter,
    List<ComparisonTraceEvent> events
) {
}
