import type { LabTrace } from "../../lib/types";

interface TraceStepsPanelProps {
  trace: LabTrace;
}

export function TraceStepsPanel({ trace }: TraceStepsPanelProps) {
  return (
    <article className="trace-panel">
      <p className="eyebrow">Steps</p>
      <div className="trace-list">
        {trace.steps.map((step, index) => (
          <div className={`trace-item trace-step ${step.kind}`} key={step.id}>
            <div className="trace-step-top">
              <span className="trace-step-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="trace-step-marker">{step.marker}</span>
            </div>
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
