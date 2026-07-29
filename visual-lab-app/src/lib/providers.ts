import { fetchLiveLabTrace } from "./live-api";
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
    try {
      return fetchLiveLabTrace(request);
    } catch (error) {
      return {
        id: `live-placeholder-${request.labId}-${request.scenario}`,
        labId: request.labId,
        mode: "live",
        scenario: request.scenario,
        title: "Live trace placeholder",
        summary: "Live mode attempted a backend call, but no reachable lab trace endpoint responded.",
        metrics: [
          {
            label: "Provider Status",
            value: "backend-unavailable",
            detail: "Start example-app or set VITE_LAB_API_BASE_URL to a reachable server."
          }
        ],
        steps: [
          {
            id: "placeholder-step",
            title: "Live API request failed",
            detail: error instanceof Error ? error.message : "Unknown live trace error",
            marker: "fetch",
            kind: "warning"
          }
        ],
        lanes: [
          {
            id: "placeholder-lane",
            label: "Live Runtime",
            detail: "This lane will render normalized server-side trace events once the backend responds.",
            kind: "generic",
            events: [
              {
                id: "placeholder-event",
                text: `Unavailable endpoint for ${request.labId}:${request.scenario}`,
                kind: "warning"
              }
            ]
          }
        ],
        snapshot: {
          watch: "The frontend is now trying the real backend path first before falling back to a placeholder trace.",
          why: "This keeps live mode debuggable while the local backend may be stopped or not yet fully implemented.",
          next: "Start :example-app:run or point VITE_LAB_API_BASE_URL at a reachable server exposing POST /lab/run/trace."
        },
        references: ["docs/codex/visual-lab-frontend-separation-plan.md"]
      };
    }
  }
}

export const staticLabTraceProvider = new StaticLabTraceProvider();
export const liveLabTraceProvider = new LiveLabTraceProvider();

export function getLabTraceProvider(kind: "static" | "live"): LabTraceProvider {
  return kind === "static" ? staticLabTraceProvider : liveLabTraceProvider;
}
