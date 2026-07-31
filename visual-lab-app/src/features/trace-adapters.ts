import type { Locale } from "../lib/i18n";
import { comparisonTraceAdapter } from "./comparison/trace-adapter";
import { containerTraceAdapter } from "./container/trace-adapter";
import { exampleFlowTraceAdapter } from "./example-flow/trace-adapter";
import { playgroundTraceAdapter } from "./playground/trace-adapter";
import type { TraceAdapter, TraceAdapterResult } from "./types";
import type { LabTrace } from "../lib/types";

const adapters: TraceAdapter[] = [
  exampleFlowTraceAdapter,
  playgroundTraceAdapter,
  containerTraceAdapter,
  comparisonTraceAdapter
];

const fallbackAdapter: TraceAdapter = {
  labId: "comparison",
  adapt(trace: LabTrace, locale: Locale): TraceAdapterResult {
    const ko = locale === "ko";
    return {
      accent: ko ? "공통 trace" : "generic trace",
      insight: {
        title: ko ? "공통 Trace 계약" : "Shared Trace Contract",
        bullets: [
          ko
            ? `이 ${trace.labId} trace는 이미 공통 LabTrace 스키마에 맞춰져 있습니다.`
            : `This ${trace.labId} trace already fits the common LabTrace schema.`,
          ko
            ? "전용 feature adapter를 추가하면 이후 문구, 보조 패널, 비교 힌트를 더 정교하게 만들 수 있습니다."
            : "A dedicated feature adapter can refine copy, secondary panels, and comparison hints later.",
          ko ? `시나리오: ${trace.scenario}` : `Scenario: ${trace.scenario}`
        ]
      }
    };
  }
};

export function adaptTrace(trace: LabTrace, locale: Locale): TraceAdapterResult {
  const adapter = adapters.find((candidate) => candidate.labId === trace.labId);
  return (adapter ?? fallbackAdapter).adapt(trace, locale);
}
