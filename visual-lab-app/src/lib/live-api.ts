import { liveEventsEndpoint, liveTraceEndpoint, sandboxEndpoint, springBootCompareEndpoint, springLiteCompareEndpoint } from "./runtime-config";
import type { LabEventTrace, LabTrace, LabTraceRequest, SandboxNode, SandboxRunResult } from "./types";

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

export async function fetchLabEventTrace(request: LabTraceRequest): Promise<LabEventTrace> {
  const response = await fetch(liveEventsEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Live event trace request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as LabEventTrace;
}

export async function runSandbox(root: SandboxNode): Promise<SandboxRunResult> {
  const response = await fetch(sandboxEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ root })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Sandbox run failed: ${response.status} ${detail || response.statusText}`);
  }

  return (await response.json()) as SandboxRunResult;
}

async function fetchComparisonTrace(endpoint: string, runtime: string): Promise<LabTrace> {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`${runtime} comparison trace failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as LabTrace;
}

export function fetchDualRuntimeComparisonTraces(scenario: string) {
  return Promise.allSettled([
    fetchComparisonTrace(springLiteCompareEndpoint(scenario), "Spring Lite"),
    fetchComparisonTrace(springBootCompareEndpoint(scenario), "Spring Boot")
  ]);
}
