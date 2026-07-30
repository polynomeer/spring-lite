import { useMemo, useState } from "react";
import { TracePreview } from "../components/trace/TracePreview";
import { adaptTrace } from "../features/trace-adapters";
import { useLabTrace } from "../hooks/useLabTrace";
import { liveApiBaseUrl, liveTraceEndpointPath } from "../lib/runtime-config";
import { labCards, roadmapSteps, tracePresetOptions } from "../lib/static-data";
import type { LabId, LabTraceRequest, RuntimeMode } from "../lib/types";

function toPresetKey(labId: LabId, scenario: string): string {
  return `${labId}:${scenario}`;
}

function buildRequest(presetKey: string, mode: RuntimeMode): LabTraceRequest {
  const preset = tracePresetOptions.find((option) => toPresetKey(option.labId, option.scenario) === presetKey) ?? tracePresetOptions[0];
  return {
    labId: preset.labId,
    scenario: preset.scenario,
    mode
  };
}

export function App() {
  const firstPreset = tracePresetOptions[0];
  const [mode, setMode] = useState<RuntimeMode>("static");
  const [selectedLab, setSelectedLab] = useState<LabId | "all">("all");
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>(toPresetKey(firstPreset.labId, firstPreset.scenario));
  const [executedRequest, setExecutedRequest] = useState<LabTraceRequest>(() => buildRequest(toPresetKey(firstPreset.labId, firstPreset.scenario), "static"));
  const [reloadKey, setReloadKey] = useState(0);
  const [lastRunLabel, setLastRunLabel] = useState("Not run yet");

  const filteredPresets = useMemo(
    () => selectedLab === "all"
      ? tracePresetOptions
      : tracePresetOptions.filter((option) => option.labId === selectedLab),
    [selectedLab]
  );

  const activePresetKey = useMemo(() => {
    const matched = filteredPresets.some((option) => toPresetKey(option.labId, option.scenario) === selectedPresetKey);
    if (matched) {
      return selectedPresetKey;
    }
    const fallback = filteredPresets[0] ?? firstPreset;
    return toPresetKey(fallback.labId, fallback.scenario);
  }, [filteredPresets, firstPreset, selectedPresetKey]);

  const draftRequest = useMemo(() => buildRequest(activePresetKey, mode), [activePresetKey, mode]);
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

  function focusLab(labId: LabId | "all") {
    setSelectedLab(labId);
    if (labId === "all") {
      return;
    }
    const firstLabPreset = tracePresetOptions.find((option) => option.labId === labId);
    if (firstLabPreset) {
      setSelectedPresetKey(toPresetKey(firstLabPreset.labId, firstLabPreset.scenario));
    }
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">spring-lite / visual-lab-app</p>
          <h1>Unified visual lab app for all spring-lite study modules</h1>
          <p className="hero-text">
            The separated frontend now covers playground, container, example-flow, and comparison labs
            through one shared trace model. Static study traces and live runtime traces use the same
            rendering shell so each module can evolve without UI rewrites.
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
              ? "Explore all four labs through normalized study traces with no backend dependency."
              : "Run example-flow against the live example-app now, and extend the same contract to more labs later."}
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
            <span className="badge">{labCards.length} lab families</span>
          </div>
          <div className="card-grid">
            {labCards.map((card) => (
              <article
                className={selectedLab === card.id ? "card selected" : "card"}
                key={card.id}
                onClick={() => focusLab(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    focusLab(card.id);
                  }
                }}
              >
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
            <strong>Current status</strong>
            <p>
              The shared <code>LabTrace</code> schema now covers playground, container, example-flow,
              and comparison scenarios in one app. Live runtime execution is already wired for
              <code> example-flow</code>, while the remaining labs have static parity through the same
              renderer and adapter structure.
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
            <div className="lab-filter-row">
              <button
                className={selectedLab === "all" ? "filter-chip active" : "filter-chip"}
                type="button"
                onClick={() => focusLab("all")}
              >
                All Labs
              </button>
              {labCards.map((card) => (
                <button
                  className={selectedLab === card.id ? "filter-chip active" : "filter-chip"}
                  key={card.id}
                  type="button"
                  onClick={() => focusLab(card.id)}
                >
                  {card.title}
                </button>
              ))}
            </div>
            <label className="field">
              <span>Trace preset</span>
              <select
                value={activePresetKey}
                onChange={(event) => setSelectedPresetKey(event.target.value)}
              >
                {filteredPresets.map((option) => (
                  <option key={toPresetKey(option.labId, option.scenario)} value={toPresetKey(option.labId, option.scenario)}>
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
              <h2>Frontend Structure</h2>
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
        TraceReferencesPanel.tsx
    features/
      example-flow/
      playground/
      container/
      comparison/
      trace-adapters.ts
    lib/
      providers.ts
      live-api.ts
      lab-trace-data.ts
      static-data.ts
      runtime-config.ts
      types.ts
    styles.css
  index.html
  package.json
  vite.config.ts`}</pre>
        </section>
      </main>
    </div>
  );
}
