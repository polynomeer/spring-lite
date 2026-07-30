import type { TraceAdapter } from "../types";

export const containerTraceAdapter: TraceAdapter = {
  labId: "container",
  adapt(trace) {
    return {
      accent: "container internals",
      insight: {
        title: "Container Lab Focus",
        bullets: [
          `This "${trace.scenario}" trace emphasizes metadata-to-runtime transitions rather than request handling.`,
          "Use it to separate definition time, instantiation time, post-processing, and shutdown semantics.",
          "Pair bootstrap traces with lifecycle traces to understand why the injected object can differ from the raw created instance."
        ]
      }
    };
  }
};
