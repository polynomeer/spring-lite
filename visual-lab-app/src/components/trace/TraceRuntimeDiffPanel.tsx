interface TraceRuntimeDiffRow {
  label: string;
  staticValue: string;
  liveValue: string;
  detail: string;
  changed: boolean;
}

interface TraceRuntimeDiffPanelProps {
  title: string;
  subtitle: string;
  staticLabel: string;
  liveLabel: string;
  rows: TraceRuntimeDiffRow[];
}

export function TraceRuntimeDiffPanel({
  title,
  subtitle,
  staticLabel,
  liveLabel,
  rows
}: TraceRuntimeDiffPanelProps) {
  return (
    <article className="trace-panel runtime-diff-panel">
      <div className="trace-head">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{subtitle}</h3>
        </div>
      </div>

      <div className="runtime-diff-table" role="table" aria-label={title}>
        <div className="runtime-diff-row runtime-diff-header" role="row">
          <span role="columnheader">metric</span>
          <span role="columnheader">{staticLabel}</span>
          <span role="columnheader">{liveLabel}</span>
        </div>

        {rows.map((row) => (
          <div className={row.changed ? "runtime-diff-row changed" : "runtime-diff-row"} key={row.label} role="row">
            <div className="runtime-diff-metric">
              <strong>{row.label}</strong>
              <p>{row.detail}</p>
            </div>
            <span className="runtime-diff-value" role="cell">{row.staticValue}</span>
            <span className="runtime-diff-value" role="cell">{row.liveValue}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
