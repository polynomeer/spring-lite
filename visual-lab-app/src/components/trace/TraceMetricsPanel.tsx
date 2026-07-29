import type { LabTrace } from "../../lib/types";

interface TraceMetricsPanelProps {
  trace: LabTrace;
}

export function TraceMetricsPanel({ trace }: TraceMetricsPanelProps) {
  return (
    <article className="trace-panel">
      <div className="trace-head">
        <div>
          <p className="eyebrow">Loaded Trace</p>
          <h3>{trace.title}</h3>
        </div>
        <span className="tag">{trace.scenario}</span>
      </div>
      <p>{trace.summary}</p>
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
