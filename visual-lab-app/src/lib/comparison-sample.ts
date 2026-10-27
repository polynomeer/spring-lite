// Generated from GET /lab/compare/events/{scenario} against comparison-spring-lite-app and comparison-spring-boot-app.
import type { ComparisonEventTrace } from "./types";

export const comparisonSamples: Record<string, { lite: ComparisonEventTrace; boot: ComparisonEventTrace }> = {
  "tx-rollback": {
    "lite": {
      "runtime": "spring-lite",
      "scenario": "tx-rollback",
      "outcome": "threw IllegalStateException",
      "ordersBefore": 2,
      "ordersAfter": 2,
      "events": [
        {
          "seq": 1,
          "step": "call.enter",
          "layer": "aop",
          "detail": "Transactional proxy intercepted OrderService.createOrder.",
          "attributes": {
            "propagation": "REQUIRED",
            "readOnly": "false"
          }
        },
        {
          "seq": 2,
          "step": "tx.begin",
          "layer": "tx",
          "detail": "Started tx#2 on a new connection with auto-commit disabled.",
          "attributes": {
            "tx": "tx#2",
            "depth": "1",
            "active": "1",
            "readOnly": "false",
            "rollbackOnly": "false"
          }
        },
        {
          "seq": 3,
          "step": "jdbc.insert",
          "layer": "jdbc",
          "detail": "Ran inside tx#2: insert into orders(product, quantity, status) values (?, ?, ?)",
          "attributes": {
            "sql": "insert into orders(product, quantity, status) values (?, ?, ?)",
            "rows": "1",
            "tx": "tx#2"
          }
        },
        {
          "seq": 4,
          "step": "jdbc.select",
          "layer": "jdbc",
          "detail": "Ran inside tx#2: select id, product, quantity, status from orders order by id desc limit 1",
          "attributes": {
            "sql": "select id, product, quantity, status from orders order by id desc limit 1",
            "rows": "1",
            "tx": "tx#2"
          }
        },
        {
          "seq": 5,
          "step": "call.throw",
          "layer": "service",
          "detail": "OrderService.createOrder threw IllegalStateException.",
          "attributes": {
            "exception": "java.lang.IllegalStateException",
            "rollback": "true"
          }
        },
        {
          "seq": 6,
          "step": "tx.rollback",
          "layer": "tx",
          "detail": "Rolled back tx#2.",
          "attributes": {
            "tx": "tx#2",
            "depth": "0",
            "active": "1",
            "readOnly": "false",
            "rollbackOnly": "true"
          }
        }
      ]
    },
    "boot": {
      "runtime": "spring",
      "scenario": "tx-rollback",
      "outcome": "threw IllegalStateException",
      "ordersBefore": 2,
      "ordersAfter": 2,
      "events": [
        {
          "seq": 1,
          "step": "call.enter",
          "layer": "aop",
          "detail": "Proxy intercepted OrderService.createOrder.",
          "attributes": {}
        },
        {
          "seq": 2,
          "step": "tx.begin",
          "layer": "tx",
          "detail": "DataSourceTransactionManager.doBegin bound a new connection to the thread.",
          "attributes": {
            "propagation": "REQUIRED"
          }
        },
        {
          "seq": 3,
          "step": "tx.sync.register",
          "layer": "tx",
          "detail": "Synchronization activated; a TransactionSynchronization was registered.",
          "attributes": {}
        },
        {
          "seq": 4,
          "step": "jdbc.insert",
          "layer": "jdbc",
          "detail": "Executed on the transaction-bound connection: insert into orders(product, quantity, status) values (?, ?, ?)",
          "attributes": {
            "sql": "insert into orders(product, quantity, status) values (?, ?, ?)",
            "rows": "1"
          }
        },
        {
          "seq": 5,
          "step": "jdbc.select",
          "layer": "jdbc",
          "detail": "Executed on the transaction-bound connection: select id, product, quantity, status from orders order by id desc fetch first 1 rows only",
          "attributes": {
            "sql": "select id, product, quantity, status from orders order by id desc fetch first 1 rows only"
          }
        },
        {
          "seq": 6,
          "step": "call.throw",
          "layer": "service",
          "detail": "OrderService.createOrder threw IllegalStateException.",
          "attributes": {
            "exception": "java.lang.IllegalStateException"
          }
        },
        {
          "seq": 7,
          "step": "tx.sync.before-completion",
          "layer": "tx",
          "detail": "TransactionSynchronization.beforeCompletion callback.",
          "attributes": {}
        },
        {
          "seq": 8,
          "step": "tx.rollback",
          "layer": "tx",
          "detail": "Connection.rollback() completed.",
          "attributes": {}
        },
        {
          "seq": 9,
          "step": "tx.sync.after-completion",
          "layer": "tx",
          "detail": "TransactionSynchronization.afterCompletion callback.",
          "attributes": {
            "status": "rolled back"
          }
        },
        {
          "seq": 10,
          "step": "tx.cleanup",
          "layer": "tx",
          "detail": "Connection unbound from the thread and returned to the pool.",
          "attributes": {}
        }
      ]
    }
  },
  "tx-commit": {
    "lite": {
      "runtime": "spring-lite",
      "scenario": "tx-commit",
      "outcome": "returned",
      "ordersBefore": 2,
      "ordersAfter": 3,
      "events": [
        {
          "seq": 1,
          "step": "call.enter",
          "layer": "aop",
          "detail": "Transactional proxy intercepted OrderService.createOrder.",
          "attributes": {
            "propagation": "REQUIRED",
            "readOnly": "false"
          }
        },
        {
          "seq": 2,
          "step": "tx.begin",
          "layer": "tx",
          "detail": "Started tx#3 on a new connection with auto-commit disabled.",
          "attributes": {
            "tx": "tx#3",
            "depth": "1",
            "active": "1",
            "readOnly": "false",
            "rollbackOnly": "false"
          }
        },
        {
          "seq": 3,
          "step": "jdbc.insert",
          "layer": "jdbc",
          "detail": "Ran inside tx#3: insert into orders(product, quantity, status) values (?, ?, ?)",
          "attributes": {
            "sql": "insert into orders(product, quantity, status) values (?, ?, ?)",
            "rows": "1",
            "tx": "tx#3"
          }
        },
        {
          "seq": 4,
          "step": "jdbc.select",
          "layer": "jdbc",
          "detail": "Ran inside tx#3: select id, product, quantity, status from orders order by id desc limit 1",
          "attributes": {
            "sql": "select id, product, quantity, status from orders order by id desc limit 1",
            "rows": "1",
            "tx": "tx#3"
          }
        },
        {
          "seq": 5,
          "step": "call.return",
          "layer": "service",
          "detail": "OrderService.createOrder returned normally.",
          "attributes": {}
        },
        {
          "seq": 6,
          "step": "tx.commit",
          "layer": "tx",
          "detail": "Committed tx#3.",
          "attributes": {
            "tx": "tx#3",
            "depth": "0",
            "active": "1",
            "readOnly": "false",
            "rollbackOnly": "false"
          }
        }
      ]
    },
    "boot": {
      "runtime": "spring",
      "scenario": "tx-commit",
      "outcome": "returned",
      "ordersBefore": 2,
      "ordersAfter": 3,
      "events": [
        {
          "seq": 1,
          "step": "call.enter",
          "layer": "aop",
          "detail": "Proxy intercepted OrderService.createOrder.",
          "attributes": {}
        },
        {
          "seq": 2,
          "step": "tx.begin",
          "layer": "tx",
          "detail": "DataSourceTransactionManager.doBegin bound a new connection to the thread.",
          "attributes": {
            "propagation": "REQUIRED"
          }
        },
        {
          "seq": 3,
          "step": "tx.sync.register",
          "layer": "tx",
          "detail": "Synchronization activated; a TransactionSynchronization was registered.",
          "attributes": {}
        },
        {
          "seq": 4,
          "step": "jdbc.insert",
          "layer": "jdbc",
          "detail": "Executed on the transaction-bound connection: insert into orders(product, quantity, status) values (?, ?, ?)",
          "attributes": {
            "sql": "insert into orders(product, quantity, status) values (?, ?, ?)",
            "rows": "1"
          }
        },
        {
          "seq": 5,
          "step": "jdbc.select",
          "layer": "jdbc",
          "detail": "Executed on the transaction-bound connection: select id, product, quantity, status from orders order by id desc fetch first 1 rows only",
          "attributes": {
            "sql": "select id, product, quantity, status from orders order by id desc fetch first 1 rows only"
          }
        },
        {
          "seq": 6,
          "step": "call.return",
          "layer": "service",
          "detail": "OrderService.createOrder returned normally.",
          "attributes": {}
        },
        {
          "seq": 7,
          "step": "tx.sync.before-commit",
          "layer": "tx",
          "detail": "TransactionSynchronization.beforeCommit callback.",
          "attributes": {}
        },
        {
          "seq": 8,
          "step": "tx.sync.before-completion",
          "layer": "tx",
          "detail": "TransactionSynchronization.beforeCompletion callback.",
          "attributes": {}
        },
        {
          "seq": 9,
          "step": "tx.commit",
          "layer": "tx",
          "detail": "Connection.commit() completed.",
          "attributes": {}
        },
        {
          "seq": 10,
          "step": "tx.sync.after-commit",
          "layer": "tx",
          "detail": "TransactionSynchronization.afterCommit callback.",
          "attributes": {}
        },
        {
          "seq": 11,
          "step": "tx.sync.after-completion",
          "layer": "tx",
          "detail": "TransactionSynchronization.afterCompletion callback.",
          "attributes": {
            "status": "committed"
          }
        },
        {
          "seq": 12,
          "step": "tx.cleanup",
          "layer": "tx",
          "detail": "Connection unbound from the thread and returned to the pool.",
          "attributes": {}
        }
      ]
    }
  }
};
