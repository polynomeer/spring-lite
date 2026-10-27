package lite.spring.example.lab.whatif;

import java.util.List;
import java.util.Map;
import lite.spring.example.lab.LabTraceEventView;

/**
 * Result of running one what-if experiment with its switch off (normal framework) or on.
 *
 * @param facts observable results keyed by label
 * @param eventCount events recorded in total; {@code events} may be truncated for runaway runs
 */
public record WhatIfRunResponse(
    String id,
    String mode,
    String outcome,
    Map<String, String> facts,
    List<LabTraceEventView> events,
    int eventCount
) {
}
