import type { LabTrace } from "../../lib/types";
import { deriveTraceStatusSummary } from "../../lib/trace-presentation";

interface TraceMetricsPanelProps {
  trace: LabTrace;
}

export function TraceMetricsPanel({ trace }: TraceMetricsPanelProps) {
  const status = deriveTraceStatusSummary(trace);

  return (
    <article className={`trace-panel tone-${status.tone}`}>
      <div className="trace-head">
        <div>
          <p className="eyebrow">Loaded Trace</p>
          <h3>{trace.title}</h3>
        </div>
        <span className="tag">{trace.scenario}</span>
      </div>
      <div className="trace-status-row">
        <span className={`status-pill ${status.tone}`}>{status.label}</span>
        <span className="status-pill neutral">{trace.mode}</span>
      </div>
      <p>{trace.summary}</p>
      <p className="trace-status-detail">{status.detail}</p>
      <div className="metric-mini-grid">
        {trace.metrics.map((metric) => (
          <div className="metric-mini" key={metric.label}>
            <strong>{metric.label}</strong>
            <div className="metric-mini-value">{metric.value}</div>
            <span>{metric.detail}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
