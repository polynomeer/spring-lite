import type { SandboxNode, SandboxTable, TraceEventView } from "../../lib/types";

export const sandboxTables: SandboxTable[] = ["orders", "audit_log"];

export const propagationLabels: Record<SandboxNode["propagation"], string> = {
  REQUIRED: "REQUIRED",
  REQUIRES_NEW: "REQUIRES_NEW",
  NONE: "트랜잭션 없음"
};

export const MAX_CALL_DEPTH = 3;

export const sandboxPresets: { id: string; label: string; root: SandboxNode }[] = [
  {
    id: "requires-new-failure",
    label: "REQUIRES_NEW 안에서 예외, 바깥에서 catch",
    root: {
      name: "OrderService.placeOrder",
      propagation: "REQUIRED",
      steps: [
        { type: "insert", target: "orders" },
        {
          type: "call",
          catch: true,
          call: {
            name: "AuditService.log",
            propagation: "REQUIRES_NEW",
            steps: [{ type: "insert", target: "audit_log" }, { type: "throw" }]
          }
        }
      ]
    }
  },
  {
    id: "required-swallowed",
    label: "안쪽 REQUIRED 예외를 바깥에서 삼킴",
    root: {
      name: "OrderService.placeOrder",
      propagation: "REQUIRED",
      steps: [
        { type: "insert", target: "orders" },
        {
          type: "call",
          catch: true,
          call: {
            name: "AuditService.log",
            propagation: "REQUIRED",
            steps: [{ type: "insert", target: "audit_log" }, { type: "throw" }]
          }
        }
      ]
    }
  },
  {
    id: "no-transaction",
    label: "트랜잭션 없이 insert 뒤 예외",
    root: {
      name: "BatchJob.run",
      propagation: "NONE",
      steps: [{ type: "insert", target: "orders" }, { type: "throw" }]
    }
  }
];

/** Counts insert steps per table across the whole tree: the upper bound for each table's final rows. */
export function countInserts(node: SandboxNode): Record<SandboxTable, number> {
  const counts: Record<SandboxTable, number> = { orders: 0, audit_log: 0 };
  const visit = (current: SandboxNode) => {
    for (const step of current.steps) {
      if (step.type === "insert") {
        counts[step.target] += 1;
      } else if (step.type === "call") {
        visit(step.call);
      }
    }
  };
  visit(node);
  return counts;
}

export function formatRows(rows: Partial<Record<SandboxTable, number>>): string {
  return sandboxTables
    .filter((table) => rows[table] !== undefined)
    .map((table) => `${table} ${rows[table]}행`)
    .join(" · ");
}

export interface TransactionSummary {
  name: string;
  method: string;
  propagation: string;
  ending: "commit" | "rollback" | null;
  markedRollbackOnly: boolean;
}

/** Summarises each physical transaction: which sandbox method opened it and how it ended. */
export function summarizeTransactions(events: TraceEventView[]): TransactionSummary[] {
  const summaries = new Map<string, TransactionSummary>();
  events.forEach((event, position) => {
    const name = event.attributes.tx;
    if (event.layer !== "tx" || !name) {
      return;
    }
    if (event.kind === "begin") {
      const opener = events.slice(position + 1).find((candidate) => candidate.layer === "service" && candidate.kind === "invoke");
      summaries.set(name, {
        name,
        method: opener?.marker ?? "?",
        propagation: opener?.attributes.propagation ?? "",
        ending: null,
        markedRollbackOnly: false
      });
      return;
    }
    const summary = summaries.get(name);
    if (!summary) {
      return;
    }
    if (event.kind === "mark-rollback-only") {
      summary.markedRollbackOnly = true;
    } else if (event.kind === "commit" || event.kind === "rollback") {
      summary.ending = event.kind;
    }
  });
  return [...summaries.values()];
}

export type TimelineCell = { kind: "event"; label: string; failure: boolean } | { kind: "suspended" } | { kind: "empty" };

const timelineLabels: Record<string, string> = {
  begin: "begin",
  join: "join",
  suspend: "보류",
  resume: "재개",
  commit: "commit",
  rollback: "rollback",
  "mark-rollback-only": "rollback-only",
  leave: "leave"
};

/** Lays transaction events out as rows (one per transaction) and columns (one per tx event). */
export function buildTimeline(events: TraceEventView[]): { columns: TraceEventView[]; rows: { name: string; cells: TimelineCell[] }[] } {
  const columns = events.filter((event) => event.layer === "tx" && event.attributes.tx);
  const names = [...new Set(columns.map((event) => event.attributes.tx))];
  const rows = names.map((name) => {
    let suspended = false;
    let finished = false;
    const cells: TimelineCell[] = columns.map((event) => {
      const own = event.attributes.tx === name;
      if (own) {
        if (event.kind === "suspend") {
          suspended = true;
        } else if (event.kind === "resume") {
          suspended = false;
        }
        if (event.kind === "commit" || event.kind === "rollback") {
          finished = true;
        }
        return {
          kind: "event",
          label: timelineLabels[event.kind] ?? event.kind,
          failure: event.kind === "rollback" || event.kind === "mark-rollback-only"
        };
      }
      if (suspended && !finished) {
        return { kind: "suspended" };
      }
      return { kind: "empty" };
    });
    return { name, cells };
  });
  return { columns, rows };
}

/** The server numbers transactions for its whole lifetime; renumber them per run so each run starts at tx#1. */
export function renumberTransactions(events: TraceEventView[]): TraceEventView[] {
  const names = new Map<string, string>();
  const rename = (text: string) => text.replace(/tx#\d+/g, (name) => {
    if (!names.has(name)) {
      names.set(name, `tx#${names.size + 1}`);
    }
    return names.get(name)!;
  });
  return events.map((event) => ({
    ...event,
    detail: rename(event.detail),
    attributes: Object.fromEntries(Object.entries(event.attributes).map(([key, value]) => [key, rename(value)]))
  }));
}
