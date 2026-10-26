import type { TraceEventLayer, TraceEventView } from "../../lib/types";

export const layerLabels: Record<TraceEventLayer, string> = {
  web: "웹",
  service: "서비스",
  tx: "트랜잭션",
  jdbc: "JDBC",
  aop: "프록시",
  container: "컨테이너"
};

export type TransactionStatus = "active" | "suspended" | "committed" | "rolled-back";

export interface TransactionState {
  name: string;
  status: TransactionStatus;
  depth: number;
  rollbackOnly: boolean;
}

export const transactionStatusLabels: Record<TransactionStatus, string> = {
  active: "진행 중",
  suspended: "보류",
  committed: "커밋됨",
  "rolled-back": "롤백됨"
};

/** Replays the transaction events up to and including {@code index} and returns each transaction's state. */
export function deriveTransactions(events: TraceEventView[], index: number): TransactionState[] {
  const states = new Map<string, TransactionState>();
  for (const event of events.slice(0, index + 1)) {
    const name = event.attributes.tx;
    if (event.layer !== "tx" || !name) {
      continue;
    }
    const state = states.get(name) ?? { name, status: "active", depth: 0, rollbackOnly: false };
    state.depth = Number(event.attributes.depth ?? state.depth);
    state.rollbackOnly = event.attributes.rollbackOnly === "true";
    switch (event.kind) {
      case "begin":
      case "join":
      case "resume":
      case "leave":
      case "mark-rollback-only":
        state.status = "active";
        break;
      case "suspend":
        state.status = "suspended";
        break;
      case "commit":
        state.status = "committed";
        break;
      case "rollback":
        state.status = "rolled-back";
        break;
      default:
        break;
    }
    states.set(name, state);
  }
  return [...states.values()];
}

/** Describes which connection the latest JDBC event up to {@code index} used. */
export function describeLatestConnection(events: TraceEventView[], index: number): string | null {
  for (let cursor = Math.min(index, events.length - 1); cursor >= 0; cursor--) {
    const event = events[cursor];
    if (event.layer === "jdbc") {
      return event.attributes.tx ? `${event.attributes.tx}의 커넥션` : "트랜잭션 밖 별도 커넥션";
    }
  }
  return null;
}

export function isFailure(event: TraceEventView): boolean {
  return event.kind === "throw"
    || event.kind === "rollback"
    || event.kind === "mark-rollback-only"
    || event.kind === "exception"
    || (event.kind === "response" && Number(event.attributes.status) >= 400);
}
