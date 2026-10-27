// Generated from the committed implementation via POST /lab/sandbox/run and /lab/pitfalls/circular-dependency/broken.
// These are the reference paths a learner's build is compared against.
import type { WorkspaceEvent } from "./types";

export const workspaceReference: Record<string, WorkspaceEvent[]> = {
  "requires-new": [
    {
      "seq": 1,
      "layer": "aop",
      "kind": "proxy-enter",
      "marker": "proxy",
      "detail": "Transactional proxy intercepted SandboxTransactions.required."
    },
    {
      "seq": 2,
      "layer": "tx",
      "kind": "begin",
      "marker": "begin()",
      "detail": "Started tx#5 on a new connection with auto-commit disabled."
    },
    {
      "seq": 3,
      "layer": "service",
      "kind": "invoke",
      "marker": "OrderService.placeOrder",
      "detail": "Entered OrderService.placeOrder (REQUIRED)."
    },
    {
      "seq": 4,
      "layer": "jdbc",
      "kind": "update",
      "marker": "insert",
      "detail": "Ran inside tx#5: insert into lab_sandbox_row(run_id, target_table, label) values (?, ?, ?)"
    },
    {
      "seq": 5,
      "layer": "aop",
      "kind": "proxy-enter",
      "marker": "proxy",
      "detail": "Transactional proxy intercepted SandboxTransactions.requiresNew."
    },
    {
      "seq": 6,
      "layer": "tx",
      "kind": "suspend",
      "marker": "suspend",
      "detail": "Suspended tx#5 to start an independent transaction."
    },
    {
      "seq": 7,
      "layer": "tx",
      "kind": "begin",
      "marker": "begin()",
      "detail": "Started tx#6 on a new connection with auto-commit disabled."
    },
    {
      "seq": 8,
      "layer": "service",
      "kind": "invoke",
      "marker": "AuditService.log",
      "detail": "Entered AuditService.log (REQUIRES_NEW)."
    },
    {
      "seq": 9,
      "layer": "jdbc",
      "kind": "update",
      "marker": "insert",
      "detail": "Ran inside tx#6: insert into lab_sandbox_row(run_id, target_table, label) values (?, ?, ?)"
    },
    {
      "seq": 10,
      "layer": "service",
      "kind": "raise",
      "marker": "throw",
      "detail": "AuditService.log throws SandboxFailure."
    },
    {
      "seq": 11,
      "layer": "service",
      "kind": "throw",
      "marker": "throw",
      "detail": "SandboxTransactions.requiresNew threw SandboxFailure."
    },
    {
      "seq": 12,
      "layer": "tx",
      "kind": "rollback",
      "marker": "rollback()",
      "detail": "Rolled back tx#6."
    },
    {
      "seq": 13,
      "layer": "tx",
      "kind": "resume",
      "marker": "resume",
      "detail": "Resumed the suspended transaction tx#5."
    },
    {
      "seq": 14,
      "layer": "service",
      "kind": "catch",
      "marker": "catch",
      "detail": "OrderService.placeOrder caught the failure from AuditService.log and continued."
    },
    {
      "seq": 15,
      "layer": "service",
      "kind": "return",
      "marker": "return",
      "detail": "SandboxTransactions.required returned normally."
    },
    {
      "seq": 16,
      "layer": "tx",
      "kind": "commit",
      "marker": "commit()",
      "detail": "Committed tx#5."
    }
  ],
  "rollback-only": [
    {
      "seq": 1,
      "layer": "aop",
      "kind": "proxy-enter",
      "marker": "proxy",
      "detail": "Transactional proxy intercepted SandboxTransactions.required."
    },
    {
      "seq": 2,
      "layer": "tx",
      "kind": "begin",
      "marker": "begin()",
      "detail": "Started tx#7 on a new connection with auto-commit disabled."
    },
    {
      "seq": 3,
      "layer": "service",
      "kind": "invoke",
      "marker": "OrderService.placeOrder",
      "detail": "Entered OrderService.placeOrder (REQUIRED)."
    },
    {
      "seq": 4,
      "layer": "jdbc",
      "kind": "update",
      "marker": "insert",
      "detail": "Ran inside tx#7: insert into lab_sandbox_row(run_id, target_table, label) values (?, ?, ?)"
    },
    {
      "seq": 5,
      "layer": "aop",
      "kind": "proxy-enter",
      "marker": "proxy",
      "detail": "Transactional proxy intercepted SandboxTransactions.required."
    },
    {
      "seq": 6,
      "layer": "tx",
      "kind": "join",
      "marker": "join",
      "detail": "Joined the active transaction tx#7."
    },
    {
      "seq": 7,
      "layer": "service",
      "kind": "invoke",
      "marker": "AuditService.log",
      "detail": "Entered AuditService.log (REQUIRED)."
    },
    {
      "seq": 8,
      "layer": "jdbc",
      "kind": "update",
      "marker": "insert",
      "detail": "Ran inside tx#7: insert into lab_sandbox_row(run_id, target_table, label) values (?, ?, ?)"
    },
    {
      "seq": 9,
      "layer": "service",
      "kind": "raise",
      "marker": "throw",
      "detail": "AuditService.log throws SandboxFailure."
    },
    {
      "seq": 10,
      "layer": "service",
      "kind": "throw",
      "marker": "throw",
      "detail": "SandboxTransactions.required threw SandboxFailure."
    },
    {
      "seq": 11,
      "layer": "tx",
      "kind": "mark-rollback-only",
      "marker": "rollbackOnly",
      "detail": "Marked tx#7 rollback-only; the outer boundary will roll back."
    },
    {
      "seq": 12,
      "layer": "service",
      "kind": "catch",
      "marker": "catch",
      "detail": "OrderService.placeOrder caught the failure from AuditService.log and continued."
    },
    {
      "seq": 13,
      "layer": "service",
      "kind": "return",
      "marker": "return",
      "detail": "SandboxTransactions.required returned normally."
    },
    {
      "seq": 14,
      "layer": "tx",
      "kind": "rollback",
      "marker": "rollback()",
      "detail": "Rolled back tx#7 because a participant marked it rollback-only."
    }
  ],
  "cycle-detection": [
    {
      "seq": 1,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating orderFacade."
    },
    {
      "seq": 2,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating paymentFacade."
    },
    {
      "seq": 3,
      "layer": "container",
      "kind": "cycle",
      "marker": "cycle",
      "detail": "Circular dependency detected: orderFacade -> paymentFacade -> orderFacade"
    }
  ]
};
