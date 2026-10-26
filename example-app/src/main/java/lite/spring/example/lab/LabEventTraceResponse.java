package lite.spring.example.lab;

import java.util.List;

/** A lab trace together with the ordered runtime events recorded while it ran. */
public record LabEventTraceResponse(LabTraceResponse trace, List<LabTraceEventView> events) {
}
