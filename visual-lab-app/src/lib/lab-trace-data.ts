import type { LabTrace } from "./types";

export const staticTraceCatalog: Record<string, LabTrace> = {
  "example-flow:create": {
    id: "trace-example-flow-create",
    labId: "example-flow",
    title: "Example Flow Trace",
    mode: "static",
    scenario: "create",
    summary: "Static baseline trace for the happy-path order creation flow.",
    metrics: [
      { label: "HTTP Status", value: "200", detail: "JSON response completed successfully." },
      { label: "Tx Outcome", value: "commit", detail: "Transactional service boundary committed." },
      { label: "DB Effect", value: "insert", detail: "Repository persisted the new order row." }
    ],
    steps: [
      {
        id: "dispatch",
        title: "Request enters DispatcherServlet",
        detail: "The request reaches the MVC entrypoint before any controller logic runs.",
        marker: "dispatch",
        kind: "info"
      },
      {
        id: "bind",
        title: "Request body deserialized",
        detail: "The request body is mapped into the command object.",
        marker: "bind",
        kind: "success"
      },
      {
        id: "tx",
        title: "Transaction boundary opens",
        detail: "The service proxy begins the transactional unit of work.",
        marker: "begin()",
        kind: "success"
      },
      {
        id: "jdbc",
        title: "Repository persists the order",
        detail: "The repository writes the order through JdbcTemplate.",
        marker: "insert",
        kind: "success"
      },
      {
        id: "response",
        title: "Response serialized",
        detail: "The controller return value is rendered as JSON.",
        marker: "json",
        kind: "success"
      }
    ],
    lanes: [
      {
        id: "lane-web",
        label: "Web",
        detail: "Request routing, binding, validation, and response writing.",
        kind: "web",
        events: [
          { id: "web-1", text: "DispatcherServlet", kind: "info" },
          { id: "web-2", text: "OrderController", kind: "success" },
          { id: "web-3", text: "200 JSON response", kind: "success" }
        ]
      },
      {
        id: "lane-service",
        label: "Service",
        detail: "Business entry and orchestration.",
        kind: "service",
        events: [
          { id: "svc-1", text: "createOrder(...)", kind: "success" },
          { id: "svc-2", text: "status=PENDING_APPROVAL", kind: "info" }
        ]
      },
      {
        id: "lane-tx",
        label: "Transaction",
        detail: "Transactional boundary lifecycle.",
        kind: "tx",
        events: [
          { id: "tx-1", text: "begin depth=1", kind: "success" },
          { id: "tx-2", text: "commit", kind: "success" }
        ]
      },
      {
        id: "lane-jdbc",
        label: "JDBC",
        detail: "Connection reuse and row persistence.",
        kind: "jdbc",
        events: [
          { id: "jdbc-1", text: "reuse tx connection", kind: "info" },
          { id: "jdbc-2", text: "insert into orders ...", kind: "success" }
        ]
      }
    ],
    snapshot: {
      watch: "This trace shows the smallest full-stack happy path that crosses MVC, service proxy, transaction, and JDBC layers.",
      why: "It is the best first live integration target because the trace shape already matches the existing educational UI.",
      next: "Wire this schema to a real `/lab/run/example-flow` endpoint so static and live modes render the same contract."
    },
    references: [
      "example-app/src/main/java/lite/spring/example/order/OrderController.java",
      "example-app/src/main/java/lite/spring/example/order/DefaultOrderService.java",
      "spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionInterceptor.java"
    ]
  },
  "playground:aop-success": {
    id: "trace-playground-aop-success",
    labId: "playground",
    title: "Playground AOP Trace",
    mode: "static",
    scenario: "aop-success",
    summary: "Static baseline trace for successful advice chain and transaction completion.",
    metrics: [
      { label: "Active Steps", value: "6", detail: "Advice and target phases executed." },
      { label: "Final Status", value: "committed", detail: "Target returned and tx committed." },
      { label: "Tx Depth Peak", value: "1", detail: "Single transactional boundary." }
    ],
    steps: [
      {
        id: "before",
        title: "@Before advice",
        detail: "The interceptor chain begins with pre-target advice.",
        marker: "before()",
        kind: "info"
      },
      {
        id: "around",
        title: "@Around enters",
        detail: "Around advice wraps the remaining chain.",
        marker: "around-enter",
        kind: "info"
      },
      {
        id: "begin",
        title: "Transaction begins",
        detail: "The service invocation opens its transactional boundary.",
        marker: "begin()",
        kind: "success"
      },
      {
        id: "target",
        title: "Target returns value",
        detail: "The business method completes normally.",
        marker: "return",
        kind: "success"
      },
      {
        id: "commit",
        title: "Transaction commits",
        detail: "The outermost boundary commits the work.",
        marker: "commit()",
        kind: "success"
      },
      {
        id: "exit",
        title: "@Around exits",
        detail: "The wrapper returns the decorated result to the caller.",
        marker: "around-exit",
        kind: "success"
      }
    ],
    lanes: [
      {
        id: "caller",
        label: "Caller",
        detail: "Client side view of the invocation boundary.",
        kind: "generic",
        events: [
          { id: "caller-1", text: "proxy.invoke", kind: "info" },
          { id: "caller-2", text: "return to caller", kind: "success" }
        ]
      },
      {
        id: "proxy",
        label: "Proxy / Advice",
        detail: "Advice ordering around target invocation.",
        kind: "generic",
        events: [
          { id: "proxy-1", text: "@Before", kind: "info" },
          { id: "proxy-2", text: "@Around enter", kind: "info" },
          { id: "proxy-3", text: "@Around exit", kind: "success" }
        ]
      },
      {
        id: "tx-lane",
        label: "Transaction",
        detail: "Begin and commit events for the root boundary.",
        kind: "tx",
        events: [
          { id: "tx-lane-1", text: "begin depth=1", kind: "success" },
          { id: "tx-lane-2", text: "commit", kind: "success" }
        ]
      }
    ],
    snapshot: {
      watch: "The small AOP trace is intentionally compact so advice order and transaction order stay visible together.",
      why: "This is the smallest reusable trace shape for proving that the frontend can render steps, lanes, metrics, and snapshot text from one schema.",
      next: "Use the same schema for MVC, rollback, and nested REQUIRED traces so the playground can switch providers without UI rewrites."
    },
    references: [
      "spring-lite-aop/src/main/java/lite/spring/aop/support/AspectBeanPostProcessor.java",
      "spring-lite-aop/src/main/java/lite/spring/aop/MethodInvocation.java",
      "spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionManager.java"
    ]
  }
};
