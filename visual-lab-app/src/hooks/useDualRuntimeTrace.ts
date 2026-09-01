import { useEffect, useState } from "react";
import { fetchDualRuntimeDiTraces } from "../lib/live-api";
import type { LabTrace } from "../lib/types";

export interface DualRuntimeTraceState {
  springLite: LabTrace | null;
  springBoot: LabTrace | null;
  springLiteError: string | null;
  springBootError: string | null;
  loading: boolean;
}

const initialState: DualRuntimeTraceState = {
  springLite: null,
  springBoot: null,
  springLiteError: null,
  springBootError: null,
  loading: false
};

export function useDualRuntimeTrace(enabled: boolean, runSequence: number): DualRuntimeTraceState {
  const [state, setState] = useState<DualRuntimeTraceState>(initialState);

  useEffect(() => {
    if (!enabled) {
      setState(initialState);
      return;
    }
    let cancelled = false;
    setState({ ...initialState, loading: true });
    fetchDualRuntimeDiTraces().then(([lite, boot]) => {
      if (cancelled) return;
      setState({
        springLite: lite.status === "fulfilled" ? lite.value : null,
        springBoot: boot.status === "fulfilled" ? boot.value : null,
        springLiteError: lite.status === "rejected" ? String(lite.reason) : null,
        springBootError: boot.status === "rejected" ? String(boot.reason) : null,
        loading: false
      });
    });
    return () => { cancelled = true; };
  }, [enabled, runSequence]);

  return state;
}
