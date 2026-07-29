import type { LabId, LabTrace } from "../lib/types";

export interface TraceInsight {
  title: string;
  bullets: string[];
}

export interface TraceAdapterResult {
  accent: string;
  insight: TraceInsight;
}

export interface TraceAdapter {
  readonly labId: LabId;
  adapt(trace: LabTrace): TraceAdapterResult;
}
