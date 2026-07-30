import type { TraceAdapterResult } from "../../features/types";
import { deriveTraceStatusSummary } from "../../lib/trace-presentation";
import type { LabTrace } from "../../lib/types";

interface TraceInsightPanelProps {
  insight: TraceAdapterResult;
  trace: LabTrace;
}

export function TraceInsightPanel({ insight, trace }: TraceInsightPanelProps) {
  const status = deriveTraceStatusSummary(trace);

  return (
    <article className={`trace-panel tone-${status.tone}`}>
      <div className="trace-head">
        <div>
          <p className="eyebrow">Feature Adapter</p>
          <h3>{insight.insight.title}</h3>
        </div>
        <span className="tag">{insight.accent}</span>
      </div>
      <div className="trace-status-row">
        <span className={`status-pill ${status.tone}`}>{status.label}</span>
      </div>
      <div className="trace-list">
        {insight.insight.bullets.map((bullet) => (
          <div className="trace-item info" key={bullet}>
            <p>{bullet}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
