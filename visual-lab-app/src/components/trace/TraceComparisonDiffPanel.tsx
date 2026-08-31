import type { TraceComparisonDiffDiagram } from "../../features/types";

interface TraceComparisonDiffPanelProps {
  diagram: TraceComparisonDiffDiagram;
  comparisonDiffLabel: string;
  sharedCoreLabel: string;
  liteSideLabel: string;
  springSideLabel: string;
}

export function TraceComparisonDiffPanel({
  diagram,
  comparisonDiffLabel,
  sharedCoreLabel,
  liteSideLabel,
  springSideLabel
}: TraceComparisonDiffPanelProps) {
  return (
    <article className="trace-panel comparison-diff-panel">
      <div className="trace-head">
        <div>
          <p className="eyebrow">{comparisonDiffLabel}</p>
          <h3>{diagram.title}</h3>
          <p className="execution-path-subtitle">{diagram.subtitle}</p>
        </div>
      </div>

      <div className="comparison-diff-layout">
        <section className="comparison-side">
          <div className="state-transition-headline">
            <span className="status-pill info">{liteSideLabel}</span>
          </div>
          <div className="comparison-side-list">
            {diagram.liteSide.map((item) => (
              <div className={item.status === "taken" ? `execution-branch tone-${item.tone}` : "execution-branch idle"} key={item.id}>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="comparison-shared-core">
          <div className="state-transition-headline">
            <span className="status-pill success">{sharedCoreLabel}</span>
          </div>
          <div className="state-transition-rail">
            {diagram.sharedCore.map((node, index) => (
              <div className={`state-node tone-${node.tone}`} key={node.id}>
                <span className="execution-node-lane">{node.lane}</span>
                <strong>{node.label}</strong>
                <p>{node.detail}</p>
                {index < diagram.sharedCore.length - 1 ? <span className="state-connector" aria-hidden="true"></span> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="comparison-side">
          <div className="state-transition-headline">
            <span className="status-pill warning">{springSideLabel}</span>
          </div>
          <div className="comparison-side-list">
            {diagram.springSide.map((item) => (
              <div className={item.status === "taken" ? `execution-branch tone-${item.tone}` : "execution-branch idle"} key={item.id}>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
