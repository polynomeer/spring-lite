import type { LabTrace } from "../../lib/types";
import { inferRelatedLaneKinds, isLaneRelatedToStep } from "./flow-linking";
import { resolveFlowCodeFocus } from "./flow-code-map";

interface TraceFlowComparePanelProps {
  locale: "ko" | "en";
  title: string;
  currentRunLabel: string;
  staticBaselineLabel: string;
  selectedStepLabel: string;
  relatedLanesLabel: string;
  stepShapeDiffLabel: string;
  titleDiffLabel: string;
  markerDiffLabel: string;
  detailDiffLabel: string;
  eventCountDiffLabel: string;
  whyDiffersLabel: string;
  inspectCodeLabel: string;
  primarySurfaceLabel: string;
  supportingSurfaceLabel: string;
  classFocusLabel: string;
  methodFocusLabel: string;
  docFocusLabel: string;
  reasonShapeLabel: string;
  reasonRuntimeLabel: string;
  reasonStaticLabel: string;
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

function compareStepState(liveTrace: LabTrace, staticTrace: LabTrace, index: number) {
  const liveStep = liveTrace.steps[index] ?? null;
  const staticStep = staticTrace.steps[index] ?? null;

  return {
    titleChanged: (liveStep?.title ?? "") !== (staticStep?.title ?? ""),
    markerChanged: (liveStep?.marker ?? "") !== (staticStep?.marker ?? ""),
    detailChanged: (liveStep?.detail ?? "") !== (staticStep?.detail ?? ""),
    missingOnOneSide: !liveStep || !staticStep
  };
}

export function TraceFlowComparePanel({
  locale,
  title,
  currentRunLabel,
  staticBaselineLabel,
  selectedStepLabel,
  relatedLanesLabel,
  stepShapeDiffLabel,
  titleDiffLabel,
  markerDiffLabel,
  detailDiffLabel,
  eventCountDiffLabel,
  whyDiffersLabel,
  inspectCodeLabel,
  primarySurfaceLabel,
  supportingSurfaceLabel,
  classFocusLabel,
  methodFocusLabel,
  docFocusLabel,
  reasonShapeLabel,
  reasonRuntimeLabel,
  reasonStaticLabel,
  liveTrace,
  staticTrace,
  activeIndex
}: TraceFlowComparePanelProps) {
  const live = clampedStep(liveTrace, activeIndex);
  const baseline = clampedStep(staticTrace, activeIndex);
  const stepDiff = compareStepState(liveTrace, staticTrace, activeIndex);
  const matchingReferences = Array.from(new Set([...liveTrace.references, ...staticTrace.references])).slice(0, 4);
  const reasonLines = [
    stepDiff.missingOnOneSide ? reasonShapeLabel : null,
    stepDiff.titleChanged || stepDiff.markerChanged || stepDiff.detailChanged ? reasonRuntimeLabel : null,
    stepDiff.missingOnOneSide || stepDiff.detailChanged ? reasonStaticLabel : null
  ].filter((line): line is string => Boolean(line));
  const activeKinds = Array.from(new Set([
    ...(live.step ? inferRelatedLaneKinds(live.step) : []),
    ...(baseline.step ? inferRelatedLaneKinds(baseline.step) : [])
  ]));
  const referenceCards = matchingReferences.map((reference, index) => {
    const lower = reference.toLowerCase();
    const isController = lower.includes("controller");
    const isService = lower.includes("service");
    const isRepository = lower.includes("repository") || lower.includes("jdbc");
    const isTx = lower.includes("transaction");
    const isPrimary = (activeKinds.includes("web") && isController)
      || (activeKinds.includes("service") && isService)
      || (activeKinds.includes("jdbc") && isRepository)
      || (activeKinds.includes("tx") && isTx)
      || index === 0;

    const note = isController
      ? locale === "ko" ? "HTTP 진입, 바인딩, 응답 작성 경로" : "HTTP entry, binding, and response path"
      : isService
        ? locale === "ko" ? "비즈니스 분기와 예외 발생 지점" : "Business branch and exception point"
        : isRepository
          ? locale === "ko" ? "영속화와 row 가시성 경로" : "Persistence and row visibility path"
          : isTx
            ? locale === "ko" ? "트랜잭션 경계와 프록시 동작" : "Transactional boundary and proxy behavior"
            : locale === "ko" ? "이 시나리오의 참고 코드 표면" : "Reference surface for this scenario";
    const resolvedFocus = resolveFlowCodeFocus(reference, live.step?.marker ?? baseline.step?.marker, activeKinds, locale);

    return {
      reference,
      note: locale === "ko" ? resolvedFocus.noteKo : resolvedFocus.noteEn,
      isPrimary,
      classFocus: resolvedFocus.classFocus,
      methodFocus: resolvedFocus.methodFocus,
      docFocus: resolvedFocus.docFocus
    };
  });

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
          const counterpartTrace = column.label === currentRunLabel ? staticTrace : liveTrace;
          return (
            <section className="flow-compare-column" key={column.label}>
              <div className="flow-compare-head">
                <span className="status-pill info">{column.label}</span>
                {column.step ? <span className="tag">{column.step.marker}</span> : null}
                {stepDiff.missingOnOneSide ? <span className="status-pill warning">{stepShapeDiffLabel}</span> : null}
              </div>

              <div className="trace-item trace-step focus-step">
                <div className="trace-step-top">
                  <span className="trace-step-index">{selectedStepLabel}</span>
                  <span className="trace-step-index">
                    {String(column.index + 1).padStart(2, "0")} / {String(column.trace.steps.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="flow-compare-step-head">
                  <strong>{column.step?.title ?? "-"}</strong>
                  <div className="flow-compare-badges">
                    {stepDiff.titleChanged ? <span className="status-pill warning">{titleDiffLabel}</span> : null}
                    {stepDiff.markerChanged ? <span className="status-pill info">{markerDiffLabel}</span> : null}
                    {stepDiff.detailChanged ? <span className="status-pill neutral">{detailDiffLabel}</span> : null}
                  </div>
                </div>
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
                  const counterpartLane = counterpartTrace.lanes.find((item) => item.kind === lane.kind);
                  const eventCountChanged = (counterpartLane?.events.length ?? 0) !== lane.events.length;
                  return (
                    <div className={isRelated ? `lane-card lane-${lane.kind} active` : `lane-card lane-${lane.kind} subdued`} key={`${column.label}-${lane.id}`}>
                      <div className="lane-head">
                        <strong>{lane.label}</strong>
                        <div className="flow-compare-lane-meta">
                          <span className="lane-kind">{lane.kind}</span>
                          {eventCountChanged ? <span className="status-pill warning">{eventCountDiffLabel}</span> : null}
                        </div>
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

      <div className="flow-compare-context">
        <section className="runtime-flow-card">
          <strong>{whyDiffersLabel}</strong>
          <div className="trace-list">
            {reasonLines.map((line) => (
              <div className="trace-item info" key={line}>
                <p>{line}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="runtime-flow-card">
          <strong>{inspectCodeLabel}</strong>
          <div className="trace-list">
            {referenceCards.map((card) => (
              <div className={card.isPrimary ? "trace-item success flow-reference-card" : "trace-item info flow-reference-card"} key={card.reference}>
                <div className="flow-reference-head">
                  <strong>{card.isPrimary ? primarySurfaceLabel : supportingSurfaceLabel}</strong>
                  <span className={card.isPrimary ? "status-pill success" : "status-pill neutral"}>
                    {card.isPrimary ? primarySurfaceLabel : supportingSurfaceLabel}
                  </span>
                </div>
                <p>{card.note}</p>
                <div className="flow-reference-focus">
                  <span className="status-pill neutral">{classFocusLabel} {card.classFocus}</span>
                  <span className="status-pill info">{methodFocusLabel} {card.methodFocus}</span>
                  <span className="status-pill warning">{docFocusLabel} {card.docFocus}</span>
                </div>
                <p><code>{card.reference}</code></p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
