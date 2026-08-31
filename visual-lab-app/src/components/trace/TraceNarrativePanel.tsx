import type { TraceStatusSummary } from "../../lib/trace-presentation";

interface TraceNarrativePanelProps {
  eyebrow: string;
  title: string;
  summary: string;
  modeLabel: string;
  branchLabel: string;
  nextStepLabel: string;
  modeDetail: string;
  branchDetail: string;
  nextStepDetail: string;
  tone: TraceStatusSummary["tone"];
}

export function TraceNarrativePanel({
  eyebrow,
  title,
  summary,
  modeLabel,
  branchLabel,
  nextStepLabel,
  modeDetail,
  branchDetail,
  nextStepDetail,
  tone
}: TraceNarrativePanelProps) {
  return (
    <article className={`trace-panel trace-narrative-panel tone-${tone}`}>
      <div className="trace-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
        <span className={`status-pill ${tone}`}>{branchLabel}</span>
      </div>

      <p className="run-focus-detail">{summary}</p>

      <div className="trace-list narrative-grid">
        <div className="trace-item info">
          <strong>{modeLabel}</strong>
          <p>{modeDetail}</p>
        </div>
        <div className="trace-item info">
          <strong>{branchLabel}</strong>
          <p>{branchDetail}</p>
        </div>
        <div className="trace-item info">
          <strong>{nextStepLabel}</strong>
          <p>{nextStepDetail}</p>
        </div>
      </div>
    </article>
  );
}
