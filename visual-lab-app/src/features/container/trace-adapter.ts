import type { TraceAdapter } from "../types";

export const containerTraceAdapter: TraceAdapter = {
  labId: "container",
  adapt(trace, locale) {
    const ko = locale === "ko";
    return {
      accent: ko ? "컨테이너 내부" : "container internals",
      insight: {
        title: ko ? "Container Lab 포인트" : "Container Lab Focus",
        bullets: [
          ko
            ? `이 "${trace.scenario}" trace는 요청 처리보다 metadata가 runtime으로 바뀌는 전환 과정을 강조합니다.`
            : `This "${trace.scenario}" trace emphasizes metadata-to-runtime transitions rather than request handling.`,
          ko
            ? "정의 시점, 인스턴스화 시점, post-processing, 종료 시맨틱을 분리해서 이해하는 데 사용하세요."
            : "Use it to separate definition time, instantiation time, post-processing, and shutdown semantics.",
          ko
            ? "bootstrap trace와 lifecycle trace를 함께 보면 주입되는 객체가 왜 raw instance와 다를 수 있는지 이해하기 쉽습니다."
            : "Pair bootstrap traces with lifecycle traces to understand why the injected object can differ from the raw created instance."
        ]
      }
    };
  }
};
