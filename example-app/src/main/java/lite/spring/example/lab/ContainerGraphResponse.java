package lite.spring.example.lab;

import java.util.List;

/** The running container's beans with their dependencies, plus the events recorded while it refreshed. */
public record ContainerGraphResponse(List<ContainerBeanView> beans, List<LabTraceEventView> refresh) {
}
