import type { LabTrace, TraceEventKind } from "./types";

export type TraceTone = "success" | "info" | "warning" | "error";

export interface TraceStatusSummary {
  tone: TraceTone;
  label: string;
  detail: string;
}

const severityRank: Record<TraceTone, number> = {
  success: 0,
  info: 1,
  warning: 2,
  error: 3
};

function toneFromEventKind(kind: TraceEventKind): TraceTone {
  if (kind === "error") {
    return "error";
  }
  if (kind === "warning") {
    return "warning";
  }
  if (kind === "info") {
    return "info";
  }
  return "success";
}

export function deriveTraceTone(trace: LabTrace): TraceTone {
  return trace.steps.reduce<TraceTone>((current, step) => {
    const candidate = toneFromEventKind(step.kind);
    return severityRank[candidate] > severityRank[current] ? candidate : current;
  }, "success");
}

export function deriveTraceStatusSummary(trace: LabTrace): TraceStatusSummary {
  const tone = deriveTraceTone(trace);
  if (tone === "error") {
    return {
      tone,
      label: "Failure Path",
      detail: "The active trace exits through an error or rollback branch."
    };
  }
  if (tone === "warning") {
    return {
      tone,
      label: "Degraded Path",
      detail: "The trace completes with caution signals such as rollback-only or skipped work."
    };
  }
  if (tone === "info") {
    return {
      tone,
      label: "Observation Path",
      detail: "The trace is primarily explanatory and focuses on flow visibility."
    };
  }
  return {
    tone,
    label: "Healthy Path",
    detail: "The trace follows a successful execution path with no warning or error edges."
  };
}
