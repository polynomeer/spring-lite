import type { LabTrace } from "../../lib/types";

interface TraceSnapshotPanelProps {
  trace: LabTrace;
}

export function TraceSnapshotPanel({ trace }: TraceSnapshotPanelProps) {
  return (
    <article className="trace-panel">
      <p className="eyebrow">Snapshot</p>
      <div className="snapshot-stack">
        <div className="snapshot-card">
          <span>Watch</span>
          <p>{trace.snapshot.watch}</p>
        </div>
        <div className="snapshot-card">
          <span>Why</span>
          <p>{trace.snapshot.why}</p>
        </div>
        <div className="snapshot-card">
          <span>Next</span>
          <p>{trace.snapshot.next}</p>
        </div>
      </div>
    </article>
  );
}
