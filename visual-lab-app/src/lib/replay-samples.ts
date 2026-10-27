// Generated from POST /lab/run/events against example-app; refresh by re-running the scenarios.
import type { LabEventTrace } from "./types";

export const replaySamples: Record<string, LabEventTrace> = {
  "create": {
    "trace": {
      "id": "static-example-flow-create-3",
      "labId": "example-flow",
      "title": "Example Flow Trace",
      "mode": "static",
      "scenario": "create",
      "summary": "Live trace generated from the example application by executing a real create-order service flow.",
      "metrics": [
        {
          "label": "HTTP Status",
          "value": "200",
          "detail": "The lab trace endpoint completed normally."
        },
        {
          "label": "Tx Outcome",
          "value": "commit",
          "detail": "The transactional service boundary committed the new order."
        },
        {
          "label": "DB Effect",
          "value": "insert",
          "detail": "The repository inserted a new order row."
        },
        {
          "label": "Created Order",
          "value": "#3",
          "detail": "The actual order id created during this run."
        },
        {
          "label": "Created Status",
          "value": "PENDING_APPROVAL",
          "detail": "The created order reflects the service default status value."
        },
        {
          "label": "Requested Product",
          "value": "lab-trace-book",
          "detail": "The product supplied by the Visual Lab request editor."
        },
        {
          "label": "Requested Quantity",
          "value": "2",
          "detail": "The quantity supplied by the Visual Lab request editor."
        },
        {
          "label": "Orders Before",
          "value": "1",
          "detail": "Visible row count before the live create request executes."
        },
        {
          "label": "Orders After",
          "value": "2",
          "detail": "Visible row count after commit includes the newly created order."
        },
        {
          "label": "Net Change",
          "value": "1",
          "detail": "A committed create flow should increase the visible row count by one."
        },
        {
          "label": "Duration (µs)",
          "value": "2558",
          "detail": "Approximate live execution time for this trace scenario."
        }
      ],
      "steps": [
        {
          "id": "dispatch",
          "title": "Trace request enters lab controller",
          "detail": "The frontend live-mode request reaches the example app trace endpoint.",
          "marker": "dispatch",
          "kind": "info"
        },
        {
          "id": "pre-read",
          "title": "Existing orders counted",
          "detail": "The trace records the visible order count before the transactional create call.",
          "marker": "count",
          "kind": "info"
        },
        {
          "id": "service-proxy",
          "title": "Order service proxy invoked",
          "detail": "The trace service calls the real transactional OrderService implementation.",
          "marker": "proxy",
          "kind": "success"
        },
        {
          "id": "tx-begin",
          "title": "Transaction boundary opens",
          "detail": "The create-order flow begins the transactional service boundary.",
          "marker": "begin()",
          "kind": "success"
        },
        {
          "id": "jdbc-insert",
          "title": "Repository inserts order",
          "detail": "JdbcOrderRepository writes the new order row and reads it back.",
          "marker": "insert",
          "kind": "success"
        },
        {
          "id": "jdbc-readback",
          "title": "Inserted order read back",
          "detail": "The repository reloads the latest order row so the trace can expose the actual created id and status.",
          "marker": "select",
          "kind": "success"
        },
        {
          "id": "tx-commit",
          "title": "Transaction commits",
          "detail": "The outer boundary commits the connection after successful service completion.",
          "marker": "commit()",
          "kind": "success"
        },
        {
          "id": "post-verify",
          "title": "Committed row count verified",
          "detail": "After commit, the trace checks that one additional order is now visible.",
          "marker": "verify",
          "kind": "success"
        },
        {
          "id": "trace-response",
          "title": "Lab trace serialized",
          "detail": "The backend returns the normalized LabTrace payload for the frontend.",
          "marker": "json",
          "kind": "success"
        }
      ],
      "lanes": [
        {
          "id": "lane-web",
          "label": "Web",
          "detail": "Trace endpoint entry and JSON response writing.",
          "kind": "web",
          "events": [
            {
              "id": "web-1",
              "text": "POST /lab/run/trace",
              "kind": "info"
            },
            {
              "id": "web-2",
              "text": "VisualLabTraceController",
              "kind": "success"
            },
            {
              "id": "web-3",
              "text": "scenario=create",
              "kind": "info"
            },
            {
              "id": "web-4",
              "text": "200 JSON response",
              "kind": "success"
            }
          ]
        },
        {
          "id": "lane-service",
          "label": "Service",
          "detail": "Real application service invocation.",
          "kind": "service",
          "events": [
            {
              "id": "service-1",
              "text": "createOrder(lab-trace-book, 2)",
              "kind": "success"
            },
            {
              "id": "service-2",
              "text": "status=PENDING_APPROVAL",
              "kind": "info"
            },
            {
              "id": "service-3",
              "text": "created order id=3",
              "kind": "success"
            }
          ]
        },
        {
          "id": "lane-tx",
          "label": "Transaction",
          "detail": "Transactional service boundary lifecycle.",
          "kind": "tx",
          "events": [
            {
              "id": "tx-1",
              "text": "begin depth=1",
              "kind": "success"
            },
            {
              "id": "tx-2",
              "text": "commit",
              "kind": "success"
            },
            {
              "id": "tx-3",
              "text": "duration=2558µs",
              "kind": "info"
            }
          ]
        },
        {
          "id": "lane-jdbc",
          "label": "JDBC",
          "detail": "Repository persistence and row mapping.",
          "kind": "jdbc",
          "events": [
            {
              "id": "jdbc-0",
              "text": "visible rows before=1",
              "kind": "info"
            },
            {
              "id": "jdbc-1",
              "text": "insert into orders ...",
              "kind": "success"
            },
            {
              "id": "jdbc-2",
              "text": "selected row id=3",
              "kind": "success"
            },
            {
              "id": "jdbc-3",
              "text": "visible rows after=2",
              "kind": "success"
            }
          ]
        }
      ],
      "snapshot": {
        "watch": "This trace is generated by executing the real example application service path, not just by replaying static sample data.",
        "why": "It proves that the frontend LabTrace contract can be backed by a live spring-lite runtime and still fit the same UI shape.",
        "next": "The same normalized schema can now describe success, validation, lookup failure, service failure, and rollback branches."
      },
      "references": [
        "example-app/src/main/java/lite/spring/example/order/OrderController.java",
        "example-app/src/main/java/lite/spring/example/order/DefaultOrderService.java",
        "example-app/src/main/java/lite/spring/example/order/JdbcOrderRepository.java",
        "spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionInterceptor.java"
      ]
    },
    "events": [
      {
        "seq": 1,
        "layer": "jdbc",
        "kind": "query",
        "marker": "select",
        "detail": "Ran on its own connection: select id, product, quantity, status from orders order by id",
        "stack": [],
        "attributes": {
          "sql": "select id, product, quantity, status from orders order by id",
          "rows": "1"
        },
        "snapshot": {}
      },
      {
        "seq": 2,
        "layer": "aop",
        "kind": "proxy-enter",
        "marker": "proxy",
        "detail": "Transactional proxy intercepted DefaultOrderService.createOrder.",
        "stack": [
          "DefaultOrderService.createOrder"
        ],
        "attributes": {
          "propagation": "REQUIRED",
          "readOnly": "false"
        },
        "snapshot": {}
      },
      {
        "seq": 3,
        "layer": "tx",
        "kind": "begin",
        "marker": "begin()",
        "detail": "Started tx#1 on a new connection with auto-commit disabled.",
        "stack": [
          "DefaultOrderService.createOrder"
        ],
        "attributes": {
          "tx": "tx#1",
          "depth": "1",
          "active": "1",
          "readOnly": "false",
          "rollbackOnly": "false"
        },
        "snapshot": {}
      },
      {
        "seq": 4,
        "layer": "jdbc",
        "kind": "update",
        "marker": "insert",
        "detail": "Ran inside tx#1: insert into orders(product, quantity, status) values (?, ?, ?)",
        "stack": [
          "DefaultOrderService.createOrder"
        ],
        "attributes": {
          "sql": "insert into orders(product, quantity, status) values (?, ?, ?)",
          "rows": "1",
          "tx": "tx#1"
        },
        "snapshot": {
          "orders.current": "2",
          "orders.other": "1"
        }
      },
      {
        "seq": 5,
        "layer": "jdbc",
        "kind": "query",
        "marker": "select",
        "detail": "Ran inside tx#1: select id, product, quantity, status from orders order by id desc limit 1",
        "stack": [
          "DefaultOrderService.createOrder"
        ],
        "attributes": {
          "sql": "select id, product, quantity, status from orders order by id desc limit 1",
          "rows": "1",
          "tx": "tx#1"
        },
        "snapshot": {}
      },
      {
        "seq": 6,
        "layer": "service",
        "kind": "return",
        "marker": "return",
        "detail": "DefaultOrderService.createOrder returned normally.",
        "stack": [
          "DefaultOrderService.createOrder"
        ],
        "attributes": {},
        "snapshot": {}
      },
      {
        "seq": 7,
        "layer": "tx",
        "kind": "commit",
        "marker": "commit()",
        "detail": "Committed tx#1.",
        "stack": [
          "DefaultOrderService.createOrder"
        ],
        "attributes": {
          "tx": "tx#1",
          "depth": "0",
          "active": "1",
          "readOnly": "false",
          "rollbackOnly": "false"
        },
        "snapshot": {
          "orders.current": "2",
          "orders.other": "2"
        }
      },
      {
        "seq": 8,
        "layer": "jdbc",
        "kind": "query",
        "marker": "select",
        "detail": "Ran on its own connection: select id, product, quantity, status from orders order by id",
        "stack": [],
        "attributes": {
          "sql": "select id, product, quantity, status from orders order by id",
          "rows": "2"
        },
        "snapshot": {}
      }
    ]
  },
  "rollback": {
    "trace": {
      "id": "static-example-flow-rollback",
      "labId": "example-flow",
      "title": "Example Flow Trace",
      "mode": "static",
      "scenario": "rollback",
      "summary": "Live trace generated by executing a real transactional insert followed by a deliberate service failure.",
      "metrics": [
        {
          "label": "HTTP Status",
          "value": "500",
          "detail": "An uncaught service failure would map to a server error."
        },
        {
          "label": "Tx Outcome",
          "value": "rollback",
          "detail": "The transaction is rolled back after the service throws."
        },
        {
          "label": "DB Effect",
          "value": "insert rolled back",
          "detail": "The repository performs an insert, but the row is not committed."
        },
        {
          "label": "Orders Before",
          "value": "1",
          "detail": "Visible row count before the failing transaction starts."
        },
        {
          "label": "Orders After",
          "value": "1",
          "detail": "Visible row count after rollback proves no net new row remained."
        },
        {
          "label": "Net Change",
          "value": "0",
          "detail": "A rollback branch should leave the visible row count unchanged."
        },
        {
          "label": "Exception Message",
          "value": "Lab rollback after order 2",
          "detail": "The thrown message includes the transient order id that never becomes durable."
        },
        {
          "label": "Duration (µs)",
          "value": "5371",
          "detail": "Approximate live execution time for the rollback scenario."
        }
      ],
      "steps": [
        {
          "id": "dispatch",
          "title": "Trace request enters backend",
          "detail": "The live lab endpoint starts the rollback branch.",
          "marker": "dispatch",
          "kind": "info"
        },
        {
          "id": "pre-read",
          "title": "Existing orders counted",
          "detail": "The trace captures the visible row count before the failing transaction begins.",
          "marker": "count",
          "kind": "info"
        },
        {
          "id": "service-proxy",
          "title": "Transactional service proxy invoked",
          "detail": "The trace service calls a real proxied service method.",
          "marker": "proxy",
          "kind": "success"
        },
        {
          "id": "tx-begin",
          "title": "Transaction boundary opens",
          "detail": "The interceptor binds a transaction-aware connection.",
          "marker": "begin()",
          "kind": "success"
        },
        {
          "id": "jdbc-insert",
          "title": "Repository inserts order",
          "detail": "JdbcOrderRepository writes a row inside the open transaction.",
          "marker": "insert",
          "kind": "success"
        },
        {
          "id": "service-throw",
          "title": "Service fails after insert",
          "detail": "The method throws after persistence to force rollback.",
          "marker": "throw",
          "kind": "error"
        },
        {
          "id": "tx-rollback",
          "title": "Transaction rolls back",
          "detail": "The interceptor rolls back the connection and discards the inserted row.",
          "marker": "rollback()",
          "kind": "error"
        },
        {
          "id": "post-verify",
          "title": "Rollback effect verified",
          "detail": "After rollback, the trace checks that the visible row count returned to its original value.",
          "marker": "verify",
          "kind": "success"
        },
        {
          "id": "trace-response",
          "title": "Lab trace serialized",
          "detail": "The backend returns a normalized rollback trace for the UI.",
          "marker": "json",
          "kind": "success"
        }
      ],
      "lanes": [
        {
          "id": "lane-web",
          "label": "Web",
          "detail": "Trace endpoint dispatch and response writing.",
          "kind": "web",
          "events": [
            {
              "id": "web-1",
              "text": "POST /lab/run/trace",
              "kind": "info"
            },
            {
              "id": "web-2",
              "text": "trace controller",
              "kind": "success"
            },
            {
              "id": "web-3",
              "text": "scenario=rollback",
              "kind": "info"
            },
            {
              "id": "web-4",
              "text": "rollback trace JSON",
              "kind": "success"
            }
          ]
        },
        {
          "id": "lane-service",
          "label": "Service",
          "detail": "Transactional create-and-fail service method.",
          "kind": "service",
          "events": [
            {
              "id": "service-1",
              "text": "createOrderAndFail(...)",
              "kind": "success"
            },
            {
              "id": "service-2",
              "text": "Lab rollback after order 2",
              "kind": "error"
            }
          ]
        },
        {
          "id": "lane-tx",
          "label": "Transaction",
          "detail": "Full begin -> rollback lifecycle.",
          "kind": "tx",
          "events": [
            {
              "id": "tx-1",
              "text": "begin depth=1",
              "kind": "success"
            },
            {
              "id": "tx-2",
              "text": "rollback",
              "kind": "error"
            },
            {
              "id": "tx-3",
              "text": "duration=5371µs",
              "kind": "info"
            }
          ]
        },
        {
          "id": "lane-jdbc",
          "label": "JDBC",
          "detail": "Insert executes but is later discarded by rollback.",
          "kind": "jdbc",
          "events": [
            {
              "id": "jdbc-0",
              "text": "visible rows before=1",
              "kind": "info"
            },
            {
              "id": "jdbc-1",
              "text": "insert into orders ...",
              "kind": "success"
            },
            {
              "id": "jdbc-2",
              "text": "row not committed",
              "kind": "error"
            },
            {
              "id": "jdbc-3",
              "text": "visible rows after=1",
              "kind": "success"
            }
          ]
        }
      ],
      "snapshot": {
        "watch": "This is the most important dynamic branch for transaction study because it performs real JDBC work and still leaves the database unchanged.",
        "why": "The before/after order counts make the rollback outcome visible without requiring direct database inspection in the UI.",
        "next": "When compared with create, the only behavioral difference is the exception after the repository call, yet the outcome flips from commit to rollback."
      },
      "references": [
        "example-app/src/main/java/lite/spring/example/order/DefaultOrderService.java",
        "example-app/src/main/java/lite/spring/example/order/JdbcOrderRepository.java",
        "spring-lite-tx/src/main/java/lite/spring/tx/support/TransactionalBeanPostProcessor.java"
      ]
    },
    "events": [
      {
        "seq": 1,
        "layer": "jdbc",
        "kind": "query",
        "marker": "select",
        "detail": "Ran on its own connection: select id, product, quantity, status from orders order by id",
        "stack": [],
        "attributes": {
          "sql": "select id, product, quantity, status from orders order by id",
          "rows": "1"
        },
        "snapshot": {}
      },
      {
        "seq": 2,
        "layer": "aop",
        "kind": "proxy-enter",
        "marker": "proxy",
        "detail": "Transactional proxy intercepted DefaultOrderService.createOrderAndFail.",
        "stack": [
          "DefaultOrderService.createOrderAndFail"
        ],
        "attributes": {
          "propagation": "REQUIRED",
          "readOnly": "false"
        },
        "snapshot": {}
      },
      {
        "seq": 3,
        "layer": "tx",
        "kind": "begin",
        "marker": "begin()",
        "detail": "Started tx#1 on a new connection with auto-commit disabled.",
        "stack": [
          "DefaultOrderService.createOrderAndFail"
        ],
        "attributes": {
          "tx": "tx#1",
          "depth": "1",
          "active": "1",
          "readOnly": "false",
          "rollbackOnly": "false"
        },
        "snapshot": {}
      },
      {
        "seq": 4,
        "layer": "jdbc",
        "kind": "update",
        "marker": "insert",
        "detail": "Ran inside tx#1: insert into orders(product, quantity, status) values (?, ?, ?)",
        "stack": [
          "DefaultOrderService.createOrderAndFail"
        ],
        "attributes": {
          "sql": "insert into orders(product, quantity, status) values (?, ?, ?)",
          "rows": "1",
          "tx": "tx#1"
        },
        "snapshot": {
          "orders.current": "2",
          "orders.other": "1"
        }
      },
      {
        "seq": 5,
        "layer": "jdbc",
        "kind": "query",
        "marker": "select",
        "detail": "Ran inside tx#1: select id, product, quantity, status from orders order by id desc limit 1",
        "stack": [
          "DefaultOrderService.createOrderAndFail"
        ],
        "attributes": {
          "sql": "select id, product, quantity, status from orders order by id desc limit 1",
          "rows": "1",
          "tx": "tx#1"
        },
        "snapshot": {}
      },
      {
        "seq": 6,
        "layer": "service",
        "kind": "throw",
        "marker": "throw",
        "detail": "DefaultOrderService.createOrderAndFail threw IllegalStateException.",
        "stack": [
          "DefaultOrderService.createOrderAndFail"
        ],
        "attributes": {
          "exception": "java.lang.IllegalStateException",
          "rollback": "true"
        },
        "snapshot": {}
      },
      {
        "seq": 7,
        "layer": "tx",
        "kind": "rollback",
        "marker": "rollback()",
        "detail": "Rolled back tx#1.",
        "stack": [
          "DefaultOrderService.createOrderAndFail"
        ],
        "attributes": {
          "tx": "tx#1",
          "depth": "0",
          "active": "1",
          "readOnly": "false",
          "rollbackOnly": "true"
        },
        "snapshot": {
          "orders.current": "1",
          "orders.other": "1"
        }
      },
      {
        "seq": 8,
        "layer": "jdbc",
        "kind": "query",
        "marker": "select",
        "detail": "Ran on its own connection: select id, product, quantity, status from orders order by id",
        "stack": [],
        "attributes": {
          "sql": "select id, product, quantity, status from orders order by id",
          "rows": "1"
        },
        "snapshot": {}
      }
    ]
  },
  "validation": {
    "trace": {
      "id": "static-example-flow-validation",
      "labId": "example-flow",
      "title": "Example Flow Trace",
      "mode": "static",
      "scenario": "validation",
      "summary": "Normalized live trace for the controller validation branch that rejects an invalid create-order request before the service layer runs.",
      "metrics": [
        {
          "label": "HTTP Status",
          "value": "400",
          "detail": "The request is rejected as a validation failure."
        },
        {
          "label": "Tx Outcome",
          "value": "not-started",
          "detail": "The transactional service boundary is never entered."
        },
        {
          "label": "DB Effect",
          "value": "none",
          "detail": "No insert occurs because validation fails first."
        },
        {
          "label": "Rejected Field",
          "value": "request.product",
          "detail": "The product field must have length at least 2."
        },
        {
          "label": "Rejected Quantity",
          "value": "0",
          "detail": "Quantity must be at least 1."
        }
      ],
      "steps": [
        {
          "id": "dispatch",
          "title": "Request enters order controller",
          "detail": "The invalid JSON body is routed to the create-order handler.",
          "marker": "dispatch",
          "kind": "info"
        },
        {
          "id": "json-bind",
          "title": "Body bound to request record",
          "detail": "JSON mapping succeeds before bean validation runs.",
          "marker": "bind",
          "kind": "success"
        },
        {
          "id": "validate",
          "title": "Bean validation rejects payload",
          "detail": "Constraint checks fail for product length and quantity minimum.",
          "marker": "validate",
          "kind": "error"
        },
        {
          "id": "resolve-error",
          "title": "Exception resolver prepares 400",
          "detail": "ValidationException is converted into a structured client error response.",
          "marker": "400",
          "kind": "error"
        },
        {
          "id": "trace-response",
          "title": "Lab trace serialized",
          "detail": "The lab endpoint returns the normalized validation branch payload.",
          "marker": "json",
          "kind": "success"
        }
      ],
      "lanes": [
        {
          "id": "lane-web",
          "label": "Web",
          "detail": "HTTP dispatch, JSON binding, and validation error response writing.",
          "kind": "web",
          "events": [
            {
              "id": "web-1",
              "text": "POST /orders",
              "kind": "info"
            },
            {
              "id": "web-2",
              "text": "@Valid CreateOrderRequest",
              "kind": "error"
            },
            {
              "id": "web-3",
              "text": "400 JSON response",
              "kind": "error"
            }
          ]
        },
        {
          "id": "lane-service",
          "label": "Service",
          "detail": "Service layer remains untouched because validation stops the request earlier.",
          "kind": "service",
          "events": [
            {
              "id": "service-1",
              "text": "OrderService skipped",
              "kind": "info"
            }
          ]
        },
        {
          "id": "lane-tx",
          "label": "Transaction",
          "detail": "No transaction is opened for a rejected request.",
          "kind": "tx",
          "events": [
            {
              "id": "tx-1",
              "text": "not started",
              "kind": "info"
            }
          ]
        },
        {
          "id": "lane-jdbc",
          "label": "JDBC",
          "detail": "No JDBC call occurs for the rejected request.",
          "kind": "jdbc",
          "events": [
            {
              "id": "jdbc-1",
              "text": "no SQL executed",
              "kind": "info"
            }
          ]
        }
      ],
      "snapshot": {
        "watch": "Validation happens before business logic, which is why this branch never reaches the service proxy or transaction interceptor.",
        "why": "This is useful in the UI because it shows that not every error branch is a rollback branch.",
        "next": "Compare this with rollback and service-error to see where the failure occurs relative to the transactional boundary."
      },
      "references": [
        "example-app/src/main/java/lite/spring/example/order/OrderController.java",
        "spring-lite-core/src/main/java/lite/spring/core/validation/ValidationException.java",
        "spring-lite-web/src/main/java/lite/spring/web/exception/DefaultExceptionResolver.java"
      ]
    },
    "events": []
  }
};
