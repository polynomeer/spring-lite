import { useEffect, useState } from "react";
import type { TraceAdapterResult } from "../../features/types";
import type { Locale } from "../../lib/i18n";
import type { LabTrace } from "../../lib/types";
import { TraceComparisonDiffPanel } from "./TraceComparisonDiffPanel";
import { TraceExecutionPathPanel } from "./TraceExecutionPathPanel";
import { TraceFlowComparePanel } from "./TraceFlowComparePanel";
import { TraceInsightPanel } from "./TraceInsightPanel";
import { TraceLanesPanel } from "./TraceLanesPanel";
import { TraceMetricsPanel } from "./TraceMetricsPanel";
import { TraceRuntimeFlowDiffPanel } from "./TraceRuntimeFlowDiffPanel";
import { TraceRuntimeDiffPanel } from "./TraceRuntimeDiffPanel";
import { TraceReferencesPanel } from "./TraceReferencesPanel";
import { TraceSnapshotPanel } from "./TraceSnapshotPanel";
import { TraceStateTransitionPanel } from "./TraceStateTransitionPanel";
import { TraceStepsPanel } from "./TraceStepsPanel";

interface TracePreviewProps {
  locale: Locale;
  labels: {
    loadedTrace: string;
    featureAdapter: string;
    executionPath: string;
    activePath: string;
    alternatePath: string;
    comparisonDiff: string;
    stateTransition: string;
    primaryLifecycle: string;
    sideEffects: string;
    overview: string;
    flowView: string;
    flowSource: string;
    focusCurrentRun: string;
    focusStaticBaseline: string;
    focusSplitCompare: string;
    flowCompareStepShapeDiff: string;
    flowCompareTitleDiff: string;
    flowCompareMarkerDiff: string;
    flowCompareDetailDiff: string;
    flowCompareEventCountDiff: string;
    flowCompareWhyDiffers: string;
    flowCompareInspectCode: string;
    flowCompareBriefing: string;
    flowCompareFocusRail: string;
    flowComparePrimarySurface: string;
    flowCompareSupportingSurface: string;
    flowCompareClassFocus: string;
    flowCompareMethodFocus: string;
    flowCompareDocFocus: string;
    flowCompareTestFocus: string;
    flowCompareTestMethodFocus: string;
    flowCompareAssertionFocus: string;
    flowCompareChecklist: string;
    flowCompareSequence: string;
    flowCompareDifferences: string;
    flowCompareCodeSurfaces: string;
    flowCompareAligned: string;
    flowCompareLaneCountSuffix: string;
    flowCompareDetails: string;
    flowCompareReasonCountSuffix: string;
    flowCompareSurfaceCountSuffix: string;
    flowCompareReasonShape: string;
    flowCompareReasonRuntime: string;
    flowCompareReasonStatic: string;
    flowTimeline: string;
    replayControls: string;
    replayPlay: string;
    replayPause: string;
    replayPrevious: string;
    replayNext: string;
    replayAuto: string;
    replayManual: string;
    selectedStep: string;
    relatedLanes: string;
    deepLinks: string;
    steps: string;
    lanes: string;
    snapshot: string;
    references: string;
    relatedFiles: string;
    refs: string;
    sharedCore: string;
    liteSide: string;
    springSide: string;
    watch: string;
    why: string;
    nextLabel: string;
    runtimeDiff: string;
    runtimeDiffSubtitle: string;
    runtimeFlowDiff: string;
    runtimeFlowDiffSubtitle: string;
    runtimeSharedSpine: string;
    runtimeLiveOnly: string;
    runtimeStaticOnly: string;
    runtimeLaneCoverage: string;
    staticBaseline: string;
    liveObserved: string;
  };
  trace: LabTrace;
  baselineTrace?: LabTrace;
  insight: TraceAdapterResult | null;
  runtimeDiffRows?: Array<{
    label: string;
    staticValue: string;
    liveValue: string;
    detail: string;
    changed: boolean;
  }>;
  runtimeFlowDiff?: {
    sharedSteps: string[];
    liveOnlySteps: string[];
    staticOnlySteps: string[];
    laneRows: Array<{
      lane: string;
      staticCount: number;
      liveCount: number;
      note: string;
      changed: boolean;
    }>;
  };
  runSequence: number;
  loading: boolean;
}

