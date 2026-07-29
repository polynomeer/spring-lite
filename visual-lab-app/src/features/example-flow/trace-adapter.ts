import type { TraceAdapter } from "../types";

export const exampleFlowTraceAdapter: TraceAdapter = {
  labId: "example-flow",
  adapt(trace) {
    return {
      accent: "request path",
      insight: {
        title: "Example Flow Focus",
        bullets: [
          `Track the request from MVC entry to JDBC exit through the "${trace.scenario}" branch.`,
          "Use this trace shape as the first live backend contract because web, service, tx, and JDBC all participate.",
          `Related references: ${trace.references.slice(0, 2).join(" / ")}`
        ]
      }
    };
  }
};
