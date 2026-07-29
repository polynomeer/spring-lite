import { fetchLiveLabTrace } from "./live-api";
import { liveTraceEndpoint } from "./runtime-config";
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
    if (liveTraceEndpoint) {
      return fetchLiveLabTrace(request);
    }

    return {
      id: `live-placeholder-${request.labId}-${request.scenario}`,
      labId: request.labId,
      mode: "live",
      scenario: request.scenario,
      title: "Live trace placeholder",
      summary: "Live mode is scaffolded, but no backend API base URL is configured yet.",
      metrics: [
        {
          label: "Provider Status",
          value: "missing-config",
          detail: "Set VITE_LAB_API_BASE_URL to enable real trace fetching."
        }
      ],
      steps: [
        {
          id: "placeholder-step",
          title: "Live API endpoint not configured",
          detail: "The frontend provider layer is ready. Add VITE_LAB_API_BASE_URL so this request can call the backend trace endpoint.",
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
              text: `Configure VITE_LAB_API_BASE_URL for ${request.labId}:${request.scenario}`,
              kind: "warning"
            }
          ]
        }
      ],
      snapshot: {
        watch: "The provider boundary is in place, but live mode cannot call the backend until a base URL is configured.",
        why: "This keeps the same UI contract for static and live providers while the server-side trace endpoint is still under development.",
        next: "Set VITE_LAB_API_BASE_URL and implement POST /lab/run/trace so live mode can return a real LabTrace payload."
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
