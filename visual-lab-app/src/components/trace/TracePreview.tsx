import { useEffect, useState } from "react";
import type { TraceAdapterResult } from "../../features/types";
import type { Locale } from "../../lib/i18n";
import type { LabTrace } from "../../lib/types";
import { TraceExecutionPathPanel } from "./TraceExecutionPathPanel";
import { TraceInsightPanel } from "./TraceInsightPanel";
import { TraceLanesPanel } from "./TraceLanesPanel";
import { TraceMetricsPanel } from "./TraceMetricsPanel";
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
    stateTransition: string;
    primaryLifecycle: string;
    sideEffects: string;
    overview: string;
    flowView: string;
    flowTimeline: string;
    selectedStep: string;
    relatedLanes: string;
    deepLinks: string;
    steps: string;
    lanes: string;
    snapshot: string;
    references: string;
    relatedFiles: string;
    refs: string;
    watch: string;
    why: string;
    nextLabel: string;
  };
  trace: LabTrace;
  insight: TraceAdapterResult | null;
  runSequence: number;
  loading: boolean;
}

export function TracePreview({ trace, insight, runSequence, loading, locale, labels }: TracePreviewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "flow" | "references">("overview");
  const [activeStepId, setActiveStepId] = useState<string>(trace.steps[0]?.id ?? "");

  useEffect(() => {
    setActiveTab("overview");
    setActiveStepId(trace.steps[0]?.id ?? "");
  }, [trace.id, runSequence]);

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
              selectedStepLabel={labels.selectedStep}
              activeStepId={activeStepId}
              onSelectStep={setActiveStepId}
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
