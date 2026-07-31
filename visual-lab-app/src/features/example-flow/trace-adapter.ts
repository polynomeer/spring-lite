import type { TraceAdapter } from "../types";

export const exampleFlowTraceAdapter: TraceAdapter = {
  labId: "example-flow",
  adapt(trace, locale) {
    const ko = locale === "ko";
    return {
      accent: ko ? "요청 경로" : "request path",
      insight: {
        title: ko ? "Example Flow 포인트" : "Example Flow Focus",
        bullets: [
          ko
            ? `"${trace.scenario}" 분기에서 MVC 진입부터 JDBC 종료까지 요청이 어떻게 이동하는지 추적하세요.`
            : `Track the request from MVC entry to JDBC exit through the "${trace.scenario}" branch.`,
          ko
            ? "web, service, tx, JDBC가 모두 참여하므로 이 trace 형태가 첫 live backend 계약으로 가장 적합합니다."
            : "Use this trace shape as the first live backend contract because web, service, tx, and JDBC all participate.",
          ko
            ? `관련 참고: ${trace.references.slice(0, 2).join(" / ")}`
            : `Related references: ${trace.references.slice(0, 2).join(" / ")}`
        ]
      }
    };
  }
};
