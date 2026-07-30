import type { LabTrace } from "../../lib/types";

interface TraceReferencesPanelProps {
  trace: LabTrace;
}

export function TraceReferencesPanel({ trace }: TraceReferencesPanelProps) {
  return (
    <article className="trace-panel">
      <div className="trace-head">
        <div>
          <p className="eyebrow">References</p>
          <h3>Related Files</h3>
        </div>
        <span className="tag">{trace.references.length} refs</span>
      </div>
      <div className="trace-list">
        {trace.references.map((reference) => (
          <div className="trace-item info" key={reference}>
            <p><code>{reference}</code></p>
          </div>
        ))}
      </div>
    </article>
  );
}
