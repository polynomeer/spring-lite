import { containerGraphEndpoint, labEndpoint, liveEventsEndpoint, liveTraceEndpoint, sandboxEndpoint, springBootCompareEndpoint, springLiteCompareEndpoint } from "./runtime-config";
import type { ContainerGraph, LabEventTrace, PitfallRunResult, LabTrace, LabTraceRequest, SandboxNode, SandboxRunResult } from "./types";

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

export async function fetchContainerGraph(): Promise<ContainerGraph> {
  const response = await fetch(containerGraphEndpoint);
  if (!response.ok) {
    throw new Error(`Container graph request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as ContainerGraph;
}

export async function runPitfall(id: string, variant: "broken" | "fixed"): Promise<PitfallRunResult> {
  const response = await fetch(labEndpoint(`/lab/pitfalls/${id}/${variant}`), { method: "POST" });
  if (!response.ok) {
    throw new Error(`Pitfall run failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as PitfallRunResult;
}

/** Posts an invalid order to the endpoint with or without @Valid and reports what came back. */
export async function runMissingValid(variant: "broken" | "fixed"): Promise<PitfallRunResult> {
  const response = await fetch(labEndpoint(`/lab/pitfall-endpoints/missing-valid/${variant}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product: "x", quantity: 0 })
  });
  const body = await response.text();
  return {
    id: "missing-valid",
    variant,
    outcome: response.ok
      ? "잘못된 입력이 그대로 통과해 200 응답을 받았다."
      : `검증이 실행되어 ${response.status} 응답으로 거절됐다.`,
    facts: {
      "보낸 본문": '{"product":"x","quantity":0}',
      "HTTP 상태": String(response.status),
      "응답 본문": body.length > 160 ? `${body.slice(0, 160)}…` : body
    },
    events: []
  };
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
