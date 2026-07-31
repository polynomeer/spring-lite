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
  const consoleText = locale === "ko"
    ? {
        statusAction: "[ runtime_live ]",
        saveQuery: "[ run_trace ]",
        command: "lab@spring-lite:~$ inspect trace --sort=scenario",
        title: "SPRING LITE VISUAL LAB",
        subtitle: "Complete through Jul 31, 2026",
        queryLocked: "// QUERY PARAMETERS - LOCKED",
        moreFilters: "▸ More filters",
        traceResults: "TRACE RESULTS",
        traceResultsMeta: "normalized runtime output",
        activeSelection: "ACTIVE SELECTION",
        telemetry: "TELEMETRY",
        supportModules: "SUPPORT MODULES",
        supportRoadmap: "ROADMAP",
        supportLayout: "LAYOUT",
        runPrimary: "[ run_trace ]",
        rerun: "[ rerun_last ]",
        searchPlaceholder: "$ select lab_or_scenario",
        categoryLabel: "Labs All",
        marketLabel: "Modes All",
        signalLabel: "provider:any",
        sortLabel: "Scenario",
        orderLabel: "Descending"
      }
    : {
        statusAction: "[ runtime_live ]",
        saveQuery: "[ run_trace ]",
        command: "lab@spring-lite:~$ inspect trace --sort=scenario",
        title: "SPRING LITE VISUAL LAB",
        subtitle: "Complete through Jul 31, 2026",
        queryLocked: "// QUERY PARAMETERS - LOCKED",
        moreFilters: "▸ More filters",
        traceResults: "TRACE RESULTS",
        traceResultsMeta: "normalized runtime output",
        activeSelection: "ACTIVE SELECTION",
        telemetry: "TELEMETRY",
        supportModules: "SUPPORT MODULES",
        supportRoadmap: "ROADMAP",
        supportLayout: "LAYOUT",
        runPrimary: "[ run_trace ]",
        rerun: "[ rerun_last ]",
        searchPlaceholder: "$ select lab_or_scenario",
        categoryLabel: "Labs All",
        marketLabel: "Modes All",
        signalLabel: "provider:any",
        sortLabel: "Scenario",
        orderLabel: "Descending"
      };

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
      <div className="console-frame">
        <div className="console-topbar">
          <div className="window-dots" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="site-header">
          <div className="brand-mark">
            <span className="brand-dot">&gt;_</span>
            <strong>Spring Lite</strong>
          </div>
          <div className="header-actions">
            <button className="ghost-button console-auth" type="button">
              {consoleText.statusAction}
            </button>
          </div>
        </div>

        <header className="hero">
          <div className="hero-copy">
            <p className="command-line">{consoleText.command}</p>
            <h1>{consoleText.title}</h1>
            <p className="hero-text">{consoleText.subtitle}</p>
          </div>
          <div className="hero-actions">
            <div className="locale-switch">
              <button className={locale === "ko" ? "toggle active" : "toggle"} type="button" onClick={() => setLocale("ko")}>
                KO
              </button>
              <button className={locale === "en" ? "toggle active" : "toggle"} type="button" onClick={() => setLocale("en")}>
                EN
              </button>
            </div>
            <button className="ghost-button save-query-button" type="button" onClick={runSelectedTrace} disabled={loading && !isDraftDirty}>
              {consoleText.saveQuery}
            </button>
          </div>
        </header>

        <main className="workspace-layout" id="app-main">
          <section className="panel query-panel">
            <div className="panel-label">{consoleText.queryLocked}</div>
            <div className="query-search">{consoleText.searchPlaceholder}</div>
            <div className="query-grid">
              <div className="query-select">{consoleText.categoryLabel}</div>
              <div className="query-select">{consoleText.marketLabel}</div>
              <div className="query-select accent">{consoleText.signalLabel}</div>
              <div className="query-select strong">{consoleText.sortLabel}</div>
              <div className="query-select strong">{consoleText.orderLabel}</div>
            </div>
            <div className="query-mode-row">
              <button
                className={mode === "static" ? "filter-chip active" : "filter-chip"}
                type="button"
                onClick={() => setMode("static")}
              >
                {text.staticSimulation}
              </button>
              <button
                className={mode === "live" ? "filter-chip active" : "filter-chip"}
                type="button"
                onClick={() => setMode("live")}
              >
                {text.liveRuntime}
              </button>
            </div>
            <div className="lab-filter-row">
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
            <div className="scenario-list compact" role="list" aria-label={text.tracePreset}>
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
            <div className="query-footer">
              <span>{consoleText.moreFilters}</span>
              <div className="run-actions">
                <button className="run-button" type="button" onClick={runSelectedTrace} disabled={loading && !isDraftDirty}>
                  {consoleText.runPrimary}
                </button>
                <button className="ghost-button" type="button" onClick={rerunLastTrace} disabled={loading}>
                  {consoleText.rerun}
                </button>
              </div>
            </div>
          </section>

          <section className="result-column">
            <section className="panel result-panel">
              <div className="results-header">
                <div>
                  <p className="eyebrow">{consoleText.traceResults}</p>
                  <h2>{consoleText.traceResultsMeta}</h2>
                </div>
                <span className="badge">{mode === "static" ? text.staticProvider : text.liveProvider}</span>
              </div>

              <div className="runtime-strip table-strip">
                <span className="table-head-cell">{consoleText.activeSelection}</span>
                <span className={isDraftDirty ? "status-pill warning" : "status-pill success"}>
                  {draftRequest.labId}:{draftRequest.scenario}
                </span>
                <span className={activeTraceModeTone}>{activeTraceModeLabel}</span>
                <span className="status-pill neutral">{text.lastRun} {lastRunLabel}</span>
                <span className="status-pill neutral">{consoleText.telemetry}</span>
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

              <div className="request-summary">
                <div className="request-card">
                  <strong>{text.selectedRequest}</strong>
                  <p>{draftRequest.labId} / {draftRequest.scenario} / {localizeModeLabel(draftRequest.mode, locale)}</p>
                </div>
                <div className="request-card">
                  <strong>{text.lastExecuted}</strong>
                  <p>{executedRequest.labId} / {executedRequest.scenario} / {localizeModeLabel(executedRequest.mode, locale)}</p>
                </div>
                <div className="request-card">
                  <strong>{text.runtimeMode}</strong>
                  <p>{mode === "static" ? text.staticModeNote : text.liveModeNote}</p>
                </div>
                <div className="request-card">
                  <strong>endpoint</strong>
                  <p>{executedRequest.mode === "live" ? endpointLabel : text.localStaticProvider}</p>
                </div>
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
                    <p className="eyebrow">{consoleText.supportModules}</p>
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
                    <p className="eyebrow">{consoleText.supportRoadmap}</p>
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
                    <p className="eyebrow">{consoleText.supportLayout}</p>
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
    </div>
  );
}
