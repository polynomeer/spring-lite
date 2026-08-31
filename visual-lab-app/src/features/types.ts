import type { Locale } from "../lib/i18n";
import type { LabId, LabTrace } from "../lib/types";

export interface TraceInsight {
  title: string;
  bullets: string[];
}

export interface TraceDiagramBranchOption {
  id: string;
  label: string;
  detail: string;
  tone: "success" | "info" | "warning" | "error";
  status: "taken" | "idle";
}

export interface TraceDiagramNode {
  id: string;
  label: string;
  detail: string;
  lane: string;
  tone: "success" | "info" | "warning" | "error";
  status: "active" | "inactive";
}

export interface TraceExecutionPathDiagram {
  title: string;
  subtitle: string;
  nodes: TraceDiagramNode[];
  branches: TraceDiagramBranchOption[];
}

export interface TraceStateTransitionDiagram {
  title: string;
  subtitle: string;
  states: TraceDiagramNode[];
  sideEffects: TraceDiagramBranchOption[];
}

export interface TraceAdapterResult {
  accent: string;
  insight: TraceInsight;
  executionPath?: TraceExecutionPathDiagram;
  stateTransition?: TraceStateTransitionDiagram;
}

export interface TraceAdapter {
  readonly labId: LabId;
  adapt(trace: LabTrace, locale: Locale): TraceAdapterResult;
}
