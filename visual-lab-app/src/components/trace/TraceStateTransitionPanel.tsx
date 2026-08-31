import type { TraceStateTransitionDiagram } from "../../features/types";

interface TraceStateTransitionPanelProps {
  diagram: TraceStateTransitionDiagram;
  stateTransitionLabel: string;
  primaryLifecycleLabel: string;
  sideEffectLabel: string;
}

export function TraceStateTransitionPanel({
  diagram,
  stateTransitionLabel,
  primaryLifecycleLabel,
  sideEffectLabel
}: TraceStateTransitionPanelProps) {
  return (
    <article className="trace-panel state-transition-panel">
      <div className="trace-head">
        <div>
          <p className="eyebrow">{stateTransitionLabel}</p>
          <h3>{diagram.title}</h3>
          <p className="execution-path-subtitle">{diagram.subtitle}</p>
        </div>
      </div>

      <div className="state-transition-headline">
        <span className="status-pill info">{primaryLifecycleLabel}</span>
      </div>

      <div className="state-transition-rail" aria-label={diagram.title}>
        {diagram.states.map((state, index) => (
          <div className={state.status === "active" ? `state-node tone-${state.tone}` : "state-node inactive"} key={state.id}>
            <span className="execution-node-lane">{state.lane}</span>
            <strong>{state.label}</strong>
            <p>{state.detail}</p>
            {index < diagram.states.length - 1 ? <span className="state-connector" aria-hidden="true"></span> : null}
          </div>
        ))}
      </div>

      <div className="state-transition-headline">
        <span className="status-pill neutral">{sideEffectLabel}</span>
      </div>

      <div className="execution-branch-grid">
        {diagram.sideEffects.map((effect) => (
          <div
            className={effect.status === "taken" ? `execution-branch tone-${effect.tone}` : "execution-branch idle"}
            key={effect.id}
          >
            <div className="execution-branch-head">
              <span className={effect.status === "taken" ? `status-pill ${effect.tone}` : "status-pill neutral"}>
                {effect.status === "taken" ? primaryLifecycleLabel : sideEffectLabel}
              </span>
            </div>
            <strong>{effect.label}</strong>
            <p>{effect.detail}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
