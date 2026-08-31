import { useEffect, useState } from "react";
import { getLabTraceProvider } from "../lib/providers";
import type { LabTrace, LabTraceRequest, RuntimeMode } from "../lib/types";

export type ResolvedTraceSource = "static-catalog" | "live-api" | "live-fallback";

interface UseLabTraceState {
  trace: LabTrace | null;
  error: string | null;
  loading: boolean;
  requestedMode: RuntimeMode;
  resolvedSource: ResolvedTraceSource | null;
}

function resolveTraceSource(trace: LabTrace, requestedMode: RuntimeMode): ResolvedTraceSource {
  if (requestedMode === "static") {
    return "static-catalog";
  }

  return trace.id.startsWith("live-placeholder-") ? "live-fallback" : "live-api";
}

export function useLabTrace(request: LabTraceRequest, reloadKey = 0): UseLabTraceState {
  const [trace, setTrace] = useState<LabTrace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [resolvedSource, setResolvedSource] = useState<ResolvedTraceSource | null>(null);

  useEffect(() => {
    let cancelled = false;
    const provider = getLabTraceProvider(request.mode);

    setLoading(true);
    setError(null);
    setResolvedSource(null);

    provider
      .getTrace(request)
      .then((nextTrace) => {
        if (!cancelled) {
          setTrace(nextTrace);
          setResolvedSource(resolveTraceSource(nextTrace, request.mode));
          setLoading(false);
        }
      })
      .catch((nextError: unknown) => {
        if (!cancelled) {
          setTrace(null);
          setError(nextError instanceof Error ? nextError.message : "Unknown trace loading error");
          setResolvedSource(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [request.labId, request.mode, request.scenario, reloadKey]);

  return { trace, error, loading, requestedMode: request.mode, resolvedSource };
}
