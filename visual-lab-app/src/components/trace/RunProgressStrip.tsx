import type { DualRuntimeTraceState } from "../../hooks/useDualRuntimeTrace";
import type { Locale } from "../../lib/i18n";
import type { ResolvedTraceSource } from "../../hooks/useLabTrace";

interface RunProgressStripProps {
  locale: Locale;
  loading: boolean;
  source: ResolvedTraceSource | null;
  isComparison: boolean;
  comparison: DualRuntimeTraceState;
}

export function RunProgressStrip({ locale, loading, source, isComparison, comparison }: RunProgressStripProps) {
  const ko = locale === "ko";
  const serverDone = !loading && source !== null;
  const comparisonDone = !isComparison || (!comparison.loading && (comparison.springLite !== null || comparison.springLiteError !== null) && (comparison.springBoot !== null || comparison.springBootError !== null));
  const sourceLabel = source === "live-api" ? "API" : source === "static-catalog" ? "catalog" : source === "live-fallback" ? "fallback" : "-";
  const phases = [
    { label: ko ? "요청 준비" : "Request", detail: ko ? "선택값 고정" : "selection fixed", done: true },
    { label: ko ? "Trace 응답" : "Trace response", detail: loading ? (ko ? "응답 대기" : "awaiting server") : sourceLabel, done: serverDone, active: loading },
    { label: isComparison ? (ko ? "두 런타임" : "Both runtimes") : (ko ? "결과 렌더" : "Render result"), detail: isComparison
      ? comparison.loading ? (ko ? "병렬 조회 중" : "fetching in parallel") : comparisonDone ? (ko ? "비교 준비 완료" : "comparison ready") : (ko ? "일부 응답 실패" : "partial failure")
      : serverDone ? (ko ? "읽기 준비 완료" : "ready to inspect") : (ko ? "대기 중" : "waiting"), done: isComparison ? comparisonDone : serverDone, active: isComparison ? comparison.loading : false }
  ];

  return (
    <div className="run-progress-strip" role="status" aria-live="polite">
      {phases.map((phase, index) => (
        <div className={`run-progress-phase ${phase.done ? "done" : ""} ${phase.active ? "active" : ""}`} key={phase.label}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div><strong>{phase.label}</strong><small>{phase.detail}</small></div>
        </div>
      ))}
    </div>
  );
}
