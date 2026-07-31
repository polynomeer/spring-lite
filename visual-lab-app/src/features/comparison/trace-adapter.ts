import type { TraceAdapter } from "../types";

export const comparisonTraceAdapter: TraceAdapter = {
  labId: "comparison",
  adapt(trace, locale) {
    const ko = locale === "ko";
    return {
      accent: ko ? "개념 브리지" : "concept bridge",
      insight: {
        title: ko ? "Comparison 포인트" : "Comparison Focus",
        bullets: [
          ko
            ? `"${trace.scenario}" 시나리오는 구현 범위를 비교하기 전에 공통 아키텍처 개념을 먼저 매핑하기 위한 것입니다.`
            : `The "${trace.scenario}" scenario is for mapping shared architectural ideas before comparing implementation breadth.`,
          ko
            ? "shared lane를 먼저 읽고, spring-lite가 개념을 얼마나 직접 드러내는지와 Spring이 어떻게 일반화하는지를 이어서 보세요."
            : "Read the shared lane first, then inspect how spring-lite keeps the concept explicit while Spring generalizes it.",
          ko
            ? "나중에 두 서버가 같은 스키마를 내리게 되면 이 trace들이 dual-runtime live 비교의 출발점이 됩니다."
            : "These traces are good staging points for later dual-runtime live comparison once both servers emit the same schema."
        ]
      }
    };
  }
};
