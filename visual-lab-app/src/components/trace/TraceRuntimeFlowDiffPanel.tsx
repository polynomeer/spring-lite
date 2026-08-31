interface TraceRuntimeFlowDiffPanelProps {
  title: string;
  subtitle: string;
  sharedLabel: string;
  liveOnlyLabel: string;
  staticOnlyLabel: string;
  laneLabel: string;
  sharedSteps: string[];
  liveOnlySteps: string[];
  staticOnlySteps: string[];
  laneRows: Array<{
    lane: string;
    staticCount: number;
    liveCount: number;
    note: string;
    changed: boolean;
  }>;
}

function renderStepList(items: string[]) {
  if (items.length === 0) {
    return <p className="runtime-flow-empty">-</p>;
  }

  return (
    <div className="runtime-flow-step-list">
      {items.map((item) => (
        <span className="status-pill neutral" key={item}>{item}</span>
      ))}
    </div>
  );
}

export function TraceRuntimeFlowDiffPanel({
  title,
  subtitle,
  sharedLabel,
  liveOnlyLabel,
  staticOnlyLabel,
  laneLabel,
  sharedSteps,
  liveOnlySteps,
  staticOnlySteps,
  laneRows
}: TraceRuntimeFlowDiffPanelProps) {
  return (
    <article className="trace-panel runtime-flow-diff-panel">
      <div className="trace-head">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{subtitle}</h3>
        </div>
      </div>

      <div className="runtime-flow-diff-grid">
        <section className="runtime-flow-card">
          <strong>{sharedLabel}</strong>
          {renderStepList(sharedSteps)}
        </section>
        <section className="runtime-flow-card">
          <strong>{liveOnlyLabel}</strong>
          {renderStepList(liveOnlySteps)}
        </section>
        <section className="runtime-flow-card">
          <strong>{staticOnlyLabel}</strong>
          {renderStepList(staticOnlySteps)}
        </section>
      </div>

      <div className="runtime-lane-diff-table">
        <div className="runtime-diff-row runtime-diff-header" role="row">
          <span role="columnheader">{laneLabel}</span>
          <span role="columnheader">static</span>
          <span role="columnheader">live</span>
        </div>
        {laneRows.map((row) => (
          <div className={row.changed ? "runtime-diff-row changed" : "runtime-diff-row"} key={row.lane} role="row">
            <div className="runtime-diff-metric">
              <strong>{row.lane}</strong>
              <p>{row.note}</p>
            </div>
            <span className="runtime-diff-value" role="cell">{row.staticCount}</span>
            <span className="runtime-diff-value" role="cell">{row.liveCount}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
