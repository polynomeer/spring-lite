package lite.spring.example.lab.pitfall;

import java.util.List;
import java.util.Map;
import lite.spring.example.lab.LabTraceEventView;

/**
 * Result of running one variant of a pitfall experiment.
 *
 * @param outcome one-line description of what actually happened
 * @param facts observable results such as remaining rows or the thrown exception, keyed by label
 */
public record PitfallRunResponse(
    String id,
    String variant,
    String outcome,
    Map<String, String> facts,
    List<LabTraceEventView> events
) {
}
