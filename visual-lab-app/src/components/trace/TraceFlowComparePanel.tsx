import type { LabTrace } from "../../lib/types";
import { inferRelatedLaneKinds, isLaneRelatedToStep } from "./flow-linking";

interface TraceFlowComparePanelProps {
  title: string;
  currentRunLabel: string;
  staticBaselineLabel: string;
  selectedStepLabel: string;
  relatedLanesLabel: string;
  liveTrace: LabTrace;
  staticTrace: LabTrace;
  activeIndex: number;
}

function clampedStep(trace: LabTrace, index: number) {
  const safeIndex = Math.min(Math.max(index, 0), Math.max(trace.steps.length - 1, 0));
  return {
    index: safeIndex,
    step: trace.steps[safeIndex] ?? null
  };
}

export function TraceFlowComparePanel({
  title,
  currentRunLabel,
  staticBaselineLabel,
  selectedStepLabel,
  relatedLanesLabel,
  liveTrace,
  staticTrace,
  activeIndex
}: TraceFlowComparePanelProps) {
  const live = clampedStep(liveTrace, activeIndex);
  const baseline = clampedStep(staticTrace, activeIndex);

  return (
    <article className="trace-panel flow-compare-panel">
      <div className="trace-head">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{relatedLanesLabel}</h3>
        </div>
      </div>

      <div className="flow-compare-grid">
        {[{
          trace: liveTrace,
          step: live.step,
          index: live.index,
          label: currentRunLabel
        }, {
          trace: staticTrace,
          step: baseline.step,
          index: baseline.index,
          label: staticBaselineLabel
        }].map((column) => {
          const relatedKinds = column.step ? inferRelatedLaneKinds(column.step) : [];
          return (
            <section className="flow-compare-column" key={column.label}>
              <div className="flow-compare-head">
                <span className="status-pill info">{column.label}</span>
                {column.step ? <span className="tag">{column.step.marker}</span> : null}
              </div>

              <div className="trace-item trace-step focus-step">
                <div className="trace-step-top">
                  <span className="trace-step-index">{selectedStepLabel}</span>
                  <span className="trace-step-index">
                    {String(column.index + 1).padStart(2, "0")} / {String(column.trace.steps.length).padStart(2, "0")}
                  </span>
                </div>
                <strong>{column.step?.title ?? "-"}</strong>
                <p>{column.step?.detail ?? "-"}</p>
              </div>

              <div className="lane-focus-summary">
                {relatedKinds.map((kind) => (
                  <span className="status-pill neutral" key={`${column.label}-${kind}`}>{kind}</span>
                ))}
              </div>

              <div className="trace-list">
                {column.trace.lanes.map((lane) => {
                  const isRelated = isLaneRelatedToStep(lane, column.step);
                  return (
                    <div className={isRelated ? `lane-card lane-${lane.kind} active` : `lane-card lane-${lane.kind} subdued`} key={`${column.label}-${lane.id}`}>
                      <div className="lane-head">
                        <strong>{lane.label}</strong>
                        <span className="lane-kind">{lane.kind}</span>
                      </div>
                      <p>{lane.detail}</p>
                      <div className="lane-track" aria-label={lane.label}>
                        {lane.events.map((laneEvent, eventIndex) => (
                          <div className={isRelated ? `lane-stop active ${laneEvent.kind}` : `lane-stop ${laneEvent.kind}`} key={`${column.label}-${laneEvent.id}`}>
                            <span className="lane-stop-index">{String(eventIndex + 1).padStart(2, "0")}</span>
                            <span className={`lane-event ${laneEvent.kind}`}>{laneEvent.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </article>
  );
}
