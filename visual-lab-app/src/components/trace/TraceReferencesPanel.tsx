import type { Locale } from "../../lib/i18n";
import type { LabTrace } from "../../lib/types";

interface TraceReferencesPanelProps {
  locale: Locale;
  referencesLabel: string;
  relatedFilesLabel: string;
  refsLabel: string;
  trace: LabTrace;
}

export function TraceReferencesPanel({ trace, referencesLabel, relatedFilesLabel, refsLabel }: TraceReferencesPanelProps) {
  return (
    <article className="trace-panel">
      <div className="trace-head">
        <div>
          <p className="eyebrow">{referencesLabel}</p>
          <h3>{relatedFilesLabel}</h3>
        </div>
        <span className="tag">{trace.references.length} {refsLabel}</span>
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
