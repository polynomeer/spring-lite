import { liveTraceEndpoint } from "./runtime-config";
import type { LabTrace, LabTraceRequest } from "./types";

export async function fetchLiveLabTrace(request: LabTraceRequest): Promise<LabTrace> {
  if (!liveTraceEndpoint) {
    throw new Error("VITE_LAB_API_BASE_URL is not configured");
  }

  const response = await fetch(liveTraceEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Live trace request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as LabTrace;
}
