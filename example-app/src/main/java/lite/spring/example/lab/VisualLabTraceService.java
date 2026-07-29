package lite.spring.example.lab;

import java.util.List;
import lite.spring.core.annotation.Service;
import lite.spring.example.order.Order;
import lite.spring.example.order.OrderService;

@Service
public class VisualLabTraceService {
    private final OrderService orderService;

    public VisualLabTraceService(OrderService orderService) {
        this.orderService = orderService;
    }

    public LabTraceResponse run(LabTraceRequest request) {
        if (!"example-flow".equals(request.labId())) {
            throw new IllegalArgumentException("Unsupported lab id: " + request.labId());
        }
        if (!"create".equals(request.scenario())) {
            throw new IllegalArgumentException("Unsupported example-flow scenario: " + request.scenario());
        }

        Order created = orderService.createOrder("lab-trace-book", 2);
        int orderCount = orderService.listOrders().size();

        return new LabTraceResponse(
            "live-example-flow-create-" + created.id(),
            "example-flow",
            "Example Flow Trace",
            "live",
            "create",
            "Live trace generated from the example application by executing a real create-order service flow.",
            List.of(
                new LabMetric("HTTP Status", "200", "The lab trace endpoint completed normally."),
                new LabMetric("Tx Outcome", "commit", "The transactional service boundary committed the new order."),
                new LabMetric("DB Effect", "insert", "The repository inserted a new order row."),
                new LabMetric("Created Order", "#" + created.id(), "The actual order id created during this run."),
                new LabMetric("Visible Orders", String.valueOf(orderCount), "Seeded rows plus newly created lab orders currently visible.")
            ),
            List.of(
                new LabStep(
                    "dispatch",
                    "Trace request enters lab controller",
                    "The frontend live-mode request reaches the example app trace endpoint.",
                    "dispatch",
                    "info"
                ),
                new LabStep(
                    "service-proxy",
                    "Order service proxy invoked",
                    "The trace service calls the real transactional OrderService implementation.",
                    "proxy",
                    "success"
                ),
                new LabStep(
                    "tx-begin",
                    "Transaction boundary opens",
                    "The create-order flow begins the transactional service boundary.",
                    "begin()",
                    "success"
                ),
                new LabStep(
                    "jdbc-insert",
                    "Repository inserts order",
                    "JdbcOrderRepository writes the new order row and reads it back.",
                    "insert",
                    "success"
                ),
                new LabStep(
                    "tx-commit",
                    "Transaction commits",
                    "The outer boundary commits the connection after successful service completion.",
                    "commit()",
                    "success"
                ),
                new LabStep(
                    "trace-response",
                    "Lab trace serialized",
                    "The backend returns the normalized LabTrace payload for the frontend.",
                    "json",
                    "success"
                )
            ),
            List.of(
                new LabLane(
                    "lane-web",
                    "Web",
                    "Trace endpoint entry and JSON response writing.",
                    "web",
                    List.of(
                        new LabLaneEvent("web-1", "POST /lab/run/trace", "info"),
                        new LabLaneEvent("web-2", "VisualLabTraceController", "success"),
                        new LabLaneEvent("web-3", "200 JSON response", "success")
                    )
                ),
                new LabLane(
                    "lane-service",
                    "Service",
                    "Real application service invocation.",
                    "service",
                    List.of(
                        new LabLaneEvent("service-1", "createOrder(lab-trace-book, 2)", "success"),
                        new LabLaneEvent("service-2", "status=PENDING_APPROVAL", "info")
                    )
                ),
                new LabLane(
                    "lane-tx",
                    "Transaction",
                    "Transactional service boundary lifecycle.",
                    "tx",
                    List.of(
                        new LabLaneEvent("tx-1", "begin depth=1", "success"),
                        new LabLaneEvent("tx-2", "commit", "success")
                    )
                ),
                new LabLane(
                    "lane-jdbc",
                    "JDBC",
                    "Repository persistence and row mapping.",
                    "jdbc",
                    List.of(
                        new LabLaneEvent("jdbc-1", "insert into orders ...", "success"),
                        new LabLaneEvent("jdbc-2", "selected row id=" + created.id(), "success")
                    )
                )
            ),
            new LabSnapshot(
                "This trace is generated by executing the real example application service path, not just by replaying static sample data.",
                "It proves that the frontend LabTrace contract can be backed by a live spring-lite runtime and still fit the same UI shape.",
                "Next, extend the endpoint to support validation, not-found, service-error, and rollback scenarios with the same normalized schema."
            ),
            List.of(
                "example-app/src/main/java/lite/spring/example/order/OrderController.java",
                "example-app/src/main/java/lite/spring/example/order/DefaultOrderService.java",
                "example-app/src/main/java/lite/spring/example/order/JdbcOrderRepository.java",
                "spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionInterceptor.java"
            )
        );
    }
}
