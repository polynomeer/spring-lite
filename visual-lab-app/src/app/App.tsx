import { useMemo, useState } from "react";
import { TracePreview } from "../components/trace/TracePreview";
import { labCards, roadmapSteps, tracePresetOptions } from "../lib/static-data";
import { adaptTrace } from "../features/trace-adapters";
import { useLabTrace } from "../hooks/useLabTrace";
import { liveApiBaseUrl, liveTraceEndpointPath } from "../lib/runtime-config";
import type { LabTraceRequest, RuntimeMode } from "../lib/types";

function buildRequest(presetIndex: number, mode: RuntimeMode): LabTraceRequest {
  const preset = tracePresetOptions[presetIndex];
  return {
    labId: preset.labId,
    scenario: preset.scenario,
    mode
  };
}

export function App() {
  const [mode, setMode] = useState<RuntimeMode>("static");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [executedRequest, setExecutedRequest] = useState<LabTraceRequest>(() => buildRequest(0, "static"));
  const [reloadKey, setReloadKey] = useState(0);
  const [lastRunLabel, setLastRunLabel] = useState("Not run yet");
  const preset = tracePresetOptions[selectedPreset];
  const draftRequest = useMemo(() => buildRequest(selectedPreset, mode), [mode, selectedPreset]);
  const isDraftDirty = draftRequest.labId !== executedRequest.labId
    || draftRequest.scenario !== executedRequest.scenario
    || draftRequest.mode !== executedRequest.mode;
  const { trace, error: traceError, loading } = useLabTrace(executedRequest, reloadKey);
  const traceInsight = useMemo(() => (trace ? adaptTrace(trace) : null), [trace]);
  const endpointLabel = liveApiBaseUrl
    ? `${liveApiBaseUrl}${liveTraceEndpointPath}`
    : `${liveTraceEndpointPath} via Vite proxy`;

  function runSelectedTrace() {
    setExecutedRequest(draftRequest);
    setReloadKey((current) => current + 1);
    setLastRunLabel(new Date().toLocaleTimeString());
  }

  function rerunLastTrace() {
    setReloadKey((current) => current + 1);
    setLastRunLabel(new Date().toLocaleTimeString());
  }

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
          {mode === "live" ? (
            <p className="mode-subnote">
              {liveApiBaseUrl
                ? `Configured API base URL: ${liveApiBaseUrl}${liveTraceEndpointPath}`
                : `Using relative live endpoint ${liveTraceEndpointPath} (Vite dev proxy expects example-app on :8080).`}
            </p>
          ) : null}
          <div className="run-actions">
            <button className="run-button" type="button" onClick={runSelectedTrace} disabled={loading && !isDraftDirty}>
              {isDraftDirty ? "Run Selected Trace" : "Refresh Trace"}
            </button>
            <button className="ghost-button" type="button" onClick={rerunLastTrace} disabled={loading}>
              Re-run Last
            </button>
          </div>
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
              The shared <code>LabTrace</code> schema and provider boundary are in place, and the live
              <code> example-flow</code> endpoint now serves success, validation, not-found, service-error,
              and rollback scenarios. The next step is extending the same contract to container and
              comparison-focused labs.
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
            <div className="request-summary">
              <div className="request-card">
                <strong>Selected Request</strong>
                <p>{draftRequest.labId} / {draftRequest.scenario} / {draftRequest.mode}</p>
              </div>
              <div className="request-card">
                <strong>Last Executed</strong>
                <p>{executedRequest.labId} / {executedRequest.scenario} / {executedRequest.mode}</p>
              </div>
            </div>
            <div className="runtime-strip">
              <span className={isDraftDirty ? "status-pill warning" : "status-pill success"}>
                {isDraftDirty ? "selection changed" : "selection synced"}
              </span>
              <span className="status-pill neutral">last run {lastRunLabel}</span>
              {executedRequest.mode === "live" ? (
                <span className="status-pill info">{endpointLabel}</span>
              ) : (
                <span className="status-pill neutral">local static provider</span>
              )}
            </div>
            <label className="field">
              <span>Request payload</span>
              <textarea
                className="payload-preview"
                value={JSON.stringify(executedRequest, null, 2)}
                readOnly
                rows={6}
              />
            </label>
          </div>

          {loading ? (
            <div className="info-box">
              <strong>Loading trace</strong>
              <p>Resolving provider output for the last executed request.</p>
            </div>
          ) : null}

          {traceError ? (
            <div className="info-box error-box">
              <strong>Trace loading failed</strong>
              <p>{traceError}</p>
            </div>
          ) : null}

          {trace ? (
            <TracePreview trace={trace} insight={traceInsight} />
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
    hooks/
      useLabTrace.ts
    components/
      trace/
        TracePreview.tsx
    features/
      trace-adapters.ts
    lib/
      providers.ts
      lab-trace-data.ts
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
