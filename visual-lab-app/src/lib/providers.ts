import { staticTraceCatalog } from "./lab-trace-data";
import type { LabTrace, LabTraceProvider, LabTraceRequest } from "./types";

class StaticLabTraceProvider implements LabTraceProvider {
  readonly kind = "static" as const;

  async getTrace(request: LabTraceRequest): Promise<LabTrace> {
    const key = `${request.labId}:${request.scenario}`;
    const trace = staticTraceCatalog[key];
    if (!trace) {
      throw new Error(`No static trace registered for ${key}`);
    }
    return trace;
  }
}

class LiveLabTraceProvider implements LabTraceProvider {
  readonly kind = "live" as const;

  async getTrace(request: LabTraceRequest): Promise<LabTrace> {
    return {
      id: `live-placeholder-${request.labId}-${request.scenario}`,
      labId: request.labId,
      mode: "live",
      scenario: request.scenario,
      title: "Live trace placeholder",
      summary: "Live mode is scaffolded but not yet connected to a backend trace endpoint.",
      metrics: [
        {
          label: "Provider Status",
          value: "pending",
          detail: "Waiting for request runner and trace API implementation."
        }
      ],
      steps: [
        {
          id: "placeholder-step",
          title: "Backend contract not connected",
          detail: "The frontend provider layer is ready. The next step is wiring this request to a real lab API.",
          marker: "todo",
          kind: "warning"
        }
      ],
      lanes: [
        {
          id: "placeholder-lane",
          label: "Live Runtime",
          detail: "This lane will render normalized server-side trace events.",
          kind: "generic",
          events: [
            {
              id: "placeholder-event",
              text: `Missing live endpoint for ${request.labId}:${request.scenario}`,
              kind: "warning"
            }
          ]
        }
      ],
      snapshot: {
        watch: "The provider boundary is now in place, but live mode has no backend trace source yet.",
        why: "Keeping a placeholder contract lets the same UI render static and live providers without branching the component structure.",
        next: "Implement `/lab/run/example-flow` and normalize its response into `LabTrace`."
      },
      references: ["docs/codex/visual-lab-frontend-separation-plan.md"]
    };
  }
}

export const staticLabTraceProvider = new StaticLabTraceProvider();
export const liveLabTraceProvider = new LiveLabTraceProvider();

export function getLabTraceProvider(kind: "static" | "live"): LabTraceProvider {
  return kind === "static" ? staticLabTraceProvider : liveLabTraceProvider;
}
