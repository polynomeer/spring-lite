import { useEffect, useState } from "react";
import { labCards, roadmapSteps, tracePresetOptions } from "../lib/static-data";
import { getLabTraceProvider } from "../lib/providers";
import type { LabTrace, RuntimeMode } from "../lib/types";

export function App() {
  const [mode, setMode] = useState<RuntimeMode>("static");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [trace, setTrace] = useState<LabTrace | null>(null);
  const [traceError, setTraceError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const preset = tracePresetOptions[selectedPreset];
    const provider = getLabTraceProvider(mode);

    setTraceError(null);
    provider
      .getTrace({
        labId: preset.labId,
        scenario: preset.scenario,
        mode
      })
      .then((nextTrace) => {
        if (!cancelled) {
          setTrace(nextTrace);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setTrace(null);
          setTraceError(error instanceof Error ? error.message : "Unknown trace loading error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mode, selectedPreset]);

  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">spring-lite / visual-lab-app</p>
          <h1>Separated frontend scaffold for the next visual lab phase</h1>
          <p className="hero-text">
            This app is the starting point for moving the current static learning pages into a reusable
            frontend that can support both static simulations and live runtime traces from spring-lite
            or Spring Boot servers.
          </p>
        </div>
        <div className="hero-panel">
          <strong>Runtime Mode</strong>
          <div className="toggle-row">
            <button
              className={mode === "static" ? "toggle active" : "toggle"}
              type="button"
              onClick={() => setMode("static")}
            >
              Static Simulation
            </button>
            <button
              className={mode === "live" ? "toggle active" : "toggle"}
              type="button"
              onClick={() => setMode("live")}
            >
              Live Runtime
            </button>
          </div>
          <p className="mode-note">
            {mode === "static"
              ? "Use local scenario providers and preserve the no-server learning path."
              : "Connect trace APIs, request runners, and comparison targets once backend contracts exist."}
          </p>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Feature Surface</p>
              <h2>Lab Modules</h2>
            </div>
            <span className="badge">{labCards.length} planned views</span>
          </div>
          <div className="card-grid">
            {labCards.map((card) => (
              <article className="card" key={card.title}>
                <div className="card-top">
                  <div>
                    <h3>{card.title}</h3>
                    <p>{card.summary}</p>
                  </div>
                  <span className="tag">{card.stage}</span>
                </div>
                <div className="chip-row">
                  {card.capabilities.map((capability) => (
                    <span className="chip" key={capability}>
                      {capability}
                    </span>
                  ))}
                </div>
                <div className="detail-list">
                  <div>
                    <span>Now</span>
                    <p>{card.now}</p>
                  </div>
                  <div>
                    <span>Next</span>
                    <p>{card.next}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel side-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Migration Plan</p>
              <h2>Scaffold Goals</h2>
            </div>
          </div>
          <ol className="roadmap-list">
            {roadmapSteps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
          <div className="info-box">
            <strong>Suggested next implementation</strong>
            <p>
              The shared <code>LabTrace</code> schema and provider boundary are now in place. The next step
              is wiring the first real live endpoint for <code>example-flow-lab</code>.
            </p>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Trace Contract</p>
              <h2>Provider Preview</h2>
            </div>
            <span className="badge">{mode === "static" ? "static provider" : "live provider"}</span>
          </div>
          <div className="control-stack">
            <label className="field">
              <span>Trace preset</span>
              <select
                value={selectedPreset}
                onChange={(event) => setSelectedPreset(Number(event.target.value))}
              >
                {tracePresetOptions.map((option, index) => (
                  <option key={`${option.labId}:${option.scenario}`} value={index}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {traceError ? (
            <div className="info-box error-box">
              <strong>Trace loading failed</strong>
              <p>{traceError}</p>
            </div>
          ) : null}

          {trace ? (
            <div className="trace-preview-grid">
              <article className="trace-panel">
                <div className="trace-head">
                  <div>
                    <p className="eyebrow">Loaded Trace</p>
                    <h3>{trace.title}</h3>
                  </div>
                  <span className="tag">{trace.scenario}</span>
                </div>
                <p>{trace.summary}</p>
                <div className="metric-mini-grid">
                  {trace.metrics.map((metric) => (
                    <div className="metric-mini" key={metric.label}>
                      <strong>{metric.label}</strong>
                      <div className="metric-mini-value">{metric.value}</div>
                      <span>{metric.detail}</span>
                    </div>
                  ))}
                </div>
              </article>

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

              <article className="trace-panel">
                <p className="eyebrow">Steps</p>
                <div className="trace-list">
                  {trace.steps.map((step) => (
                    <div className={`trace-item ${step.kind}`} key={step.id}>
                      <strong>{step.title}</strong>
                      <p>{step.detail}</p>
                    </div>
                  ))}
                </div>
              </article>

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
            </div>
          ) : null}
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Project Layout</p>
              <h2>Initial Frontend Structure</h2>
            </div>
          </div>
          <pre className="code-block">{`visual-lab-app/
  src/
    app/
      App.tsx
    lib/
      static-data.ts
      types.ts
    styles.css
  index.html
  package.json
  tsconfig.app.json
  tsconfig.node.json
  vite.config.ts`}</pre>
        </section>
      </main>
    </div>
  );
}
