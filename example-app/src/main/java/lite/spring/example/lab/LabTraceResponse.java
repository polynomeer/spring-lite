package lite.spring.example.lab;

import java.util.List;

public record LabTraceResponse(
    String id,
    String labId,
    String title,
    String mode,
    String scenario,
    String summary,
    List<LabMetric> metrics,
    List<LabStep> steps,
    List<LabLane> lanes,
    LabSnapshot snapshot,
    List<String> references
) {
}
