import type { Locale } from "../../lib/i18n";
import type { LabTrace } from "../../lib/types";

interface TraceStepsPanelProps {
  locale: Locale;
  stepsLabel: string;
  flowTimelineLabel: string;
  replayControlsLabel: string;
  replayPlayLabel: string;
  replayPauseLabel: string;
  replayPreviousLabel: string;
  replayNextLabel: string;
  replayAutoLabel: string;
  replayManualLabel: string;
  selectedStepLabel: string;
  trace: LabTrace;
  activeStepId: string;
  isReplaying: boolean;
  onSelectStep: (stepId: string) => void;
  onToggleReplay: () => void;
  onReplayPrevious: () => void;
  onReplayNext: () => void;
}

export function TraceStepsPanel({
  trace,
  stepsLabel,
  flowTimelineLabel,
  replayControlsLabel,
  replayPlayLabel,
  replayPauseLabel,
  replayPreviousLabel,
  replayNextLabel,
  replayAutoLabel,
  replayManualLabel,
  selectedStepLabel,
  activeStepId,
  isReplaying,
  onSelectStep,
  onToggleReplay,
  onReplayPrevious,
  onReplayNext
}: TraceStepsPanelProps) {
  const activeStepIndex = trace.steps.findIndex((step) => step.id === activeStepId);
  const activeStep = trace.steps[activeStepIndex] ?? trace.steps[0];

  return (
    <article className="trace-panel">
      <div className="trace-head">
        <div>
          <p className="eyebrow">{flowTimelineLabel}</p>
          <h3>{replayControlsLabel}</h3>
        </div>
        <span className={isReplaying ? "status-pill success" : "status-pill neutral"}>
          {isReplaying ? replayAutoLabel : replayManualLabel}
        </span>
      </div>

      <div className="replay-control-row">
        <button className="ghost-button replay-control" type="button" onClick={onReplayPrevious}>
          {replayPreviousLabel}
        </button>
        <button className="ghost-button replay-control primary" type="button" onClick={onToggleReplay}>
          {isReplaying ? replayPauseLabel : replayPlayLabel}
        </button>
        <button className="ghost-button replay-control" type="button" onClick={onReplayNext}>
          {replayNextLabel}
        </button>
      </div>

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
            <span className="trace-step-index">
              {String((activeStepIndex >= 0 ? activeStepIndex : 0) + 1).padStart(2, "0")} / {String(trace.steps.length).padStart(2, "0")}
            </span>
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
