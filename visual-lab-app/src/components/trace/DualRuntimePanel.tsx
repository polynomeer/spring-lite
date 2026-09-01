import type { DualRuntimeTraceState } from "../../hooks/useDualRuntimeTrace";
import type { LabTrace } from "../../lib/types";

function sharedMetricRows(springLite: LabTrace, springBoot: LabTrace) {
  const liteMetrics = new Map(springLite.metrics.map((metric) => [metric.label, metric]));
  const bootMetrics = new Map(springBoot.metrics.map((metric) => [metric.label, metric]));
  const labels = [...new Set([...liteMetrics.keys(), ...bootMetrics.keys()])];

  return labels.map((label) => ({
    label,
    lite: liteMetrics.get(label)?.value ?? "-",
    boot: bootMetrics.get(label)?.value ?? "-",
    matches: liteMetrics.get(label)?.value === bootMetrics.get(label)?.value
  }));
}

export function DualRuntimePanel({ scenario, state }: { scenario: string; state: DualRuntimeTraceState }) {
  const runtimes = [
    { label: "Spring Lite", trace: state.springLite, error: state.springLiteError, tone: "live" },
    { label: "Spring Boot", trace: state.springBoot, error: state.springBootError, tone: "static" }
  ];
  const metricRows = state.springLite && state.springBoot
    ? sharedMetricRows(state.springLite, state.springBoot)
    : [];
  const liteSteps = new Map(state.springLite?.steps.map((step) => [step.id, step]) ?? []);
  const bootSteps = new Map(state.springBoot?.steps.map((step) => [step.id, step]) ?? []);
  const stepIds = [...new Set([...liteSteps.keys(), ...bootSteps.keys()])];

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
      {metricRows.length > 0 ? (
        <section className="dual-runtime-diff" aria-label="Live comparison differences">
          <div className="dual-runtime-diff-head"><strong>Observed metrics</strong><span>Spring Lite / Spring Boot</span></div>
          {metricRows.map((row) => (
            <div className={`dual-runtime-diff-row ${row.matches ? "match" : "diff"}`} key={row.label}>
              <span>{row.label}</span><strong>{row.lite}</strong><strong>{row.boot}</strong>
            </div>
          ))}
        </section>
      ) : null}
      {stepIds.length > 0 ? (
        <section className="dual-runtime-steps" aria-label="Live comparison steps">
          <div className="dual-runtime-diff-head"><strong>Observed pipeline</strong><span>shared IDs are aligned</span></div>
          <div className="dual-runtime-step-rail">
            {stepIds.map((id) => {
              const lite = liteSteps.get(id);
              const boot = bootSteps.get(id);
              const shared = lite && boot;
              return (
                <div className={`dual-runtime-step ${shared ? "shared" : "runtime-only"}`} key={id}>
                  <span>{id}</span>
                  <strong>{lite?.title ?? boot?.title}</strong>
                  <p>{shared ? `${lite.kind} / ${boot.kind}` : lite ? "Spring Lite only" : "Spring Boot only"}</p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </article>
  );
}