export function TracePreview({ trace, baselineTrace, insight, runtimeDiffRows, runtimeFlowDiff, runSequence, loading, locale, labels }: TracePreviewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "flow" | "references">("overview");
  const [flowSource, setFlowSource] = useState<"live" | "static" | "split">("live");
  const [activeStepId, setActiveStepId] = useState<string>(trace.steps[0]?.id ?? "");
  const [isReplaying, setIsReplaying] = useState(false);
  const [compareIndex, setCompareIndex] = useState(0);
  const flowTrace = flowSource === "static" && baselineTrace ? baselineTrace : trace;
  const replayLength = flowSource === "split" && baselineTrace
    ? Math.max(trace.steps.length, baselineTrace.steps.length)
    : flowTrace.steps.length;

  useEffect(() => {
    setActiveTab("overview");
    setFlowSource("live");
    setActiveStepId(trace.steps[0]?.id ?? "");
    setIsReplaying(false);
    setCompareIndex(0);
  }, [trace.id, runSequence]);

  useEffect(() => {
    if (flowSource === "split") {
      setCompareIndex(0);
      setIsReplaying(false);
      return;
    }
    setActiveStepId(flowTrace.steps[0]?.id ?? "");
    setIsReplaying(false);
  }, [flowSource, flowTrace.id]);

  useEffect(() => {
    if (!isReplaying || replayLength <= 1) {
      return;
    }

    if (flowSource === "split") {
      const timer = window.setTimeout(() => {
        setCompareIndex((current) => {
          if (current >= replayLength - 1) {
            setIsReplaying(false);
            return current;
          }
          return current + 1;
        });
      }, 1200);
      return () => window.clearTimeout(timer);
    }

    const currentIndex = flowTrace.steps.findIndex((step) => step.id === activeStepId);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const timer = window.setTimeout(() => {
      if (safeIndex >= flowTrace.steps.length - 1) {
        setIsReplaying(false);
        return;
      }
      setActiveStepId(flowTrace.steps[safeIndex + 1]?.id ?? flowTrace.steps[safeIndex].id);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [activeStepId, flowSource, flowTrace.steps, isReplaying, replayLength]);

  function selectStep(stepId: string) {
    setIsReplaying(false);
    setActiveStepId(stepId);
  }

  function moveReplay(offset: -1 | 1) {
    if (flowSource === "split" && baselineTrace) {
      const nextIndex = Math.min(replayLength - 1, Math.max(0, compareIndex + offset));
      setIsReplaying(false);
      setCompareIndex(nextIndex);
      return;
    }
    const currentIndex = flowTrace.steps.findIndex((step) => step.id === activeStepId);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = Math.min(flowTrace.steps.length - 1, Math.max(0, safeIndex + offset));
    setIsReplaying(false);
    setActiveStepId(flowTrace.steps[nextIndex]?.id ?? flowTrace.steps[0]?.id ?? "");
  }

  function toggleReplay() {
    if (replayLength <= 1) {
      return;
    }

    if (flowSource === "split" && baselineTrace) {
      if (compareIndex >= replayLength - 1) {
        setCompareIndex(0);
        setIsReplaying(true);
        return;
      }
      setIsReplaying((current) => !current);
      return;
    }

    const currentIndex = flowTrace.steps.findIndex((step) => step.id === activeStepId);
    if (currentIndex >= flowTrace.steps.length - 1) {
      setActiveStepId(flowTrace.steps[0]?.id ?? "");
      setIsReplaying(true);
      return;
    }

    setIsReplaying((current) => !current);
  }

  return (
    <section className="trace-workspace" key={`${trace.id}:${runSequence}`}>
      <div className="trace-tab-row" role="tablist" aria-label={labels.loadedTrace}>
        <button
          className={activeTab === "overview" ? "trace-tab active" : "trace-tab"}
          type="button"
          role="tab"
          aria-selected={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        >
          {labels.overview}
        </button>
        <button
          className={activeTab === "flow" ? "trace-tab active" : "trace-tab"}
          type="button"
          role="tab"
          aria-selected={activeTab === "flow"}
          onClick={() => setActiveTab("flow")}
        >
          {labels.flowView}
        </button>
        <button
          className={activeTab === "references" ? "trace-tab active" : "trace-tab"}
          type="button"
          role="tab"
          aria-selected={activeTab === "references"}
          onClick={() => setActiveTab("references")}
        >
          {labels.deepLinks}
        </button>
      </div>

      <div
        className={loading ? "trace-preview-grid is-loading" : "trace-preview-grid"}
        data-run-sequence={runSequence}
        data-trace-mode={trace.mode}
        data-trace-scenario={trace.scenario}
      >
        {activeTab === "overview" ? (
          <>
            {insight?.executionPath ? (
              <TraceExecutionPathPanel
                diagram={insight.executionPath}
                executionPathLabel={labels.executionPath}
                activePathLabel={labels.activePath}
                alternatePathLabel={labels.alternatePath}
              />
            ) : null}
            {insight?.stateTransition ? (
              <TraceStateTransitionPanel
                diagram={insight.stateTransition}
                stateTransitionLabel={labels.stateTransition}
                primaryLifecycleLabel={labels.primaryLifecycle}
                sideEffectLabel={labels.sideEffects}
              />
            ) : null}
            {insight?.comparisonDiff ? (
              <TraceComparisonDiffPanel
                diagram={insight.comparisonDiff}
                comparisonDiffLabel={labels.comparisonDiff}
                sharedCoreLabel={labels.sharedCore}
                liteSideLabel={labels.liteSide}
                springSideLabel={labels.springSide}
              />
            ) : null}
            {runtimeDiffRows && runtimeDiffRows.length > 0 ? (
              <TraceRuntimeDiffPanel
                title={labels.runtimeDiff}
                subtitle={labels.runtimeDiffSubtitle}
                staticLabel={labels.staticBaseline}
                liveLabel={labels.liveObserved}
                rows={runtimeDiffRows}
              />
            ) : null}
            {runtimeFlowDiff ? (
              <TraceRuntimeFlowDiffPanel
                title={labels.runtimeFlowDiff}
                subtitle={labels.runtimeFlowDiffSubtitle}
                sharedLabel={labels.runtimeSharedSpine}
                liveOnlyLabel={labels.runtimeLiveOnly}
                staticOnlyLabel={labels.runtimeStaticOnly}
                laneLabel={labels.runtimeLaneCoverage}
                sharedSteps={runtimeFlowDiff.sharedSteps}
                liveOnlySteps={runtimeFlowDiff.liveOnlySteps}
                staticOnlySteps={runtimeFlowDiff.staticOnlySteps}
                laneRows={runtimeFlowDiff.laneRows}
              />
            ) : null}
            <TraceMetricsPanel trace={trace} locale={locale} loadedTraceLabel={labels.loadedTrace} />
            {insight ? <TraceInsightPanel insight={insight} trace={trace} locale={locale} featureAdapterLabel={labels.featureAdapter} /> : null}
            <TraceSnapshotPanel trace={trace} locale={locale} snapshotLabel={labels.snapshot} watchLabel={labels.watch} whyLabel={labels.why} nextLabel={labels.nextLabel} />
          </>
        ) : null}

        {activeTab === "flow" ? (
          <>
            {baselineTrace ? (
              <article className="trace-panel flow-source-panel">
                <div className="trace-head">
                  <div>
                    <p className="eyebrow">{labels.flowView}</p>
                    <h3>{labels.flowSource}</h3>
                  </div>
                  <span className={flowSource === "live" ? "status-pill info" : "status-pill neutral"}>
                    {flowSource === "live" ? labels.focusCurrentRun : labels.focusStaticBaseline}
                  </span>
                </div>
                <div className="flow-source-toggle">
                  <button
                    className={flowSource === "live" ? "filter-chip active" : "filter-chip"}
                    type="button"
                    onClick={() => setFlowSource("live")}
                  >
                    {labels.focusCurrentRun}
                  </button>
                  <button
                    className={flowSource === "static" ? "filter-chip active" : "filter-chip"}
                    type="button"
                    onClick={() => setFlowSource("static")}
                  >
                    {labels.focusStaticBaseline}
                  </button>
                  <button
                    className={flowSource === "split" ? "filter-chip active" : "filter-chip"}
                    type="button"
                    onClick={() => setFlowSource("split")}
                  >
                    {labels.focusSplitCompare}
                  </button>
                </div>
              </article>
            ) : null}
            {flowSource === "split" && baselineTrace ? (
              <TraceFlowComparePanel
                locale={locale}
                title={labels.flowTimeline}
                currentRunLabel={labels.focusCurrentRun}
                staticBaselineLabel={labels.focusStaticBaseline}
                selectedStepLabel={labels.selectedStep}
                relatedLanesLabel={labels.relatedLanes}
                stepShapeDiffLabel={labels.flowCompareStepShapeDiff}
                titleDiffLabel={labels.flowCompareTitleDiff}
                markerDiffLabel={labels.flowCompareMarkerDiff}
                detailDiffLabel={labels.flowCompareDetailDiff}
                eventCountDiffLabel={labels.flowCompareEventCountDiff}
                whyDiffersLabel={labels.flowCompareWhyDiffers}
                inspectCodeLabel={labels.flowCompareInspectCode}
                briefingLabel={labels.flowCompareBriefing}
                focusRailLabel={labels.flowCompareFocusRail}
                primarySurfaceLabel={labels.flowComparePrimarySurface}
                supportingSurfaceLabel={labels.flowCompareSupportingSurface}
                classFocusLabel={labels.flowCompareClassFocus}
                methodFocusLabel={labels.flowCompareMethodFocus}
                docFocusLabel={labels.flowCompareDocFocus}
                testFocusLabel={labels.flowCompareTestFocus}
                testMethodFocusLabel={labels.flowCompareTestMethodFocus}
                assertionFocusLabel={labels.flowCompareAssertionFocus}
                checklistLabel={labels.flowCompareChecklist}
                sequenceLabel={labels.flowCompareSequence}
                watchLabel={labels.watch}
                whyLabel={labels.why}
                nextLabel={labels.nextLabel}
                differencesLabel={labels.flowCompareDifferences}
                codeSurfacesLabel={labels.flowCompareCodeSurfaces}
                alignedLabel={labels.flowCompareAligned}
                laneCountSuffix={labels.flowCompareLaneCountSuffix}
                detailsLabel={labels.flowCompareDetails}
                reasonCountSuffix={labels.flowCompareReasonCountSuffix}
                surfaceCountSuffix={labels.flowCompareSurfaceCountSuffix}
                reasonShapeLabel={labels.flowCompareReasonShape}
                reasonRuntimeLabel={labels.flowCompareReasonRuntime}
                reasonStaticLabel={labels.flowCompareReasonStatic}
                liveTrace={trace}
                staticTrace={baselineTrace}
                activeIndex={compareIndex}
              />
            ) : (
              <>
                <TraceStepsPanel
                  trace={flowTrace}
                  locale={locale}
                  stepsLabel={labels.steps}
                  flowTimelineLabel={labels.flowTimeline}
                  replayControlsLabel={labels.replayControls}
                  replayPlayLabel={labels.replayPlay}
                  replayPauseLabel={labels.replayPause}
                  replayPreviousLabel={labels.replayPrevious}
                  replayNextLabel={labels.replayNext}
                  replayAutoLabel={labels.replayAuto}
                  replayManualLabel={labels.replayManual}
                  selectedStepLabel={labels.selectedStep}
                  activeStepId={activeStepId}
                  isReplaying={isReplaying}
                  onSelectStep={selectStep}
                  onToggleReplay={toggleReplay}
                  onReplayPrevious={() => moveReplay(-1)}
                  onReplayNext={() => moveReplay(1)}
                />
                <TraceLanesPanel
                  trace={flowTrace}
                  locale={locale}
                  lanesLabel={labels.lanes}
                  relatedLanesLabel={labels.relatedLanes}
                  activeStepId={activeStepId}
                />
              </>
            )}
          </>
        ) : null}

        {activeTab === "references" ? (
          <TraceReferencesPanel trace={trace} locale={locale} referencesLabel={labels.references} relatedFilesLabel={labels.relatedFiles} refsLabel={labels.refs} />
        ) : null}
      </div>
    </section>
  );
}
