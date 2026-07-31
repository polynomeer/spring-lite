import type { TraceAdapterResult } from "../../features/types";
import type { Locale } from "../../lib/i18n";
import type { LabTrace } from "../../lib/types";
import { TraceInsightPanel } from "./TraceInsightPanel";
import { TraceLanesPanel } from "./TraceLanesPanel";
import { TraceMetricsPanel } from "./TraceMetricsPanel";
import { TraceReferencesPanel } from "./TraceReferencesPanel";
import { TraceSnapshotPanel } from "./TraceSnapshotPanel";
import { TraceStepsPanel } from "./TraceStepsPanel";

interface TracePreviewProps {
  locale: Locale;
  labels: {
    loadedTrace: string;
    featureAdapter: string;
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
  return (
    <div
      className={loading ? "trace-preview-grid is-loading" : "trace-preview-grid"}
      data-run-sequence={runSequence}
      data-trace-mode={trace.mode}
      data-trace-scenario={trace.scenario}
      key={`${trace.id}:${runSequence}`}
    >
      <TraceMetricsPanel trace={trace} locale={locale} loadedTraceLabel={labels.loadedTrace} />
      {insight ? <TraceInsightPanel insight={insight} trace={trace} locale={locale} featureAdapterLabel={labels.featureAdapter} /> : null}
      <TraceSnapshotPanel trace={trace} locale={locale} snapshotLabel={labels.snapshot} watchLabel={labels.watch} whyLabel={labels.why} nextLabel={labels.nextLabel} />
      <TraceStepsPanel trace={trace} locale={locale} stepsLabel={labels.steps} />
      <TraceLanesPanel trace={trace} locale={locale} lanesLabel={labels.lanes} />
      <TraceReferencesPanel trace={trace} locale={locale} referencesLabel={labels.references} relatedFilesLabel={labels.relatedFiles} refsLabel={labels.refs} />
    </div>
  );
}
