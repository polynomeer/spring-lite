import type { TraceAdapterResult } from "../../features/types";
import type { Locale } from "../../lib/i18n";
import { deriveTraceStatusSummary } from "../../lib/trace-presentation";
import type { LabTrace } from "../../lib/types";

interface TraceInsightPanelProps {
  insight: TraceAdapterResult;
  locale: Locale;
  trace: LabTrace;
  featureAdapterLabel: string;
}

export function TraceInsightPanel({ insight, trace, locale, featureAdapterLabel }: TraceInsightPanelProps) {
  const status = deriveTraceStatusSummary(trace, locale);

  return (
    <article className={`trace-panel tone-${status.tone}`}>
      <div className="trace-head">
        <div>
          <p className="eyebrow">{featureAdapterLabel}</p>
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
