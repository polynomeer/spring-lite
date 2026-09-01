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
