import { liveTraceEndpoint, springBootCompareEndpoint, springLiteCompareEndpoint } from "./runtime-config";
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

async function fetchComparisonTrace(endpoint: string, runtime: string): Promise<LabTrace> {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`${runtime} comparison trace failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as LabTrace;
}

export function fetchDualRuntimeDiTraces() {
  return Promise.allSettled([
    fetchComparisonTrace(springLiteCompareEndpoint, "Spring Lite"),
    fetchComparisonTrace(springBootCompareEndpoint, "Spring Boot")
  ]);
}
