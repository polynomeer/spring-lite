import type { TraceAdapter } from "../types";

export const playgroundTraceAdapter: TraceAdapter = {
  labId: "playground",
  adapt(trace, locale) {
    const ko = locale === "ko";
    return {
      accent: ko ? "작은 실험 루프" : "small loop",
      insight: {
        title: ko ? "Playground 포인트" : "Playground Focus",
        bullets: [
          ko
            ? `"${trace.scenario}" trace는 advice 순서와 transaction 순서를 함께 읽을 수 있을 만큼 작게 유지하는 것이 중요합니다.`
            : `Keep the "${trace.scenario}" trace small enough that advice order and transaction order stay readable together.`,
          ko
            ? "이 trace는 공통 UI가 하나의 스키마에서 steps, lanes, metrics, snapshot을 모두 렌더링하는지 검증하기 가장 좋은 장소입니다."
            : "This trace is the best place to validate that the common UI can render steps, lanes, metrics, and snapshots from one schema.",
          ko
            ? `Provider 모드: ${trace.mode}. 다음 목표는 placeholder live 출력 대신 정규화된 interceptor trace 이벤트를 연결하는 것입니다.`
            : `Provider mode: ${trace.mode}. Next target is replacing placeholder live output with normalized interceptor trace events.`
        ]
      }
    };
  }
};
