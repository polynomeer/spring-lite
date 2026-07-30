import type { LabTrace } from "./types";

const exampleFlowReferences = [
  "example-app/src/main/java/lite/spring/example/order/OrderController.java",
  "example-app/src/main/java/lite/spring/example/order/DefaultOrderService.java",
  "example-app/src/main/java/lite/spring/example/order/JdbcOrderRepository.java",
  "spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionalBeanPostProcessor.java"
];

const playgroundReferences = [
  "spring-lite-aop/src/main/java/lite/spring/aop/support/AspectBeanPostProcessor.java",
  "spring-lite-aop/src/main/java/lite/spring/aop/MethodInvocation.java",
  "spring-lite-web/src/main/java/lite/spring/web/support/DispatcherServlet.java",
  "spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionManager.java"
];

const containerReferences = [
  "spring-lite-context/src/main/java/lite/spring/context/support/AnnotationConfigApplicationContext.java",
  "spring-lite-context/src/main/java/lite/spring/context/support/DefaultListableBeanFactory.java",
  "spring-lite-context/src/main/java/lite/spring/context/support/AutowiredAnnotationBeanPostProcessor.java",
  "spring-lite-aop/src/main/java/lite/spring/aop/support/ProxyFactory.java"
];

const comparisonReferences = [
  "sample-scenarios/01-di/README.md",
  "sample-scenarios/02-mvc/README.md",
  "sample-scenarios/03-transaction/README.md",
  "docs/architecture/spring-lite-to-real-spring-code-map.md"
];

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
      { id: "dispatch", title: "Request enters DispatcherServlet", detail: "The request reaches the MVC entrypoint before any controller logic runs.", marker: "dispatch", kind: "info" },
      { id: "bind", title: "Request body deserialized", detail: "The request body is mapped into the command object.", marker: "bind", kind: "success" },
      { id: "tx", title: "Transaction boundary opens", detail: "The service proxy begins the transactional unit of work.", marker: "begin()", kind: "success" },
      { id: "jdbc", title: "Repository persists the order", detail: "The repository writes the order through JdbcTemplate.", marker: "insert", kind: "success" },
      { id: "response", title: "Response serialized", detail: "The controller return value is rendered as JSON.", marker: "json", kind: "success" }
    ],
    lanes: [
      { id: "lane-web", label: "Web", detail: "Request routing, binding, validation, and response writing.", kind: "web", events: [
        { id: "web-1", text: "DispatcherServlet", kind: "info" },
        { id: "web-2", text: "OrderController", kind: "success" },
        { id: "web-3", text: "200 JSON response", kind: "success" }
      ]},
      { id: "lane-service", label: "Service", detail: "Business entry and orchestration.", kind: "service", events: [
        { id: "svc-1", text: "createOrder(...)", kind: "success" },
        { id: "svc-2", text: "status=PENDING_APPROVAL", kind: "info" }
      ]},
      { id: "lane-tx", label: "Transaction", detail: "Transactional boundary lifecycle.", kind: "tx", events: [
        { id: "tx-1", text: "begin depth=1", kind: "success" },
        { id: "tx-2", text: "commit", kind: "success" }
      ]},
      { id: "lane-jdbc", label: "JDBC", detail: "Connection reuse and row persistence.", kind: "jdbc", events: [
        { id: "jdbc-1", text: "reuse tx connection", kind: "info" },
        { id: "jdbc-2", text: "insert into orders ...", kind: "success" }
      ]}
    ],
    snapshot: {
      watch: "This trace shows the smallest full-stack happy path that crosses MVC, service proxy, transaction, and JDBC layers.",
      why: "It is the best first live integration target because the trace shape already matches the existing educational UI.",
      next: "Compare this with validation and rollback to separate client errors from transactional failures."
    },
    references: exampleFlowReferences
  },
  "example-flow:validation": {
    id: "trace-example-flow-validation",
    labId: "example-flow",
    title: "Example Flow Trace",
    mode: "static",
    scenario: "validation",
    summary: "Static validation branch where request binding succeeds but bean validation rejects the payload before service logic.",
    metrics: [
      { label: "HTTP Status", value: "400", detail: "Validation failure is returned as a client error." },
      { label: "Tx Outcome", value: "not-started", detail: "No transactional service boundary is entered." },
      { label: "DB Effect", value: "none", detail: "Repository work is skipped." }
    ],
    steps: [
      { id: "dispatch", title: "DispatcherServlet matches route", detail: "The POST request resolves to the create-order handler.", marker: "route", kind: "info" },
      { id: "bind", title: "Request body mapped", detail: "JSON is parsed into CreateOrderRequest.", marker: "bind", kind: "success" },
      { id: "validate", title: "Bean validation fails", detail: "Constraints on product length and quantity minimum are violated.", marker: "@Valid", kind: "error" },
      { id: "resolve", title: "Exception resolver formats error", detail: "ValidationException becomes a structured 400 response.", marker: "400", kind: "error" }
    ],
    lanes: [
      { id: "validation-web", label: "Web", detail: "Binding, validation, and error response writing.", kind: "web", events: [
        { id: "validation-web-1", text: "POST /orders", kind: "info" },
        { id: "validation-web-2", text: "CreateOrderRequest bound", kind: "success" },
        { id: "validation-web-3", text: "ValidationException", kind: "error" }
      ]},
      { id: "validation-service", label: "Service", detail: "No service invocation happens.", kind: "service", events: [
        { id: "validation-service-1", text: "OrderService skipped", kind: "warning" }
      ]},
      { id: "validation-jdbc", label: "JDBC", detail: "No JDBC interaction happens.", kind: "jdbc", events: [
        { id: "validation-jdbc-1", text: "no SQL", kind: "warning" }
      ]}
    ],
    snapshot: {
      watch: "Validation errors are not transaction errors, and this branch makes that distinction explicit.",
      why: "Many readers over-generalize every failure as rollback; here the service proxy never even runs.",
      next: "Use this branch to teach the order of dispatch, binding, validation, controller invocation, and exception resolution."
    },
    references: exampleFlowReferences
  },
  "example-flow:not-found": {
    id: "trace-example-flow-not-found",
    labId: "example-flow",
    title: "Example Flow Trace",
    mode: "static",
    scenario: "not-found",
    summary: "Static lookup branch for a missing order id where the service throws after a repository read miss.",
    metrics: [
      { label: "HTTP Status", value: "400", detail: "The example resolver maps IllegalArgumentException to a client-visible error." },
      { label: "Tx Outcome", value: "not-started", detail: "The read path is non-transactional in the sample app." },
      { label: "DB Effect", value: "select-miss", detail: "A select runs but returns no row." }
    ],
    steps: [
      { id: "route", title: "GET route selected", detail: "DispatcherServlet resolves the path variable and chooses the order lookup handler.", marker: "GET /orders/{id}", kind: "info" },
      { id: "service", title: "Service delegates to repository", detail: "DefaultOrderService invokes the repository lookup.", marker: "getOrder", kind: "success" },
      { id: "jdbc", title: "Repository finds no row", detail: "JdbcOrderRepository receives a null result from JdbcTemplate.", marker: "select", kind: "error" },
      { id: "throw", title: "Service raises not-found error", detail: "IllegalArgumentException is thrown for the missing order id.", marker: "throw", kind: "error" }
    ],
    lanes: [
      { id: "not-found-web", label: "Web", detail: "Request mapping and error shaping.", kind: "web", events: [
        { id: "not-found-web-1", text: "GET /orders/999", kind: "info" },
        { id: "not-found-web-2", text: "400 error payload", kind: "error" }
      ]},
      { id: "not-found-service", label: "Service", detail: "Service read path and exception throw.", kind: "service", events: [
        { id: "not-found-service-1", text: "getOrder(999)", kind: "success" },
        { id: "not-found-service-2", text: "IllegalArgumentException", kind: "error" }
      ]},
      { id: "not-found-jdbc", label: "JDBC", detail: "Primary-key lookup miss.", kind: "jdbc", events: [
        { id: "not-found-jdbc-1", text: "select ... where id = 999", kind: "success" },
        { id: "not-found-jdbc-2", text: "0 rows", kind: "error" }
      ]}
    ],
    snapshot: {
      watch: "The read path still crosses service and JDBC, but it never opens a transaction in this sample.",
      why: "That makes it a clean contrast with create and rollback, where the transaction layer changes the final outcome.",
      next: "Line this trace up with rollback to see how similar call graphs diverge once a write and a transaction are involved."
    },
    references: exampleFlowReferences
  },
  "example-flow:rollback": {
    id: "trace-example-flow-rollback",
    labId: "example-flow",
    title: "Example Flow Trace",
    mode: "static",
    scenario: "rollback",
    summary: "Static failure-after-insert branch showing how a transactional write is discarded on rollback.",
    metrics: [
      { label: "HTTP Status", value: "500", detail: "The service failure would be treated as a server error." },
      { label: "Tx Outcome", value: "rollback", detail: "The interceptor marks the unit of work as failed and rolls back." },
      { label: "DB Effect", value: "insert rolled back", detail: "The repository ran insert SQL but no row remained committed." }
    ],
    steps: [
      { id: "dispatch", title: "Request enters flow controller", detail: "The lab drives the create-and-fail branch through the normal request path.", marker: "dispatch", kind: "info" },
      { id: "tx", title: "Transactional proxy starts unit", detail: "The create-order method is invoked through the transactional interceptor.", marker: "begin()", kind: "success" },
      { id: "insert", title: "Repository inserts row", detail: "JdbcOrderRepository writes the pending order inside the open transaction.", marker: "insert", kind: "success" },
      { id: "error", title: "Service throws after insert", detail: "The service deliberately fails to force rollback behavior.", marker: "throw", kind: "error" },
      { id: "rollback", title: "Transaction rolls back", detail: "The open connection is rolled back and the inserted row disappears.", marker: "rollback()", kind: "error" }
    ],
    lanes: [
      { id: "rollback-web", label: "Web", detail: "Dispatch and response shaping.", kind: "web", events: [
        { id: "rollback-web-1", text: "POST /orders", kind: "info" },
        { id: "rollback-web-2", text: "500 error path", kind: "error" }
      ]},
      { id: "rollback-service", label: "Service", detail: "Create-and-fail service branch.", kind: "service", events: [
        { id: "rollback-service-1", text: "createOrderAndFail(...)", kind: "success" },
        { id: "rollback-service-2", text: "IllegalStateException", kind: "error" }
      ]},
      { id: "rollback-tx", label: "Transaction", detail: "Root transaction begin and rollback.", kind: "tx", events: [
        { id: "rollback-tx-1", text: "begin depth=1", kind: "success" },
        { id: "rollback-tx-2", text: "rollback", kind: "error" }
      ]},
      { id: "rollback-jdbc", label: "JDBC", detail: "Write executed but discarded.", kind: "jdbc", events: [
        { id: "rollback-jdbc-1", text: "insert into orders ...", kind: "success" },
        { id: "rollback-jdbc-2", text: "row not committed", kind: "error" }
      ]}
    ],
    snapshot: {
      watch: "This branch is the best compact illustration of why transaction boundaries exist at all.",
      why: "Without rollback, partially completed write work would leak into persistent state after an exception.",
      next: "Use the live endpoint for this branch to prove that the before/after visible row count stays unchanged."
    },
    references: exampleFlowReferences
  },
  "example-flow:service-error": {
    id: "trace-example-flow-service-error",
    labId: "example-flow",
    title: "Example Flow Trace",
    mode: "static",
    scenario: "service-error",
    summary: "Static service-layer failure branch where the transactional method fails before JDBC mutation begins.",
    metrics: [
      { label: "HTTP Status", value: "500", detail: "Unexpected service failure maps to a server error path." },
      { label: "Tx Outcome", value: "rollback", detail: "A transaction opens and rolls back immediately." },
      { label: "DB Effect", value: "none", detail: "No SQL mutation happens before the exception." }
    ],
    steps: [
      { id: "service-dispatch", title: "Request reaches service boundary", detail: "The request crosses MVC and invokes the transactional service proxy.", marker: "dispatch", kind: "info" },
      { id: "service-tx", title: "Transaction begins", detail: "The interceptor opens a transaction before the method body runs.", marker: "begin()", kind: "success" },
      { id: "service-fail", title: "Service raises runtime exception", detail: "The failure happens before repository work starts.", marker: "throw", kind: "error" },
      { id: "service-rollback", title: "Transaction rolls back", detail: "The boundary exits through rollback with no persisted change.", marker: "rollback()", kind: "error" }
    ],
    lanes: [
      { id: "service-error-web", label: "Web", detail: "Request entry and failure response shaping.", kind: "web", events: [
        { id: "service-error-web-1", text: "POST /orders", kind: "info" },
        { id: "service-error-web-2", text: "500 error path", kind: "error" }
      ]},
      { id: "service-error-service", label: "Service", detail: "Failure originates inside the service method itself.", kind: "service", events: [
        { id: "service-error-service-1", text: "failForLab(...)", kind: "success" },
        { id: "service-error-service-2", text: "IllegalStateException", kind: "error" }
      ]},
      { id: "service-error-tx", label: "Transaction", detail: "Begin then rollback with no write work.", kind: "tx", events: [
        { id: "service-error-tx-1", text: "begin depth=1", kind: "success" },
        { id: "service-error-tx-2", text: "rollback", kind: "error" }
      ]},
      { id: "service-error-jdbc", label: "JDBC", detail: "Repository path never runs.", kind: "jdbc", events: [
        { id: "service-error-jdbc-1", text: "skipped", kind: "warning" }
      ]}
    ],
    snapshot: {
      watch: "Rollback does not imply that JDBC write work already happened.",
      why: "This branch isolates the service proxy and transaction boundary from persistence concerns.",
      next: "Compare this with rollback-after-insert to distinguish 'error before write' from 'error after write'."
    },
    references: exampleFlowReferences
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
      { id: "before", title: "@Before advice", detail: "The interceptor chain begins with pre-target advice.", marker: "before()", kind: "info" },
      { id: "around", title: "@Around enters", detail: "Around advice wraps the remaining chain.", marker: "around-enter", kind: "info" },
      { id: "begin", title: "Transaction begins", detail: "The service invocation opens its transactional boundary.", marker: "begin()", kind: "success" },
      { id: "target", title: "Target returns value", detail: "The business method completes normally.", marker: "return", kind: "success" },
      { id: "commit", title: "Transaction commits", detail: "The outermost boundary commits the work.", marker: "commit()", kind: "success" },
      { id: "exit", title: "@Around exits", detail: "The wrapper returns the decorated result to the caller.", marker: "around-exit", kind: "success" }
    ],
    lanes: [
      { id: "caller", label: "Caller", detail: "Client side view of the invocation boundary.", kind: "generic", events: [
        { id: "caller-1", text: "proxy.invoke", kind: "info" },
        { id: "caller-2", text: "return to caller", kind: "success" }
      ]},
      { id: "proxy", label: "Proxy / Advice", detail: "Advice ordering around target invocation.", kind: "generic", events: [
        { id: "proxy-1", text: "@Before", kind: "info" },
        { id: "proxy-2", text: "@Around enter", kind: "info" },
        { id: "proxy-3", text: "@Around exit", kind: "success" }
      ]},
      { id: "tx-lane", label: "Transaction", detail: "Begin and commit events for the root boundary.", kind: "tx", events: [
        { id: "tx-lane-1", text: "begin depth=1", kind: "success" },
        { id: "tx-lane-2", text: "commit", kind: "success" }
      ]}
    ],
    snapshot: {
      watch: "The small AOP trace is intentionally compact so advice order and transaction order stay visible together.",
      why: "This is the smallest reusable trace shape for proving that the frontend can render steps, lanes, metrics, and snapshot text from one schema.",
      next: "Add rollback and nested REQUIRED variants so the playground becomes the first place to test raw trace rendering changes."
    },
    references: playgroundReferences
  },
  "playground:aop-rollback": {
    id: "trace-playground-aop-rollback",
    labId: "playground",
    title: "Playground AOP Trace",
    mode: "static",
    scenario: "aop-rollback",
    summary: "Advice chain variant where the target looks normal from the outside but the transaction is forced into rollback.",
    metrics: [
      { label: "Active Steps", value: "7", detail: "Advice, target, and rollback phases executed." },
      { label: "Final Status", value: "rolled-back", detail: "The outer completion path flips from commit to rollback." },
      { label: "Focus", value: "order", detail: "Advice order and tx order must be read together." }
    ],
    steps: [
      { id: "before", title: "@Before advice", detail: "Pre-target advice runs before the transactional call.", marker: "before()", kind: "info" },
      { id: "around-enter", title: "@Around enters", detail: "Around advice wraps the target invocation.", marker: "around-enter", kind: "info" },
      { id: "begin", title: "Transaction begins", detail: "The root transaction opens before calling the target.", marker: "begin()", kind: "success" },
      { id: "target", title: "Target returns normally", detail: "Business code returns, but a nested decision marks rollback-only.", marker: "return", kind: "warning" },
      { id: "mark", title: "Rollback-only state observed", detail: "The outer boundary now knows commit must turn into rollback.", marker: "rollbackOnly", kind: "warning" },
      { id: "rollback", title: "Commit path becomes rollback", detail: "The final transaction exit rolls back instead of committing.", marker: "rollback()", kind: "error" },
      { id: "around-exit", title: "@Around exits", detail: "Advice chain unwinds with a failed transaction outcome.", marker: "around-exit", kind: "error" }
    ],
    lanes: [
      { id: "aop-rollback-caller", label: "Caller", detail: "The invocation still looks like a single proxied call.", kind: "generic", events: [
        { id: "aop-rollback-caller-1", text: "proxy.invoke", kind: "info" },
        { id: "aop-rollback-caller-2", text: "observed failure semantics", kind: "error" }
      ]},
      { id: "aop-rollback-proxy", label: "Proxy / Advice", detail: "Advice order remains the same even when transaction outcome changes.", kind: "generic", events: [
        { id: "aop-rollback-proxy-1", text: "@Before", kind: "info" },
        { id: "aop-rollback-proxy-2", text: "@Around enter", kind: "info" },
        { id: "aop-rollback-proxy-3", text: "@Around exit", kind: "error" }
      ]},
      { id: "aop-rollback-tx", label: "Transaction", detail: "Rollback-only propagation changes the final exit behavior.", kind: "tx", events: [
        { id: "aop-rollback-tx-1", text: "begin depth=1", kind: "success" },
        { id: "aop-rollback-tx-2", text: "mark rollback-only", kind: "warning" },
        { id: "aop-rollback-tx-3", text: "rollback", kind: "error" }
      ]}
    ],
    snapshot: {
      watch: "The target can look successful in isolation while the transactional result still becomes rollback.",
      why: "This is the mental model readers need before they can reason about nested REQUIRED propagation and rollback-only.",
      next: "Use this alongside the transaction chapter to explain why outer commit calls sometimes do not commit at all."
    },
    references: playgroundReferences
  },
  "playground:mvc-validation": {
    id: "trace-playground-mvc-validation",
    labId: "playground",
    title: "Playground MVC Trace",
    mode: "static",
    scenario: "mvc-validation",
    summary: "Compact MVC trace for a request that binds but fails validation before controller work becomes meaningful.",
    metrics: [
      { label: "Route Match", value: "yes", detail: "The request mapped to a handler." },
      { label: "Body Status", value: "bound", detail: "JSON parsing completed before validation failed." },
      { label: "Response", value: "400", detail: "Client error shaped by the exception resolver." }
    ],
    steps: [
      { id: "mvc-route", title: "Handler method resolved", detail: "DispatcherServlet selects the order creation handler.", marker: "mapping", kind: "success" },
      { id: "mvc-body", title: "Body converted", detail: "RequestMappingHandlerAdapter binds JSON into the request object.", marker: "@RequestBody", kind: "success" },
      { id: "mvc-valid", title: "Validation rejects payload", detail: "Constraint annotations fail during argument resolution.", marker: "@Valid", kind: "error" },
      { id: "mvc-render", title: "Error response written", detail: "The resolver writes a structured 400 payload.", marker: "write", kind: "error" }
    ],
    lanes: [
      { id: "mvc-router", label: "Router", detail: "Path and method mapping.", kind: "web", events: [
        { id: "mvc-router-1", text: "POST /orders", kind: "success" }
      ]},
      { id: "mvc-binding", label: "Binding", detail: "Argument resolution and validation.", kind: "web", events: [
        { id: "mvc-binding-1", text: "JSON -> request object", kind: "success" },
        { id: "mvc-binding-2", text: "constraint violations", kind: "error" }
      ]},
      { id: "mvc-response", label: "Response", detail: "Response shaping and writing.", kind: "web", events: [
        { id: "mvc-response-1", text: "400 JSON", kind: "error" }
      ]}
    ],
    snapshot: {
      watch: "MVC can explain a large fraction of request behavior without touching service or persistence layers at all.",
      why: "This playground scenario keeps the focus on routing, binding, validation, and exception handling only.",
      next: "Pair it with the full example-flow trace once you want to extend the same request into service and transaction layers."
    },
    references: playgroundReferences
  },
  "container:bootstrap-full": {
    id: "trace-container-bootstrap-full",
    labId: "container",
    title: "Container Bootstrap Trace",
    mode: "static",
    scenario: "bootstrap-full",
    summary: "Static bootstrap trace covering registration, conditional decisions, infrastructure beans, and singleton pre-instantiation.",
    metrics: [
      { label: "Config Classes", value: "3", detail: "Configuration and component-scan roots loaded." },
      { label: "Bean Definitions", value: "12", detail: "Definitions registered before singleton creation begins." },
      { label: "Infra Layers", value: "AOP+JDBC+Web", detail: "Core infrastructure activated during refresh." }
    ],
    steps: [
      { id: "scan", title: "Configuration roots registered", detail: "The context collects explicit config classes and scan roots before refresh.", marker: "register()", kind: "info" },
      { id: "parse", title: "Bean definitions created", detail: "Configuration methods and scanned components become BeanDefinitions.", marker: "definitions", kind: "success" },
      { id: "conditional", title: "Conditional beans evaluated", detail: "Missing-bean conditions trim or keep optional infrastructure.", marker: "@ConditionalOnMissingBean", kind: "success" },
      { id: "infra", title: "Infrastructure defaults added", detail: "Core post-processors, proxy helpers, and runtime infrastructure join the registry.", marker: "defaults", kind: "success" },
      { id: "singletons", title: "Singleton pre-instantiation", detail: "Non-lazy singleton beans are created in dependency order.", marker: "instantiate", kind: "success" }
    ],
    lanes: [
      { id: "boot-registry", label: "Registry", detail: "Definition registration and condition evaluation.", kind: "container", events: [
        { id: "boot-registry-1", text: "register config classes", kind: "info" },
        { id: "boot-registry-2", text: "scan components", kind: "success" },
        { id: "boot-registry-3", text: "evaluate conditions", kind: "success" }
      ]},
      { id: "boot-infra", label: "Infrastructure", detail: "Core post-processors and runtime helpers.", kind: "container", events: [
        { id: "boot-infra-1", text: "Autowired processor", kind: "success" },
        { id: "boot-infra-2", text: "AOP processor", kind: "success" },
        { id: "boot-infra-3", text: "transaction infrastructure", kind: "success" }
      ]},
      { id: "boot-singletons", label: "Singletons", detail: "Bean creation and dependency resolution.", kind: "container", events: [
        { id: "boot-singletons-1", text: "resolve constructor deps", kind: "success" },
        { id: "boot-singletons-2", text: "create bean instances", kind: "success" },
        { id: "boot-singletons-3", text: "refresh complete", kind: "success" }
      ]}
    ],
    snapshot: {
      watch: "Bootstrap is mostly about turning metadata into a registry before real object creation starts.",
      why: "Once readers separate definition time from instantiation time, the whole container becomes easier to reason about.",
      next: "Use the lifecycle trace next to show what happens after a specific bean definition is chosen for instantiation."
    },
    references: containerReferences
  },
  "container:lifecycle-proxy": {
    id: "trace-container-lifecycle-proxy",
    labId: "container",
    title: "Container Lifecycle Trace",
    mode: "static",
    scenario: "lifecycle-proxy",
    summary: "Static bean lifecycle trace covering constructor injection, value resolution, post-processing, proxy exposure, and destroy handling.",
    metrics: [
      { label: "Bean Scope", value: "singleton", detail: "The bean stays in the singleton lifecycle path." },
      { label: "Proxy Mode", value: "aop", detail: "The exposed object differs from the raw instance." },
      { label: "Destroy Hook", value: "enabled", detail: "A shutdown callback is registered." }
    ],
    steps: [
      { id: "definition", title: "Bean definition selected", detail: "The factory chooses the target bean definition and its constructor path.", marker: "definition", kind: "info" },
      { id: "construct", title: "Constructor dependencies injected", detail: "Required collaborators are resolved before the instance is created.", marker: "new", kind: "success" },
      { id: "populate", title: "@Value and field injection applied", detail: "Property placeholders and autowired members are populated.", marker: "populate", kind: "success" },
      { id: "post-construct", title: "PostConstruct callback invoked", detail: "Initialization logic runs on the raw bean instance.", marker: "@PostConstruct", kind: "success" },
      { id: "proxy", title: "Bean post-processor returns proxy", detail: "AOP or transactional post-processing exposes a wrapped object.", marker: "proxy", kind: "warning" },
      { id: "destroy", title: "Destroy hook registered", detail: "Shutdown metadata is stored so close() can invoke cleanup later.", marker: "destroy", kind: "info" }
    ],
    lanes: [
      { id: "life-definition", label: "Definition", detail: "Definition lookup and scope metadata.", kind: "container", events: [
        { id: "life-definition-1", text: "resolve BeanDefinition", kind: "info" },
        { id: "life-definition-2", text: "scope=singleton", kind: "success" }
      ]},
      { id: "life-instance", label: "Instance", detail: "Construction, population, and init callbacks.", kind: "container", events: [
        { id: "life-instance-1", text: "constructor injection", kind: "success" },
        { id: "life-instance-2", text: "@Value resolution", kind: "success" },
        { id: "life-instance-3", text: "@PostConstruct", kind: "success" }
      ]},
      { id: "life-post", label: "Post-Processors", detail: "Wrapping and shutdown metadata.", kind: "container", events: [
        { id: "life-post-1", text: "AOP proxy created", kind: "warning" },
        { id: "life-post-2", text: "destroy callback stored", kind: "info" }
      ]}
    ],
    snapshot: {
      watch: "The object you inject can differ from the raw instance that went through construction and initialization.",
      why: "That distinction is the gateway to understanding proxies, lifecycle callbacks, and why self-invocation can bypass advice.",
      next: "Compare this with the AOP playground to connect bean post-processing with runtime method interception."
    },
    references: containerReferences
  },
  "comparison:di": {
    id: "trace-comparison-di",
    labId: "comparison",
    title: "Spring Lite vs Spring Comparison",
    mode: "static",
    scenario: "di",
    summary: "Dependency injection comparison trace contrasting explicit spring-lite internals with the richer abstraction layers in Spring Framework.",
    metrics: [
      { label: "Overlap", value: "high", detail: "The conceptual flow is strongly shared." },
      { label: "Lite View", value: "explicit", detail: "The minimal implementation exposes the container algorithm directly." },
      { label: "Spring View", value: "high", detail: "The production framework hides more detail behind extension points." }
    ],
    steps: [
      { id: "di-shared", title: "Both runtimes build object graphs", detail: "Each runtime turns metadata into managed instances with resolved dependencies.", marker: "shared", kind: "success" },
      { id: "di-lite", title: "spring-lite exposes the factory path", detail: "Registration, constructor resolution, and field injection stay close to the reader.", marker: "lite", kind: "info" },
      { id: "di-spring", title: "Spring adds many strategy layers", detail: "The same concepts are generalized through richer contracts and extension points.", marker: "spring", kind: "warning" }
    ],
    lanes: [
      { id: "di-shared-lane", label: "Shared Core", detail: "Common idea: metadata to managed objects.", kind: "compare", events: [
        { id: "di-shared-1", text: "scan/register metadata", kind: "success" },
        { id: "di-shared-2", text: "resolve dependencies", kind: "success" },
        { id: "di-shared-3", text: "create objects", kind: "success" }
      ]},
      { id: "di-lite-lane", label: "spring-lite", detail: "Explicit learning-oriented container algorithm.", kind: "compare", events: [
        { id: "di-lite-1", text: "compact bean factory", kind: "info" },
        { id: "di-lite-2", text: "few extension layers", kind: "info" }
      ]},
      { id: "di-spring-lane", label: "Spring", detail: "Generalized container with broader extension model.", kind: "compare", events: [
        { id: "di-spring-1", text: "many post-processors", kind: "warning" },
        { id: "di-spring-2", text: "broader SPI surface", kind: "warning" }
      ]}
    ],
    snapshot: {
      watch: "The important comparison is not code length but which abstraction boundaries each runtime exposes.",
      why: "Readers should first map the shared concepts before diving into the production framework's larger surface area.",
      next: "Move to MVC comparison after DI so the same 'shared core vs richer generalization' pattern becomes familiar."
    },
    references: comparisonReferences
  },
  "comparison:mvc": {
    id: "trace-comparison-mvc",
    labId: "comparison",
    title: "Spring Lite vs Spring Comparison",
    mode: "static",
    scenario: "mvc",
    summary: "MVC comparison trace showing how both runtimes center on front-controller dispatch while differing in breadth of strategy infrastructure.",
    metrics: [
      { label: "Overlap", value: "high", detail: "DispatcherServlet-style front controller is shared." },
      { label: "Lite View", value: "visible", detail: "Argument resolution and JSON handling remain compact." },
      { label: "Spring View", value: "very-high", detail: "The full stack includes many more handler and conversion strategies." }
    ],
    steps: [
      { id: "mvc-shared", title: "Front controller receives request", detail: "Both runtimes centralize request orchestration in one dispatcher entrypoint.", marker: "dispatcher", kind: "success" },
      { id: "mvc-lite", title: "spring-lite keeps handler flow small", detail: "Mapping, argument resolution, validation, and JSON rendering are easier to trace directly.", marker: "lite", kind: "info" },
      { id: "mvc-spring", title: "Spring multiplies strategy hooks", detail: "Production MVC generalizes mapping, binding, conversion, return handling, and advice integration.", marker: "spring", kind: "warning" }
    ],
    lanes: [
      { id: "mvc-shared-lane", label: "Shared Core", detail: "Front controller orchestration.", kind: "compare", events: [
        { id: "mvc-shared-1", text: "dispatch request", kind: "success" },
        { id: "mvc-shared-2", text: "find handler", kind: "success" },
        { id: "mvc-shared-3", text: "write response", kind: "success" }
      ]},
      { id: "mvc-lite-lane", label: "spring-lite", detail: "Compact adapter and resolver chain.", kind: "compare", events: [
        { id: "mvc-lite-1", text: "minimal argument resolvers", kind: "info" },
        { id: "mvc-lite-2", text: "simple JSON mapper", kind: "info" }
      ]},
      { id: "mvc-spring-lane", label: "Spring", detail: "Broader dispatch ecosystem.", kind: "compare", events: [
        { id: "mvc-spring-1", text: "message converters", kind: "warning" },
        { id: "mvc-spring-2", text: "controller advice", kind: "warning" },
        { id: "mvc-spring-3", text: "broader binding model", kind: "warning" }
      ]}
    ],
    snapshot: {
      watch: "MVC is the easiest place to see how a tiny instructional framework and a production framework can share architecture but diverge in extensibility.",
      why: "The request pipeline feels familiar in both, which lets learners focus on what the extra Spring layers buy them.",
      next: "Finish with transaction comparison, where policy engines and propagation rules make the production framework much broader."
    },
    references: comparisonReferences
  },
  "comparison:tx": {
    id: "trace-comparison-tx",
    labId: "comparison",
    title: "Spring Lite vs Spring Comparison",
    mode: "static",
    scenario: "tx",
    summary: "Transaction comparison trace contrasting spring-lite's explicit REQUIRED/rollback-only model with Spring's much richer transaction abstraction stack.",
    metrics: [
      { label: "Overlap", value: "medium-high", detail: "Both runtimes wrap business calls in transactional boundaries." },
      { label: "Lite View", value: "traceable", detail: "begin/commit/rollback logic is small enough to read in one sitting." },
      { label: "Spring View", value: "very-high", detail: "Production transaction semantics cover more policy dimensions and integrations." }
    ],
    steps: [
      { id: "tx-shared", title: "Business method wrapped by proxy", detail: "Both runtimes use proxy-based declarative transaction entry points.", marker: "@Transactional", kind: "success" },
      { id: "tx-lite", title: "spring-lite shows the core policy engine", detail: "REQUIRED, rollback rules, and rollback-only state remain explicit in a minimal manager.", marker: "lite", kind: "info" },
      { id: "tx-spring", title: "Spring expands semantics and integrations", detail: "The production stack adds richer attributes, synchronization, resource strategies, and data-access integrations.", marker: "spring", kind: "warning" }
    ],
    lanes: [
      { id: "tx-shared-lane", label: "Shared Core", detail: "Proxy-based transactional boundary.", kind: "compare", events: [
        { id: "tx-shared-1", text: "intercept method", kind: "success" },
        { id: "tx-shared-2", text: "begin/exit unit", kind: "success" }
      ]},
      { id: "tx-lite-lane", label: "spring-lite", detail: "Small enough to step through manually.", kind: "compare", events: [
        { id: "tx-lite-1", text: "REQUIRED only", kind: "info" },
        { id: "tx-lite-2", text: "rollback-only visible", kind: "info" },
        { id: "tx-lite-3", text: "single data source focus", kind: "info" }
      ]},
      { id: "tx-spring-lane", label: "Spring", detail: "Larger policy and integration surface.", kind: "compare", events: [
        { id: "tx-spring-1", text: "TransactionAttributeSource", kind: "warning" },
        { id: "tx-spring-2", text: "PlatformTransactionManager", kind: "warning" },
        { id: "tx-spring-3", text: "broader propagation model", kind: "warning" }
      ]}
    ],
    snapshot: {
      watch: "Transaction comparison is where the gap between learning clarity and production breadth becomes most obvious.",
      why: "spring-lite is strongest when it makes rollback-only and proxy boundaries easy to see before the reader confronts Spring's larger policy engine.",
      next: "Turn this comparison into a dual-target live dashboard once both runtimes emit the same normalized trace contract."
    },
    references: comparisonReferences
  }
};
