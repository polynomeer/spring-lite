package samples.comparison.lite.lab;

import java.util.ArrayList;
import java.util.List;
import lite.spring.core.trace.TraceEvent;
import lite.spring.core.trace.TraceRecorder;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.PathVariable;
import lite.spring.web.annotation.RestController;
import samples.comparison.lite.order.OrderRepository;
import samples.comparison.lite.order.OrderService;

/** Runs a transaction scenario and returns its framework events in the schema shared with the Boot app. */
@RestController
public class ComparisonEventController {
    private final OrderService orderService;
    private final OrderRepository orderRepository;

    public ComparisonEventController(OrderService orderService, OrderRepository orderRepository) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/lab/compare/events/{scenario}")
    public ComparisonEventTrace events(@PathVariable("scenario") String scenario) {
        boolean failAfterSave = switch (scenario) {
            case "tx-commit" -> false;
            case "tx-rollback" -> true;
            default -> throw new IllegalArgumentException("Unsupported comparison scenario: " + scenario);
        };
        long before = orderRepository.count();
        String outcome;
        List<TraceEvent> recorded;
        try (TraceRecorder.Session session = TraceRecorder.start()) {
            try {
                orderService.createOrder("compare-" + scenario, 1, failAfterSave);
                outcome = "returned";
            } catch (IllegalStateException exception) {
                outcome = "threw " + exception.getClass().getSimpleName();
            }
            recorded = session.events();
        }
        List<ComparisonTraceEvent> events = new ArrayList<>();
        for (TraceEvent event : recorded) {
            events.add(ComparisonTraceEvent.from(events.size() + 1, event));
        }
        return new ComparisonEventTrace("spring-lite", scenario, outcome, before, orderRepository.count(), events);
    }
}
