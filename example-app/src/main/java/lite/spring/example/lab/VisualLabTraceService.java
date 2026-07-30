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
        return switch (request.scenario()) {
            case "create" -> runCreateScenario();
            case "validation" -> runValidationScenario();
            case "not-found" -> runNotFoundScenario();
            case "service-error" -> runServiceErrorScenario();
            case "rollback" -> runRollbackScenario();
            default -> throw new IllegalArgumentException("Unsupported example-flow scenario: " + request.scenario());
        };
    }

    private LabTraceResponse runCreateScenario() {
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
                "The same normalized schema can now describe success, validation, lookup failure, service failure, and rollback branches."
            ),
            List.of(
                "example-app/src/main/java/lite/spring/example/order/OrderController.java",
                "example-app/src/main/java/lite/spring/example/order/DefaultOrderService.java",
                "example-app/src/main/java/lite/spring/example/order/JdbcOrderRepository.java",
                "spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionInterceptor.java"
            )
        );
    }

    private LabTraceResponse runValidationScenario() {
        return new LabTraceResponse(
            "live-example-flow-validation",
            "example-flow",
            "Example Flow Trace",
            "live",
            "validation",
            "Normalized live trace for the controller validation branch that rejects an invalid create-order request before the service layer runs.",
            List.of(
                new LabMetric("HTTP Status", "400", "The request is rejected as a validation failure."),
                new LabMetric("Tx Outcome", "not-started", "The transactional service boundary is never entered."),
                new LabMetric("DB Effect", "none", "No insert occurs because validation fails first."),
                new LabMetric("Rejected Field", "request.product", "The product field must have length at least 2."),
                new LabMetric("Rejected Quantity", "0", "Quantity must be at least 1.")
            ),
            List.of(
                new LabStep("dispatch", "Request enters order controller", "The invalid JSON body is routed to the create-order handler.", "dispatch", "info"),
                new LabStep("json-bind", "Body bound to request record", "JSON mapping succeeds before bean validation runs.", "bind", "success"),
                new LabStep("validate", "Bean validation rejects payload", "Constraint checks fail for product length and quantity minimum.", "validate", "error"),
                new LabStep("resolve-error", "Exception resolver prepares 400", "ValidationException is converted into a structured client error response.", "400", "error"),
                new LabStep("trace-response", "Lab trace serialized", "The lab endpoint returns the normalized validation branch payload.", "json", "success")
            ),
            List.of(
                new LabLane("lane-web", "Web", "HTTP dispatch, JSON binding, and validation error response writing.", "web", List.of(
                    new LabLaneEvent("web-1", "POST /orders", "info"),
                    new LabLaneEvent("web-2", "@Valid CreateOrderRequest", "error"),
                    new LabLaneEvent("web-3", "400 JSON response", "error")
                )),
                new LabLane("lane-service", "Service", "Service layer remains untouched because validation stops the request earlier.", "service", List.of(
                    new LabLaneEvent("service-1", "OrderService skipped", "info")
                )),
                new LabLane("lane-tx", "Transaction", "No transaction is opened for a rejected request.", "tx", List.of(
                    new LabLaneEvent("tx-1", "not started", "info")
                )),
                new LabLane("lane-jdbc", "JDBC", "No JDBC call occurs for the rejected request.", "jdbc", List.of(
                    new LabLaneEvent("jdbc-1", "no SQL executed", "info")
                ))
            ),
            new LabSnapshot(
                "Validation happens before business logic, which is why this branch never reaches the service proxy or transaction interceptor.",
                "This is useful in the UI because it shows that not every error branch is a rollback branch.",
                "Compare this with rollback and service-error to see where the failure occurs relative to the transactional boundary."
            ),
            List.of(
                "example-app/src/main/java/lite/spring/example/order/OrderController.java",
                "spring-lite-core/src/main/java/lite/spring/core/validation/ValidationException.java",
                "spring-lite-web/src/main/java/lite/spring/web/exception/DefaultExceptionResolver.java"
            )
        );
    }

    private LabTraceResponse runNotFoundScenario() {
        try {
            orderService.getOrder(999L);
            throw new IllegalStateException("Expected missing order for live lab scenario");
        } catch (IllegalArgumentException exception) {
            return new LabTraceResponse(
                "live-example-flow-not-found",
                "example-flow",
                "Example Flow Trace",
                "live",
                "not-found",
                "Live trace generated by executing the real service lookup path for a missing order id.",
                List.of(
                    new LabMetric("HTTP Status", "400", "The example app maps IllegalArgumentException to a client error response."),
                    new LabMetric("Tx Outcome", "not-started", "The lookup method is not transactional in this example app."),
                    new LabMetric("DB Effect", "select-miss", "A select executes but no row is returned."),
                    new LabMetric("Lookup Id", "999", "The trace intentionally requests a missing order id."),
                    new LabMetric("Exception", "IllegalArgumentException", "The service throws the not-found error used by the resolver.")
                ),
                List.of(
                    new LabStep("dispatch", "Lookup request dispatched", "The lab endpoint triggers the order lookup path with a missing id.", "dispatch", "info"),
                    new LabStep("service-call", "OrderService.getOrder invoked", "The real service implementation executes its repository lookup path.", "getOrder", "success"),
                    new LabStep("jdbc-select", "Repository returns no row", "JdbcOrderRepository receives a null row result for the missing key.", "select", "error"),
                    new LabStep("service-error", "Service throws not-found error", "DefaultOrderService raises IllegalArgumentException for the missing order.", "throw", "error"),
                    new LabStep("trace-response", "Lab trace serialized", "The backend normalizes the failure into the LabTrace payload.", "json", "success")
                ),
                List.of(
                    new LabLane("lane-web", "Web", "Trace request entry and normalized response writing.", "web", List.of(
                        new LabLaneEvent("web-1", "POST /lab/run/trace", "info"),
                        new LabLaneEvent("web-2", "trace controller", "success"),
                        new LabLaneEvent("web-3", "normalized failure payload", "success")
                    )),
                    new LabLane("lane-service", "Service", "Actual order lookup and exception throw.", "service", List.of(
                        new LabLaneEvent("service-1", "getOrder(999)", "success"),
                        new LabLaneEvent("service-2", "IllegalArgumentException", "error")
                    )),
                    new LabLane("lane-tx", "Transaction", "No transaction boundary is entered for this read method.", "tx", List.of(
                        new LabLaneEvent("tx-1", "not started", "info")
                    )),
                    new LabLane("lane-jdbc", "JDBC", "Repository performs a select for a missing primary key.", "jdbc", List.of(
                        new LabLaneEvent("jdbc-1", "select ... where id = 999", "success"),
                        new LabLaneEvent("jdbc-2", "0 rows", "error")
                    ))
                ),
                new LabSnapshot(
                    "This branch executes real service and repository code, but it does not open a transaction because the lookup method is non-transactional.",
                    "That difference is useful when comparing create, not-found, and rollback in the visual timeline.",
                    "The same exception type would surface differently in a real `/orders/{id}` request because the exception resolver shapes the final HTTP response."
                ),
                List.of(
                    "example-app/src/main/java/lite/spring/example/order/DefaultOrderService.java",
                    "example-app/src/main/java/lite/spring/example/order/JdbcOrderRepository.java",
                    "spring-lite-web/src/main/java/lite/spring/web/exception/DefaultExceptionResolver.java"
                )
            );
        }
    }

    private LabTraceResponse runServiceErrorScenario() {
        try {
            orderService.failForLab("Lab service failure before repository work");
            throw new IllegalStateException("Expected lab service failure");
        } catch (IllegalStateException exception) {
            return new LabTraceResponse(
                "live-example-flow-service-error",
                "example-flow",
                "Example Flow Trace",
                "live",
                "service-error",
                "Live trace generated by invoking a transactional service method that fails before any repository mutation.",
                List.of(
                    new LabMetric("HTTP Status", "500", "An unexpected service exception would be treated as a server error."),
                    new LabMetric("Tx Outcome", "rollback", "The transactional method opens and then rolls back immediately."),
                    new LabMetric("DB Effect", "none", "No insert is attempted before the failure is raised."),
                    new LabMetric("Exception", "IllegalStateException", "The service method throws an unexpected runtime exception."),
                    new LabMetric("Failure Point", "service", "The error originates in the service layer before JDBC work.")
                ),
                List.of(
                    new LabStep("dispatch", "Trace request enters backend", "The frontend invokes the live lab endpoint for a service-error branch.", "dispatch", "info"),
                    new LabStep("service-proxy", "Transactional service proxy invoked", "The trace service calls a real proxied service method.", "proxy", "success"),
                    new LabStep("tx-begin", "Transaction boundary opens", "The interceptor starts a transaction before the service body executes.", "begin()", "success"),
                    new LabStep("service-throw", "Service raises runtime exception", "The method deliberately fails before any repository operation.", "throw", "error"),
                    new LabStep("tx-rollback", "Transaction rolls back", "The interceptor rolls back because the exception escapes the method.", "rollback()", "error"),
                    new LabStep("trace-response", "Lab trace serialized", "The failure is normalized for the frontend UI instead of rethrown.", "json", "success")
                ),
                List.of(
                    new LabLane("lane-web", "Web", "Trace endpoint request and normalized response.", "web", List.of(
                        new LabLaneEvent("web-1", "POST /lab/run/trace", "info"),
                        new LabLaneEvent("web-2", "trace controller", "success"),
                        new LabLaneEvent("web-3", "failure trace JSON", "success")
                    )),
                    new LabLane("lane-service", "Service", "Transactional service method that fails before repository work.", "service", List.of(
                        new LabLaneEvent("service-1", "failForLab(...)", "success"),
                        new LabLaneEvent("service-2", "IllegalStateException", "error")
                    )),
                    new LabLane("lane-tx", "Transaction", "Rollback of a transaction with no JDBC mutation.", "tx", List.of(
                        new LabLaneEvent("tx-1", "begin depth=1", "success"),
                        new LabLaneEvent("tx-2", "rollback", "error")
                    )),
                    new LabLane("lane-jdbc", "JDBC", "The repository is never reached for this scenario.", "jdbc", List.of(
                        new LabLaneEvent("jdbc-1", "skipped", "info")
                    ))
                ),
                new LabSnapshot(
                    "This branch demonstrates that a rollback can happen even when no SQL mutation occurred.",
                    "It isolates the service and transaction interceptors from repository behavior, which makes the timeline easier to reason about.",
                    "Compare it with rollback to see the difference between 'error before write' and 'error after write'."
                ),
                List.of(
                    "example-app/src/main/java/lite/spring/example/order/DefaultOrderService.java",
                    "spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionalBeanPostProcessor.java"
                )
            );
        }
    }

    private LabTraceResponse runRollbackScenario() {
        int beforeCount = orderService.listOrders().size();

        try {
            orderService.createOrderAndFail("lab-rollback-book", 1);
            throw new IllegalStateException("Expected rollback scenario to fail");
        } catch (IllegalStateException exception) {
            int afterCount = orderService.listOrders().size();
            return new LabTraceResponse(
                "live-example-flow-rollback",
                "example-flow",
                "Example Flow Trace",
                "live",
                "rollback",
                "Live trace generated by executing a real transactional insert followed by a deliberate service failure.",
                List.of(
                    new LabMetric("HTTP Status", "500", "An uncaught service failure would map to a server error."),
                    new LabMetric("Tx Outcome", "rollback", "The transaction is rolled back after the service throws."),
                    new LabMetric("DB Effect", "insert rolled back", "The repository performs an insert, but the row is not committed."),
                    new LabMetric("Orders Before", String.valueOf(beforeCount), "Visible row count before the failing transaction starts."),
                    new LabMetric("Orders After", String.valueOf(afterCount), "Visible row count after rollback proves no net new row remained.")
                ),
                List.of(
                    new LabStep("dispatch", "Trace request enters backend", "The live lab endpoint starts the rollback branch.", "dispatch", "info"),
                    new LabStep("service-proxy", "Transactional service proxy invoked", "The trace service calls a real proxied service method.", "proxy", "success"),
                    new LabStep("tx-begin", "Transaction boundary opens", "The interceptor binds a transaction-aware connection.", "begin()", "success"),
                    new LabStep("jdbc-insert", "Repository inserts order", "JdbcOrderRepository writes a row inside the open transaction.", "insert", "success"),
                    new LabStep("service-throw", "Service fails after insert", "The method throws after persistence to force rollback.", "throw", "error"),
                    new LabStep("tx-rollback", "Transaction rolls back", "The interceptor rolls back the connection and discards the inserted row.", "rollback()", "error"),
                    new LabStep("trace-response", "Lab trace serialized", "The backend returns a normalized rollback trace for the UI.", "json", "success")
                ),
                List.of(
                    new LabLane("lane-web", "Web", "Trace endpoint dispatch and response writing.", "web", List.of(
                        new LabLaneEvent("web-1", "POST /lab/run/trace", "info"),
                        new LabLaneEvent("web-2", "trace controller", "success"),
                        new LabLaneEvent("web-3", "rollback trace JSON", "success")
                    )),
                    new LabLane("lane-service", "Service", "Transactional create-and-fail service method.", "service", List.of(
                        new LabLaneEvent("service-1", "createOrderAndFail(...)", "success"),
                        new LabLaneEvent("service-2", "IllegalStateException", "error")
                    )),
                    new LabLane("lane-tx", "Transaction", "Full begin -> rollback lifecycle.", "tx", List.of(
                        new LabLaneEvent("tx-1", "begin depth=1", "success"),
                        new LabLaneEvent("tx-2", "rollback", "error")
                    )),
                    new LabLane("lane-jdbc", "JDBC", "Insert executes but is later discarded by rollback.", "jdbc", List.of(
                        new LabLaneEvent("jdbc-1", "insert into orders ...", "success"),
                        new LabLaneEvent("jdbc-2", "row not committed", "error")
                    ))
                ),
                new LabSnapshot(
                    "This is the most important dynamic branch for transaction study because it performs real JDBC work and still leaves the database unchanged.",
                    "The before/after order counts make the rollback outcome visible without requiring direct database inspection in the UI.",
                    "When compared with create, the only behavioral difference is the exception after the repository call, yet the outcome flips from commit to rollback."
                ),
                List.of(
                    "example-app/src/main/java/lite/spring/example/order/DefaultOrderService.java",
                    "example-app/src/main/java/lite/spring/example/order/JdbcOrderRepository.java",
                    "spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionalBeanPostProcessor.java"
                )
            );
        }
    }
}
