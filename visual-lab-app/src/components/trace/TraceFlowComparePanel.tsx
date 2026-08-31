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
  briefingLabel: string;
  focusRailLabel: string;
  detailsLabel: string;
  primarySurfaceLabel: string;
  supportingSurfaceLabel: string;
  classFocusLabel: string;
  methodFocusLabel: string;
  docFocusLabel: string;
  testFocusLabel: string;
  testMethodFocusLabel: string;
  assertionFocusLabel: string;
  checklistLabel: string;
  sequenceLabel: string;
  watchLabel: string;
  whyLabel: string;
  nextLabel: string;
  differencesLabel: string;
  codeSurfacesLabel: string;
  alignedLabel: string;
  laneCountSuffix: string;
  relatedLaneCountLabel: string;
  otherLaneCountLabel: string;
  otherLanesLabel: string;
  changedLaneCountLabel: string;
  reasonCountSuffix: string;
  surfaceCountSuffix: string;
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
  briefingLabel,
  focusRailLabel,
  detailsLabel,
  primarySurfaceLabel,
  supportingSurfaceLabel,
  classFocusLabel,
  methodFocusLabel,
  docFocusLabel,
  testFocusLabel,
  testMethodFocusLabel,
  assertionFocusLabel,
  checklistLabel,
  sequenceLabel,
  watchLabel,
  whyLabel,
  nextLabel,
  differencesLabel,
  codeSurfacesLabel,
  alignedLabel,
  laneCountSuffix,
  relatedLaneCountLabel,
  otherLaneCountLabel,
  otherLanesLabel,
  changedLaneCountLabel,
  reasonCountSuffix,
  surfaceCountSuffix,
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
      docFocus: resolvedFocus.docFocus,
      testFocus: resolvedFocus.testFocus,
      testMethodFocus: resolvedFocus.testMethodFocus,
      assertionFocus: locale === "ko" ? resolvedFocus.assertionFocusKo : resolvedFocus.assertionFocusEn,
      checklist: locale === "ko" ? resolvedFocus.checklistKo : resolvedFocus.checklistEn
    };
  });
  const primaryCard = referenceCards.find((card) => card.isPrimary) ?? referenceCards[0] ?? null;
  const briefingNext = primaryCard
    ? `${classFocusLabel} ${primaryCard.classFocus} -> ${methodFocusLabel} ${primaryCard.methodFocus}`
    : liveTrace.snapshot.next;
  const briefingWhy = reasonLines[0] ?? liveTrace.snapshot.why;
  const differenceBadges = [
    stepDiff.missingOnOneSide ? stepShapeDiffLabel : null,
    stepDiff.titleChanged ? titleDiffLabel : null,
    stepDiff.markerChanged ? markerDiffLabel : null,
    stepDiff.detailChanged ? detailDiffLabel : null
  ].filter((item): item is string => Boolean(item));

  return (
    <article className="trace-panel flow-compare-panel">
      <div className="trace-head">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{relatedLanesLabel}</h3>
        </div>
      </div>

      <section className="flow-compare-briefing">
        <div className="flow-reference-checklist-head">
          <strong>{briefingLabel}</strong>
          {live.step ? <span className="status-pill info">{live.step.marker}</span> : null}
        </div>
        <div className="metric-mini-grid">
          <div className="metric-mini">
            <span>{watchLabel}</span>
            <strong>{liveTrace.snapshot.watch}</strong>
          </div>
          <div className="metric-mini">
            <span>{whyLabel}</span>
            <strong>{briefingWhy}</strong>
          </div>
          <div className="metric-mini">
            <span>{nextLabel}</span>
            <strong>{briefingNext}</strong>
          </div>
        </div>
      </section>

      <section className="flow-compare-focus-rail">
        <div className="flow-reference-checklist-head">
          <strong>{focusRailLabel}</strong>
          <span className="status-pill neutral">
            {selectedStepLabel} {String(live.index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="metric-mini-grid flow-compare-focus-grid">
          <div className="metric-mini flow-compare-focus-card">
            <span>{selectedStepLabel}</span>
            <strong>{live.step?.title ?? baseline.step?.title ?? "-"}</strong>
            <p>{live.step?.marker ?? baseline.step?.marker ?? "-"}</p>
          </div>
          <div className="metric-mini flow-compare-focus-card">
            <span>{differencesLabel}</span>
            <strong>{differenceBadges.length === 0 ? "0" : String(differenceBadges.length).padStart(2, "0")}</strong>
            <div className="lane-focus-summary">
              {differenceBadges.length === 0 ? (
                <span className="status-pill success">{alignedLabel}</span>
              ) : (
                differenceBadges.map((badge) => <span className="status-pill warning" key={badge}>{badge}</span>)
              )}
            </div>
          </div>
          <div className="metric-mini flow-compare-focus-card">
            <span>{relatedLanesLabel}</span>
            <strong>{activeKinds.length === 0 ? "-" : activeKinds.join(" / ")}</strong>
            <p>{activeKinds.length === 0 ? "-" : `${activeKinds.length} ${laneCountSuffix}`}</p>
          </div>
          <div className="metric-mini flow-compare-focus-card">
            <span>{codeSurfacesLabel}</span>
            <strong>{String(referenceCards.length).padStart(2, "0")}</strong>
            <p>{primaryCard?.classFocus ?? "-"}</p>
          </div>
        </div>
      </section>

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
          const columnTone = column.label === currentRunLabel ? "live" : "static";
          const sortedLanes = [...column.trace.lanes].sort((left, right) => {
            const leftRelated = isLaneRelatedToStep(left, column.step);
            const rightRelated = isLaneRelatedToStep(right, column.step);

            if (leftRelated === rightRelated) {
              return left.label.localeCompare(right.label);
            }

            return leftRelated ? -1 : 1;
          });
          const relatedLaneCount = sortedLanes.filter((lane) => isLaneRelatedToStep(lane, column.step)).length;
          const otherLaneCount = sortedLanes.length - relatedLaneCount;
          const relatedLanes = sortedLanes.filter((lane) => isLaneRelatedToStep(lane, column.step));
          const otherLanes = sortedLanes
            .filter((lane) => !isLaneRelatedToStep(lane, column.step))
            .map((lane) => {
              const counterpartLane = counterpartTrace.lanes.find((item) => item.kind === lane.kind);
              return {
                lane,
                eventCountChanged: (counterpartLane?.events.length ?? 0) !== lane.events.length
              };
            })
            .sort((left, right) => {
              if (left.eventCountChanged === right.eventCountChanged) {
                return left.lane.label.localeCompare(right.lane.label);
              }

              return left.eventCountChanged ? -1 : 1;
            });
          const changedOtherLaneCount = otherLanes.filter((item) => item.eventCountChanged).length;
          return (
            <section className={`flow-compare-column ${columnTone}`} key={column.label}>
              <div className="flow-compare-head">
                <span className={columnTone === "live" ? "status-pill success" : "status-pill neutral"}>{column.label}</span>
                {column.step ? <span className="tag">{column.step.marker}</span> : null}
                {stepDiff.missingOnOneSide ? <span className="status-pill warning">{stepShapeDiffLabel}</span> : null}
              </div>

              <div className={`trace-item trace-step focus-step ${columnTone}`}>
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
                <span className={columnTone === "live" ? "status-pill success" : "status-pill neutral"}>
                  {columnTone === "live" ? currentRunLabel : staticBaselineLabel}
                </span>
                {relatedKinds.map((kind) => (
                  <span className={columnTone === "live" ? "status-pill info" : "status-pill neutral"} key={`${column.label}-${kind}`}>{kind}</span>
                ))}
                <span className="status-pill neutral">{relatedLaneCountLabel} {relatedLaneCount}</span>
                {otherLaneCount > 0 ? <span className="status-pill neutral">{otherLaneCountLabel} {otherLaneCount}</span> : null}
              </div>

              <div className="trace-list">
                {relatedLanes.map((lane) => {
                  const isRelated = isLaneRelatedToStep(lane, column.step);
                  const counterpartLane = counterpartTrace.lanes.find((item) => item.kind === lane.kind);
                  const eventCountChanged = (counterpartLane?.events.length ?? 0) !== lane.events.length;
                  return (
                    <div className={isRelated ? `lane-card lane-${lane.kind} active ${columnTone}` : `lane-card lane-${lane.kind} subdued`} key={`${column.label}-${lane.id}`}>
                      <div className="lane-head">
                        <strong>{lane.label}</strong>
                        <div className="flow-compare-lane-meta">
                          <span className="lane-kind">{lane.kind}</span>
                          {isRelated ? <span className={columnTone === "live" ? "status-pill success" : "status-pill neutral"}>{selectedStepLabel}</span> : null}
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
                {otherLanes.length > 0 ? (
                  <details className="lane-card flow-compare-lane-disclosure">
                    <summary className="flow-compare-disclosure-summary">
                      <div className="flow-compare-disclosure-copy">
                        <strong>{otherLanesLabel}</strong>
                        <p>{otherLanes.slice(0, 3).map((item) => item.lane.label).join(", ")}</p>
                      </div>
                      <div className="lane-focus-summary">
                        {changedOtherLaneCount > 0 ? <span className="status-pill warning">{changedLaneCountLabel} {changedOtherLaneCount}</span> : null}
                        <span className="status-pill neutral">{otherLaneCountLabel} {otherLaneCount}</span>
                        <span className="status-pill neutral">{detailsLabel}</span>
                      </div>
                    </summary>
                    <div className="trace-list">
                      {otherLanes.map(({ lane, eventCountChanged }) => {
                        return (
                          <div className="lane-card subdued" key={`${column.label}-${lane.id}`}>
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
                                <div className={`lane-stop ${laneEvent.kind}`} key={`${column.label}-${laneEvent.id}`}>
                                  <span className="lane-stop-index">{String(eventIndex + 1).padStart(2, "0")}</span>
                                  <span className={`lane-event ${laneEvent.kind}`}>{laneEvent.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      <div className="flow-compare-context">
        <details className="runtime-flow-card flow-compare-disclosure" open>
          <summary className="flow-compare-disclosure-summary">
            <div className="flow-compare-disclosure-copy">
              <strong>{whyDiffersLabel}</strong>
              <p>{reasonLines[0] ?? briefingWhy}</p>
            </div>
            <div className="lane-focus-summary">
              <span className="status-pill info">{reasonLines.length} {reasonCountSuffix}</span>
              <span className="status-pill neutral">{detailsLabel}</span>
            </div>
          </summary>
          <div className="trace-list">
            {reasonLines.map((line) => (
              <div className="trace-item info" key={line}>
                <p>{line}</p>
              </div>
            ))}
          </div>
        </details>

        <details className="runtime-flow-card flow-compare-disclosure">
          <summary className="flow-compare-disclosure-summary">
            <div className="flow-compare-disclosure-copy">
              <strong>{inspectCodeLabel}</strong>
              <p>{primaryCard ? `${primaryCard.classFocus} / ${primaryCard.methodFocus}` : "-"}</p>
            </div>
            <div className="lane-focus-summary">
              <span className="status-pill success">{referenceCards.length} {surfaceCountSuffix}</span>
              <span className="status-pill neutral">{detailsLabel}</span>
            </div>
          </summary>
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
                  <span className="status-pill success">{testFocusLabel} {card.testFocus}</span>
                  <span className="status-pill neutral">{testMethodFocusLabel} {card.testMethodFocus}</span>
                </div>
                <p>{assertionFocusLabel} {card.assertionFocus}</p>
                <div className="flow-reference-checklist">
                  <div className="flow-reference-checklist-head">
                    <strong>{checklistLabel}</strong>
                    <span className="status-pill neutral">{sequenceLabel} {card.checklist.length}</span>
                  </div>
                  <div className="flow-reference-checklist-steps">
                    {card.checklist.map((item, checklistIndex) => (
                      <div
                        className={checklistIndex === 0 ? "flow-reference-checklist-step active" : "flow-reference-checklist-step"}
                        key={`${card.reference}-${item}`}
                      >
                        <span className={checklistIndex === 0 ? "status-pill success" : "status-pill info"}>
                          {String(checklistIndex + 1).padStart(2, "0")}
                        </span>
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p><code>{card.reference}</code></p>
              </div>
            ))}
          </div>
        </details>
      </div>
    </article>
  );
}
