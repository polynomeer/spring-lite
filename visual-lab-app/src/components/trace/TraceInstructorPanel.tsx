import { resolveFlowCodeFocus } from "./flow-code-map";
import type { Locale } from "../../lib/i18n";
import type { LabTrace } from "../../lib/types";

interface TraceInstructorPanelProps {
  trace: LabTrace;
  activeStepId: string;
  locale: Locale;
  labels: {
    title: string;
    classFocus: string;
    methodFocus: string;
    docFocus: string;
    testFocus: string;
    testMethodFocus: string;
    assertionFocus: string;
    checklist: string;
  };
}

export function TraceInstructorPanel({ trace, activeStepId, locale, labels }: TraceInstructorPanelProps) {
  const step = trace.steps.find((candidate) => candidate.id === activeStepId) ?? trace.steps[0];
  const reference = trace.references.find((candidate) => candidate.endsWith(".java")) ?? trace.references[0];
  if (!reference) return null;

  const laneKinds = trace.lanes.map((lane) => lane.kind);
  const focus = resolveFlowCodeFocus(reference, step?.marker, laneKinds, locale);
  const note = locale === "ko" ? focus.noteKo : focus.noteEn;
  const assertion = locale === "ko" ? focus.assertionFocusKo : focus.assertionFocusEn;
  const checklist = locale === "ko" ? focus.checklistKo : focus.checklistEn;

  return (
    <article className="trace-panel instructor-panel">
      <div className="trace-head">
        <div><p className="eyebrow">{labels.title}</p><h3>{note}</h3></div>
        {step ? <span className="status-pill info">{step.marker}</span> : null}
      </div>
      <div className="instructor-focus-grid">
        <div className="trace-item info"><span>{labels.classFocus}</span><strong>{focus.classFocus}</strong></div>
        <div className="trace-item info"><span>{labels.methodFocus}</span><strong>{focus.methodFocus}</strong></div>
        <div className="trace-item info"><span>{labels.testFocus}</span><strong>{focus.testFocus}</strong></div>
        <div className="trace-item info"><span>{labels.testMethodFocus}</span><strong>{focus.testMethodFocus}</strong></div>
      </div>
      <div className="instructor-detail"><strong>{labels.assertionFocus}</strong><p>{assertion}</p></div>
      <div className="instructor-detail"><strong>{labels.docFocus}</strong><p><code>{focus.docFocus}</code></p></div>
      <div className="flow-reference-checklist">
        <div className="flow-reference-checklist-head"><strong>{labels.checklist}</strong><span className="status-pill neutral">{checklist.length}</span></div>
        <div className="flow-reference-checklist-steps">
          {checklist.map((item, index) => <div className={index === 0 ? "flow-reference-checklist-step active" : "flow-reference-checklist-step"} key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}
        </div>
      </div>
    </article>
  );
}
