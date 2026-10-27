export type RuntimeMode = "static" | "live";

export type LabId = "playground" | "container" | "example-flow" | "comparison";

export type TraceEventKind = "info" | "success" | "warning" | "error";

export type TraceLaneKind = "web" | "service" | "tx" | "jdbc" | "container" | "compare" | "generic";

export interface LabMetric {
  label: string;
  value: string;
  detail: string;
}

export interface LabStep {
  id: string;
  title: string;
  detail: string;
  marker: string;
  kind: TraceEventKind;
}

export interface LabLaneEvent {
  id: string;
  text: string;
  kind: TraceEventKind;
}

export interface LabLane {
  id: string;
  label: string;
  detail: string;
  kind: TraceLaneKind;
  events: LabLaneEvent[];
}

export interface LabSnapshot {
  watch: string;
  why: string;
  next: string;
}

export interface LabTrace {
  id: string;
  labId: LabId;
  title: string;
  mode: RuntimeMode;
  scenario: string;
  summary: string;
  metrics: LabMetric[];
  steps: LabStep[];
  lanes: LabLane[];
  snapshot: LabSnapshot;
  references: string[];
}

export interface LabTraceRequest {
  labId: LabId;
  scenario: string;
  mode: RuntimeMode;
  product?: string;
  quantity?: string;
}

export interface LabTraceProvider {
  readonly kind: RuntimeMode;
  getTrace(request: LabTraceRequest): Promise<LabTrace>;
}

export type TraceEventLayer = "web" | "service" | "tx" | "jdbc" | "container" | "aop";

/** One runtime event recorded by spring-lite's TraceRecorder, as returned by POST /lab/run/events. */
export interface TraceEventView {
  seq: number;
  layer: TraceEventLayer;
  kind: string;
  marker: string;
  detail: string;
  stack: string[];
  attributes: Record<string, string>;
  /** State captured right after the event, e.g. {"orders.current": "2", "orders.other": "1"}. */
  snapshot?: Record<string, string>;
}

export interface LabEventTrace {
  trace: LabTrace;
  events: TraceEventView[];
}

export type SandboxPropagation = "REQUIRED" | "REQUIRES_NEW" | "NONE";

export type SandboxTable = "orders" | "audit_log";

export type SandboxStep =
  | { type: "insert"; target: SandboxTable }
  | { type: "throw" }
  | { type: "call"; catch: boolean; call: SandboxNode };

export interface SandboxNode {
  name: string;
  propagation: SandboxPropagation;
  steps: SandboxStep[];
}

export interface SandboxRunResult {
  runId: string;
  outcome: "completed" | "exception";
  exceptionMessage: string | null;
  events: TraceEventView[];
  rows: Record<string, number>;
}

export interface ContainerBean {
  name: string;
  typeName: string;
  simpleType: string;
  definitionKind: "COMPONENT" | "CONFIGURATION" | "INFRASTRUCTURE" | "FACTORY_METHOD";
  scope: "singleton" | "prototype";
  instantiated: boolean;
  proxied: boolean;
  dependencies: string[];
}

export interface ContainerGraph {
  beans: ContainerBean[];
  refresh: TraceEventView[];
}
