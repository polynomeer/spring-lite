import type { LabTrace } from "../../lib/types";

interface TraceSnapshotPanelProps {
  trace: LabTrace;
}

export function TraceSnapshotPanel({ trace }: TraceSnapshotPanelProps) {
  return (
    <article className="trace-panel">
      <p className="eyebrow">Snapshot</p>
      <div className="detail-list">
        <div>
          <span>Watch</span>
          <p>{trace.snapshot.watch}</p>
        </div>
        <div>
          <span>Why</span>
          <p>{trace.snapshot.why}</p>
        </div>
        <div>
          <span>Next</span>
          <p>{trace.snapshot.next}</p>
        </div>
      </div>
    </article>
  );
}
