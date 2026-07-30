import { useEffect, useState } from "react";
import { getLabTraceProvider } from "../lib/providers";
import type { LabTrace, LabTraceRequest } from "../lib/types";

interface UseLabTraceState {
  trace: LabTrace | null;
  error: string | null;
  loading: boolean;
}

export function useLabTrace(request: LabTraceRequest, reloadKey = 0): UseLabTraceState {
  const [trace, setTrace] = useState<LabTrace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    const provider = getLabTraceProvider(request.mode);

    setLoading(true);
    setError(null);

    provider
      .getTrace(request)
      .then((nextTrace) => {
        if (!cancelled) {
          setTrace(nextTrace);
          setLoading(false);
        }
      })
      .catch((nextError: unknown) => {
        if (!cancelled) {
          setTrace(null);
          setError(nextError instanceof Error ? nextError.message : "Unknown trace loading error");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [request.labId, request.mode, request.scenario, reloadKey]);

  return { trace, error, loading };
}
