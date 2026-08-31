import type { TraceExecutionPathDiagram } from "../../features/types";

interface TraceExecutionPathPanelProps {
  diagram: TraceExecutionPathDiagram;
  executionPathLabel: string;
  activePathLabel: string;
  alternatePathLabel: string;
}

export function TraceExecutionPathPanel({
  diagram,
  executionPathLabel,
  activePathLabel,
  alternatePathLabel
}: TraceExecutionPathPanelProps) {
  return (
    <article className="trace-panel execution-path-panel">
      <div className="trace-head">
        <div>
          <p className="eyebrow">{executionPathLabel}</p>
          <h3>{diagram.title}</h3>
          <p className="execution-path-subtitle">{diagram.subtitle}</p>
        </div>
      </div>

      <div className="execution-path-rail" aria-label={diagram.title}>
        {diagram.nodes.map((node, index) => (
          <div className={node.status === "active" ? `execution-node tone-${node.tone}` : "execution-node inactive"} key={node.id}>
            <span className="execution-node-lane">{node.lane}</span>
            <strong>{node.label}</strong>
            <p>{node.detail}</p>
            {index < diagram.nodes.length - 1 ? <span className="execution-connector" aria-hidden="true"></span> : null}
          </div>
        ))}
      </div>

      <div className="execution-branch-grid">
        {diagram.branches.map((branch) => (
          <div
            className={branch.status === "taken" ? `execution-branch tone-${branch.tone}` : "execution-branch idle"}
            key={branch.id}
          >
            <div className="execution-branch-head">
              <span className={branch.status === "taken" ? `status-pill ${branch.tone}` : "status-pill neutral"}>
                {branch.status === "taken" ? activePathLabel : alternatePathLabel}
              </span>
            </div>
            <strong>{branch.label}</strong>
            <p>{branch.detail}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
