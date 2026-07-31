import type { Locale } from "../../lib/i18n";
import type { LabTrace } from "../../lib/types";

interface TraceSnapshotPanelProps {
  locale: Locale;
  snapshotLabel: string;
  watchLabel: string;
  whyLabel: string;
  nextLabel: string;
  trace: LabTrace;
}

export function TraceSnapshotPanel({ trace, snapshotLabel, watchLabel, whyLabel, nextLabel }: TraceSnapshotPanelProps) {
  return (
    <article className="trace-panel">
      <p className="eyebrow">{snapshotLabel}</p>
      <div className="snapshot-stack">
        <div className="snapshot-card">
          <span>{watchLabel}</span>
          <p>{trace.snapshot.watch}</p>
        </div>
        <div className="snapshot-card">
          <span>{whyLabel}</span>
          <p>{trace.snapshot.why}</p>
        </div>
        <div className="snapshot-card">
          <span>{nextLabel}</span>
          <p>{trace.snapshot.next}</p>
        </div>
      </div>
    </article>
  );
}
