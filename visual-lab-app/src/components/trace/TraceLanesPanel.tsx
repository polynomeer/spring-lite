import type { Locale } from "../../lib/i18n";
import type { LabTrace } from "../../lib/types";

interface TraceLanesPanelProps {
  lanesLabel: string;
  locale: Locale;
  trace: LabTrace;
}

export function TraceLanesPanel({ trace, lanesLabel }: TraceLanesPanelProps) {
  return (
    <article className="trace-panel">
      <p className="eyebrow">{lanesLabel}</p>
      <div className="trace-list">
        {trace.lanes.map((lane) => (
          <div className={`lane-card lane-${lane.kind}`} key={lane.id}>
            <div className="lane-head">
              <strong>{lane.label}</strong>
              <span className="lane-kind">{lane.kind}</span>
            </div>
            <p>{lane.detail}</p>
            <div className="lane-events">
              {lane.events.map((laneEvent) => (
                <span className={`lane-event ${laneEvent.kind}`} key={laneEvent.id}>
                  {laneEvent.text}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
