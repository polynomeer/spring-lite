import type { LabTrace } from "../../lib/types";

interface TraceLanesPanelProps {
  trace: LabTrace;
}

export function TraceLanesPanel({ trace }: TraceLanesPanelProps) {
  return (
    <article className="trace-panel">
      <p className="eyebrow">Lanes</p>
      <div className="trace-list">
        {trace.lanes.map((lane) => (
          <div className="lane-card" key={lane.id}>
            <strong>{lane.label}</strong>
            <p>{lane.detail}</p>
            <div className="chip-row">
              {lane.events.map((laneEvent) => (
                <span className="chip" key={laneEvent.id}>
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
