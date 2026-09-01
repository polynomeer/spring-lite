import type { DualRuntimeTraceState } from "../../hooks/useDualRuntimeTrace";

export function DualRuntimePanel({ scenario, state }: { scenario: string; state: DualRuntimeTraceState }) {
  const runtimes = [
    { label: "Spring Lite", trace: state.springLite, error: state.springLiteError, tone: "live" },
    { label: "Spring Boot", trace: state.springBoot, error: state.springBootError, tone: "static" }
  ];

  return (
    <article className="trace-panel dual-runtime-panel">
      <div className="trace-head"><div><p className="eyebrow">dual runtime</p><h3>Live {scenario.toUpperCase()} comparison</h3></div></div>
      <p role="status" aria-atomic="true" className="mode-note">
        {state.loading ? "Running both runtime endpoints..." : "Each column is an independently observed server response."}
      </p>
      <div className="dual-runtime-grid">
        {runtimes.map((runtime) => (
          <section className={`dual-runtime-card ${runtime.tone}`} key={runtime.label}>
            <strong>{runtime.label}</strong>
            {runtime.error ? <p className="field-error" role="alert">{runtime.error}</p> : null}
            {runtime.trace ? runtime.trace.metrics.slice(0, 3).map((metric) => (
              <div className="dual-runtime-metric" key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></div>
            )) : !runtime.error ? <p className="mode-note">{state.loading ? "Awaiting response" : "Not run"}</p> : null}
          </section>
        ))}
      </div>
    </article>
  );
}
