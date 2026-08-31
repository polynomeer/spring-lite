import type { Locale } from "../../lib/i18n";
import type { LabTrace } from "../../lib/types";
import { inferRelatedLaneKinds, isLaneRelatedToStep } from "./flow-linking";

interface TraceLanesPanelProps {
  lanesLabel: string;
  relatedLanesLabel: string;
  locale: Locale;
  trace: LabTrace;
  activeStepId: string;
}

export function TraceLanesPanel({ trace, lanesLabel, relatedLanesLabel, activeStepId }: TraceLanesPanelProps) {
  const activeStep = trace.steps.find((step) => step.id === activeStepId) ?? trace.steps[0] ?? null;
  const relatedKinds = activeStep ? inferRelatedLaneKinds(activeStep) : [];

  return (
    <article className="trace-panel">
      <div className="trace-head">
        <div>
          <p className="eyebrow">{lanesLabel}</p>
          <h3>{relatedLanesLabel}</h3>
        </div>
        {activeStep ? <span className="tag">{activeStep.marker}</span> : null}
      </div>

      <div className="lane-focus-summary">
        {relatedKinds.map((kind) => (
          <span className="status-pill info" key={kind}>{kind}</span>
        ))}
      </div>

      <div className="trace-list">
        {trace.lanes.map((lane) => {
          const isRelated = isLaneRelatedToStep(lane, activeStep);
          return (
            <div className={isRelated ? `lane-card lane-${lane.kind} active` : `lane-card lane-${lane.kind} subdued`} key={lane.id}>
              <div className="lane-head">
                <strong>{lane.label}</strong>
                <span className="lane-kind">{lane.kind}</span>
              </div>
              <p>{lane.detail}</p>
              <div className="lane-track" aria-label={lane.label}>
                {lane.events.map((laneEvent, index) => (
                  <div className={isRelated ? `lane-stop active ${laneEvent.kind}` : `lane-stop ${laneEvent.kind}`} key={laneEvent.id}>
                    <span className="lane-stop-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className={`lane-event ${laneEvent.kind}`}>{laneEvent.text}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
