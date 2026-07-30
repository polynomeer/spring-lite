import type { TraceAdapter } from "../types";

export const comparisonTraceAdapter: TraceAdapter = {
  labId: "comparison",
  adapt(trace) {
    return {
      accent: "concept bridge",
      insight: {
        title: "Comparison Focus",
        bullets: [
          `The "${trace.scenario}" scenario is for mapping shared architectural ideas before comparing implementation breadth.`,
          "Read the shared lane first, then inspect how spring-lite keeps the concept explicit while Spring generalizes it.",
          "These traces are good staging points for later dual-runtime live comparison once both servers emit the same schema."
        ]
      }
    };
  }
};
