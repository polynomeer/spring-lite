import { useMemo, useState } from "react";
import { TracePreview } from "../components/trace/TracePreview";
import { adaptTrace } from "../features/trace-adapters";
import { useLabTrace } from "../hooks/useLabTrace";
import {
  formatRunTime,
  getUiText,
  localizeLabCards,
  localizeModeLabel,
  localizePresetLabel,
  localizeRoadmapSteps,
  localizeTrace,
  type Locale,
  translateUiError
} from "../lib/i18n";
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
  const [locale, setLocale] = useState<Locale>("ko");
  const [mode, setMode] = useState<RuntimeMode>("static");
  const [selectedLab, setSelectedLab] = useState<LabId | "all">("all");
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>(toPresetKey(firstPreset.labId, firstPreset.scenario));
  const [executedRequest, setExecutedRequest] = useState<LabTraceRequest>(() => buildRequest(toPresetKey(firstPreset.labId, firstPreset.scenario), "static"));
  const [reloadKey, setReloadKey] = useState(0);
  const [lastRunLabel, setLastRunLabel] = useState(getUiText("ko").notRunYet);
  const text = getUiText(locale);
  const localizedCards = useMemo(() => localizeLabCards(labCards, locale), [locale]);
  const localizedRoadmap = useMemo(() => localizeRoadmapSteps(roadmapSteps, locale), [locale]);

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
  const localizedTrace = useMemo(() => (trace ? localizeTrace(trace, locale) : null), [locale, trace]);
  const traceInsight = useMemo(() => (localizedTrace ? adaptTrace(localizedTrace, locale) : null), [localizedTrace, locale]);
  const endpointLabel = liveApiBaseUrl
    ? `${liveApiBaseUrl}${liveTraceEndpointPath}`
    : `${liveTraceEndpointPath} via Vite proxy`;
  const activeTraceModeLabel = executedRequest.mode === "live" ? text.liveSignal : text.staticReplay;
  const activeTraceModeTone = executedRequest.mode === "live" ? "status-pill info" : "status-pill neutral";
  const displayError = translateUiError(traceError, locale);

  function runSelectedTrace() {
    setExecutedRequest(draftRequest);
    setReloadKey((current) => current + 1);
    setLastRunLabel(formatRunTime(new Date(), locale));
  }

  function rerunLastTrace() {
    setReloadKey((current) => current + 1);
    setLastRunLabel(formatRunTime(new Date(), locale));
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
          <p className="eyebrow">{text.appEyebrow}</p>
          <h1>{text.heroTitle}</h1>
          <p className="hero-text">{text.heroText}</p>
        </div>
        <div className="hero-panel">
          <div className="hero-panel-head">
            <div>
              <p className="eyebrow">{text.quickRun}</p>
              <strong>{text.runtimeMode}</strong>
            </div>
            <p className="hero-panel-copy">{text.quickRunBody}</p>
          </div>
          <div className="toggle-row">
            <button className={locale === "ko" ? "toggle active" : "toggle"} type="button" onClick={() => setLocale("ko")}>
              한국어
            </button>
            <button className={locale === "en" ? "toggle active" : "toggle"} type="button" onClick={() => setLocale("en")}>
              English
            </button>
          </div>
          <div className="toggle-row">
            <button
              className={mode === "static" ? "toggle active" : "toggle"}
              type="button"
              onClick={() => setMode("static")}
            >
              {text.staticSimulation}
            </button>
            <button
              className={mode === "live" ? "toggle active" : "toggle"}
              type="button"
              onClick={() => setMode("live")}
            >
              {text.liveRuntime}
            </button>
          </div>
          <p className="mode-note">
            {mode === "static" ? text.staticModeNote : text.liveModeNote}
          </p>
          {mode === "live" ? (
            <p className="mode-subnote">
              {liveApiBaseUrl
                ? `${text.liveEndpointPrefix} ${liveApiBaseUrl}${liveTraceEndpointPath}`
                : `${text.liveEndpointProxy} ${liveTraceEndpointPath} (Vite dev proxy expects example-app on :8080).`}
            </p>
          ) : null}
          <div className="run-actions">
            <button className="run-button" type="button" onClick={runSelectedTrace} disabled={loading && !isDraftDirty}>
              {isDraftDirty ? text.runSelectedTrace : text.refreshTrace}
            </button>
            <button className="ghost-button" type="button" onClick={rerunLastTrace} disabled={loading}>
              {text.rerunLast}
            </button>
          </div>
        </div>
      </header>

      <main className="workspace-layout">
        <aside className="panel control-rail">
          <div className="section-head">
            <div>
              <p className="eyebrow">{text.quickRun}</p>
              <h2>{text.scenarioLibrary}</h2>
            </div>
            <span className="badge">{filteredPresets.length} presets</span>
          </div>
          <div className="control-stack">
            <div className="lab-filter-row">
              <button
                className={selectedLab === "all" ? "filter-chip active" : "filter-chip"}
                type="button"
                onClick={() => focusLab("all")}
              >
                {text.allLabs}
              </button>
              {localizedCards.map((card) => (
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
            <div className="scenario-list" role="list" aria-label={text.tracePreset}>
              {filteredPresets.map((option) => {
                const presetKey = toPresetKey(option.labId, option.scenario);
                return (
                  <button
                    className={presetKey === activePresetKey ? "scenario-card active" : "scenario-card"}
                    key={presetKey}
                    type="button"
                    onClick={() => setSelectedPresetKey(presetKey)}
                  >
                    <strong>{localizePresetLabel(option.label, locale)}</strong>
                    <span>{option.labId} / {option.scenario}</span>
                  </button>
                );
              })}
            </div>
            <div className="request-summary">
              <div className="request-card">
                <strong>{text.selectedRequest}</strong>
                <p>{draftRequest.labId} / {draftRequest.scenario} / {localizeModeLabel(draftRequest.mode, locale)}</p>
              </div>
              <div className="request-card">
                <strong>{text.lastExecuted}</strong>
                <p>{executedRequest.labId} / {executedRequest.scenario} / {localizeModeLabel(executedRequest.mode, locale)}</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="result-column">
          <section className="panel result-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">{text.resultWorkspace}</p>
                <h2>{text.providerPreview}</h2>
              </div>
              <span className="badge">{mode === "static" ? text.staticProvider : text.liveProvider}</span>
            </div>
            <p className="section-copy">{text.resultWorkspaceBody}</p>
            <div className="control-stack">
              <label className="field">
                <span>{text.tracePreset}</span>
                <select
                  value={activePresetKey}
                  onChange={(event) => setSelectedPresetKey(event.target.value)}
                >
                  {filteredPresets.map((option) => (
                    <option key={toPresetKey(option.labId, option.scenario)} value={toPresetKey(option.labId, option.scenario)}>
                      {localizePresetLabel(option.label, locale)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="runtime-strip">
                <span className={isDraftDirty ? "status-pill warning" : "status-pill success"}>
                  {isDraftDirty ? text.selectionChanged : text.selectionSynced}
                </span>
                <span className="status-pill neutral">{text.lastRun} {lastRunLabel}</span>
                <span className={activeTraceModeTone}>{activeTraceModeLabel}</span>
                {executedRequest.mode === "live" ? (
                  <span className="status-pill info">{endpointLabel}</span>
                ) : (
                  <span className="status-pill neutral">{text.localStaticProvider}</span>
                )}
              </div>
              <div className="console-strip">
                <div className="console-leds" aria-hidden="true">
                  <span className={loading ? "console-led hot" : "console-led ok"}></span>
                  <span className={executedRequest.mode === "live" ? "console-led info" : "console-led idle"}></span>
                  <span className={traceError ? "console-led warn" : "console-led idle"}></span>
                </div>
                <div className="console-strip-copy">
                  <strong>{loading ? text.tracePipelineActive : text.tracePipelineReady}</strong>
                  <p>
                    {loading
                      ? text.tracePipelineActiveDetail(executedRequest.labId, executedRequest.scenario, localizeModeLabel(executedRequest.mode, locale))
                      : text.tracePipelineReadyDetail(executedRequest.labId, executedRequest.scenario, localizeModeLabel(executedRequest.mode, locale))}
                  </p>
                </div>
              </div>
              <div className="run-actions">
                <button className="run-button" type="button" onClick={runSelectedTrace} disabled={loading && !isDraftDirty}>
                  {isDraftDirty ? text.runSelectedTrace : text.refreshTrace}
                </button>
                <button className="ghost-button" type="button" onClick={rerunLastTrace} disabled={loading}>
                  {text.rerunLast}
                </button>
              </div>
              <label className="field">
                <span>{text.requestPayload}</span>
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
                <strong>{text.loadingTrace}</strong>
                <p>{text.resolvingTrace}</p>
              </div>
            ) : null}

            {displayError ? (
              <div className="info-box error-box">
                <strong>{text.traceLoadingFailed}</strong>
                <p>{displayError}</p>
              </div>
            ) : null}

            {localizedTrace ? (
              <TracePreview
                trace={localizedTrace}
                insight={traceInsight}
                runSequence={reloadKey}
                loading={loading}
                locale={locale}
                labels={{
                  loadedTrace: text.loadedTrace,
                  featureAdapter: text.featureAdapter,
                  overview: text.overview,
                  flowView: text.flowView,
                  deepLinks: text.deepLinks,
                  steps: text.steps,
                  lanes: text.lanes,
                  snapshot: text.snapshot,
                  references: text.references,
                  relatedFiles: text.relatedFiles,
                  refs: text.refs,
                  watch: text.watch,
                  why: text.why,
                  nextLabel: text.nextLabel
                }}
              />
            ) : null}
          </section>

          <section className="context-stack">
            <details className="panel details-panel">
              <summary>
                <div>
                  <p className="eyebrow">{text.supportingContext}</p>
                  <h2>{text.labModules}</h2>
                </div>
                <span className="badge">{localizedCards.length} {text.labFamilies}</span>
              </summary>
              <p className="section-copy">{text.supportingContextBody}</p>
              <div className="card-grid compact">
                {localizedCards.map((card) => (
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
                        <span>{text.now}</span>
                        <p>{card.now}</p>
                      </div>
                      <div>
                        <span>{text.next}</span>
                        <p>{card.next}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </details>

            <details className="panel details-panel">
              <summary>
                <div>
                  <p className="eyebrow">{text.migrationPlan}</p>
                  <h2>{text.scaffoldGoals}</h2>
                </div>
              </summary>
              <ol className="roadmap-list">
                {localizedRoadmap.map((step) => (
                  <li key={step.title}>
                    <strong>{step.title}</strong>
                    <p>{step.description}</p>
                  </li>
                ))}
              </ol>
              <div className="info-box">
                <strong>{text.currentStatus}</strong>
                <p>{text.currentStatusBody}</p>
              </div>
            </details>

            <details className="panel details-panel">
              <summary>
                <div>
                  <p className="eyebrow">{text.projectLayout}</p>
                  <h2>{text.frontendStructure}</h2>
                </div>
              </summary>
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
            </details>
          </section>
        </section>
      </main>
    </div>
  );
}
