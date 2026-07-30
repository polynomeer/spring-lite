import type { TraceAdapterResult } from "../../features/types";
import type { LabTrace } from "../../lib/types";
import { TraceInsightPanel } from "./TraceInsightPanel";
import { TraceLanesPanel } from "./TraceLanesPanel";
import { TraceMetricsPanel } from "./TraceMetricsPanel";
import { TraceReferencesPanel } from "./TraceReferencesPanel";
import { TraceSnapshotPanel } from "./TraceSnapshotPanel";
import { TraceStepsPanel } from "./TraceStepsPanel";

interface TracePreviewProps {
  trace: LabTrace;
  insight: TraceAdapterResult | null;
  runSequence: number;
  loading: boolean;
}

export function TracePreview({ trace, insight, runSequence, loading }: TracePreviewProps) {
  return (
    <div
      className={loading ? "trace-preview-grid is-loading" : "trace-preview-grid"}
      data-run-sequence={runSequence}
      key={`${trace.id}:${runSequence}`}
    >
      <TraceMetricsPanel trace={trace} />
      {insight ? <TraceInsightPanel insight={insight} /> : null}
      <TraceSnapshotPanel trace={trace} />
      <TraceStepsPanel trace={trace} />
      <TraceLanesPanel trace={trace} />
      <TraceReferencesPanel trace={trace} />
    </div>
  );
}
