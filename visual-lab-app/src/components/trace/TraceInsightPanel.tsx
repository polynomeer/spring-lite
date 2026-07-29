import type { TraceAdapterResult } from "../../features/types";

interface TraceInsightPanelProps {
  insight: TraceAdapterResult;
}

export function TraceInsightPanel({ insight }: TraceInsightPanelProps) {
  return (
    <article className="trace-panel">
      <div className="trace-head">
        <div>
          <p className="eyebrow">Feature Adapter</p>
          <h3>{insight.insight.title}</h3>
        </div>
        <span className="tag">{insight.accent}</span>
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
