import { comparisonTraceAdapter } from "./comparison/trace-adapter";
import { containerTraceAdapter } from "./container/trace-adapter";
import { exampleFlowTraceAdapter } from "./example-flow/trace-adapter";
import { playgroundTraceAdapter } from "./playground/trace-adapter";
import type { TraceAdapter, TraceAdapterResult } from "./types";
import type { LabTrace } from "../lib/types";

const adapters: TraceAdapter[] = [
  exampleFlowTraceAdapter,
  playgroundTraceAdapter,
  containerTraceAdapter,
  comparisonTraceAdapter
];

const fallbackAdapter: TraceAdapter = {
  labId: "comparison",
  adapt(trace: LabTrace): TraceAdapterResult {
    return {
      accent: "generic trace",
      insight: {
        title: "Shared Trace Contract",
        bullets: [
          `This ${trace.labId} trace already fits the common LabTrace schema.`,
          "A dedicated feature adapter can refine copy, secondary panels, and comparison hints later.",
          `Scenario: ${trace.scenario}`
        ]
      }
    };
  }
};

export function adaptTrace(trace: LabTrace): TraceAdapterResult {
  const adapter = adapters.find((candidate) => candidate.labId === trace.labId);
  return (adapter ?? fallbackAdapter).adapt(trace);
}
