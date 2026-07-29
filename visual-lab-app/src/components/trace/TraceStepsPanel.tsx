import type { LabTrace } from "../../lib/types";

interface TraceStepsPanelProps {
  trace: LabTrace;
}

export function TraceStepsPanel({ trace }: TraceStepsPanelProps) {
  return (
    <article className="trace-panel">
      <p className="eyebrow">Steps</p>
      <div className="trace-list">
        {trace.steps.map((step) => (
          <div className={`trace-item ${step.kind}`} key={step.id}>
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
