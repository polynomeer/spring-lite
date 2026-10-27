package lite.spring.example.lab.sandbox;

import java.util.List;
import java.util.Map;
import lite.spring.example.lab.LabTraceEventView;

/**
 * Result of one sandbox run.
 *
 * @param outcome {@code completed}, or {@code exception} when the root method threw
 * @param rows committed rows per table after the run
 */
public record SandboxRunResponse(
    String runId,
    String outcome,
    String exceptionMessage,
    List<LabTraceEventView> events,
    Map<String, Long> rows
) {
}
