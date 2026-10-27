package samples.comparison.spring.lab;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import samples.comparison.spring.lab.trace.ComparisonTrace;
import samples.comparison.spring.order.OrderRepository;
import samples.comparison.spring.order.OrderService;

/** Runs a transaction scenario and returns its framework events in the schema shared with the spring-lite app. */
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
        List<ComparisonTraceEvent> events;
        ComparisonTrace.start();
        try {
            try {
                orderService.createOrder("compare-" + scenario, 1, failAfterSave);
                outcome = "returned";
            } catch (IllegalStateException exception) {
                outcome = "threw " + exception.getClass().getSimpleName();
            }
        } finally {
            events = ComparisonTrace.stop();
        }
        return new ComparisonEventTrace("spring", scenario, outcome, before, orderRepository.count(), events);
    }
}
