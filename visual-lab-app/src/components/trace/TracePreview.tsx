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
}

export function TracePreview({ trace, insight }: TracePreviewProps) {
  return (
    <div className="trace-preview-grid">
      <TraceMetricsPanel trace={trace} />
      {insight ? <TraceInsightPanel insight={insight} /> : null}
      <TraceSnapshotPanel trace={trace} />
      <TraceStepsPanel trace={trace} />
      <TraceLanesPanel trace={trace} />
      <TraceReferencesPanel trace={trace} />
    </div>
  );
}
