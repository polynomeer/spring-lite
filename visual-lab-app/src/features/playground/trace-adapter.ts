import type { TraceAdapter } from "../types";

export const playgroundTraceAdapter: TraceAdapter = {
  labId: "playground",
  adapt(trace) {
    return {
      accent: "small loop",
      insight: {
        title: "Playground Focus",
        bullets: [
          `Keep the "${trace.scenario}" trace small enough that advice order and transaction order stay readable together.`,
          "This trace is the best place to validate that the common UI can render steps, lanes, metrics, and snapshots from one schema.",
          `Provider mode: ${trace.mode}. Next target is replacing placeholder live output with normalized interceptor trace events.`
        ]
      }
    };
  }
};
