import { useEffect, useState } from "react";
import type { TraceAdapterResult } from "../../features/types";
import type { Locale } from "../../lib/i18n";
import type { LabTrace } from "../../lib/types";
import { TraceComparisonDiffPanel } from "./TraceComparisonDiffPanel";
import { TraceExecutionPathPanel } from "./TraceExecutionPathPanel";
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

export function TracePreview({ trace, insight, runtimeDiffRows, runtimeFlowDiff, runSequence, loading, locale, labels }: TracePreviewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "flow" | "references">("overview");
  const [activeStepId, setActiveStepId] = useState<string>(trace.steps[0]?.id ?? "");
  const [isReplaying, setIsReplaying] = useState(false);

  useEffect(() => {
    setActiveTab("overview");
    setActiveStepId(trace.steps[0]?.id ?? "");
    setIsReplaying(false);
  }, [trace.id, runSequence]);

  useEffect(() => {
    if (!isReplaying || trace.steps.length <= 1) {
      return;
    }

    const currentIndex = trace.steps.findIndex((step) => step.id === activeStepId);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const timer = window.setTimeout(() => {
      if (safeIndex >= trace.steps.length - 1) {
        setIsReplaying(false);
        return;
      }
      setActiveStepId(trace.steps[safeIndex + 1]?.id ?? trace.steps[safeIndex].id);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [activeStepId, isReplaying, trace.steps]);

  function selectStep(stepId: string) {
    setIsReplaying(false);
    setActiveStepId(stepId);
  }

  function moveReplay(offset: -1 | 1) {
    const currentIndex = trace.steps.findIndex((step) => step.id === activeStepId);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = Math.min(trace.steps.length - 1, Math.max(0, safeIndex + offset));
    setIsReplaying(false);
    setActiveStepId(trace.steps[nextIndex]?.id ?? trace.steps[0]?.id ?? "");
  }

  function toggleReplay() {
    if (trace.steps.length <= 1) {
      return;
    }

    const currentIndex = trace.steps.findIndex((step) => step.id === activeStepId);
    if (currentIndex >= trace.steps.length - 1) {
      setActiveStepId(trace.steps[0]?.id ?? "");
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
            <TraceStepsPanel
              trace={trace}
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
              trace={trace}
              locale={locale}
              lanesLabel={labels.lanes}
              relatedLanesLabel={labels.relatedLanes}
              activeStepId={activeStepId}
            />
          </>
        ) : null}

        {activeTab === "references" ? (
          <TraceReferencesPanel trace={trace} locale={locale} referencesLabel={labels.references} relatedFilesLabel={labels.relatedFiles} refsLabel={labels.refs} />
        ) : null}
      </div>
    </section>
  );
}
