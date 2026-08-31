import type { Locale } from "../../lib/i18n";
import type { LabTrace } from "../../lib/types";

interface TraceStepsPanelProps {
  locale: Locale;
  stepsLabel: string;
  flowTimelineLabel: string;
  selectedStepLabel: string;
  trace: LabTrace;
  activeStepId: string;
  onSelectStep: (stepId: string) => void;
}

export function TraceStepsPanel({
  trace,
  stepsLabel,
  flowTimelineLabel,
  selectedStepLabel,
  activeStepId,
  onSelectStep
}: TraceStepsPanelProps) {
  const activeStep = trace.steps.find((step) => step.id === activeStepId) ?? trace.steps[0];

  return (
    <article className="trace-panel">
      <p className="eyebrow">{flowTimelineLabel}</p>
      <div className="flow-timeline" role="list" aria-label={stepsLabel}>
        {trace.steps.map((step, index) => (
          <button
            className={step.id === activeStepId ? `flow-timeline-step active ${step.kind}` : `flow-timeline-step ${step.kind}`}
            key={step.id}
            type="button"
            onClick={() => onSelectStep(step.id)}
          >
            <span className="flow-timeline-index">{String(index + 1).padStart(2, "0")}</span>
            <strong>{step.title}</strong>
            <span className="flow-timeline-marker">{step.marker}</span>
          </button>
        ))}
      </div>

      {activeStep ? (
        <div className={`trace-item trace-step focus-step ${activeStep.kind}`}>
          <div className="trace-step-top">
            <span className="trace-step-index">{selectedStepLabel}</span>
            <span className="trace-step-marker">{activeStep.marker}</span>
          </div>
          <strong>{activeStep.title}</strong>
          <p>{activeStep.detail}</p>
        </div>
      ) : null}

      <div className="trace-list">
        {trace.steps.map((step, index) => (
          <button
            className={step.id === activeStepId ? `trace-item trace-step active ${step.kind}` : `trace-item trace-step ${step.kind}`}
            key={step.id}
            type="button"
            onClick={() => onSelectStep(step.id)}
          >
            <div className="trace-step-top">
              <span className="trace-step-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="trace-step-marker">{step.marker}</span>
            </div>
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
          </button>
        ))}
      </div>
    </article>
  );
}
