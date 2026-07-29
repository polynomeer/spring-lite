package lite.spring.example.lab;

import java.util.List;

public record LabLane(String id, String label, String detail, String kind, List<LabLaneEvent> events) {
}
