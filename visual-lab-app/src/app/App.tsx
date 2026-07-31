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
  localizeTrace,
  type Locale,
  translateUiError
} from "../lib/i18n";
import { liveApiBaseUrl, liveTraceEndpointPath } from "../lib/runtime-config";
import { labCards, tracePresetOptions } from "../lib/static-data";
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
  const activeLabCard = localizedCards.find((card) => card.id === draftRequest.labId)
    ?? localizedCards.find((card) => card.id === executedRequest.labId)
    ?? localizedCards[0];
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
  const requestPreview = isDraftDirty ? draftRequest : executedRequest;
  const pipelineTitle = loading
    ? text.tracePipelineActive
    : isDraftDirty
      ? text.tracePipelinePending
      : text.tracePipelineReady;
  const pipelineDetail = loading
    ? text.tracePipelineActiveDetail(executedRequest.labId, executedRequest.scenario, localizeModeLabel(executedRequest.mode, locale))
    : isDraftDirty
      ? text.tracePipelinePendingDetail(
          draftRequest.labId,
          draftRequest.scenario,
          localizeModeLabel(draftRequest.mode, locale),
          executedRequest.labId,
          executedRequest.scenario,
          localizeModeLabel(executedRequest.mode, locale)
        )
      : text.tracePipelineReadyDetail(executedRequest.labId, executedRequest.scenario, localizeModeLabel(executedRequest.mode, locale));
  const dynamicConsoleText = locale === "ko"
    ? {
        statusAction: loading
          ? "[ trace_loading ]"
          : traceError
            ? "[ trace_error ]"
            : executedRequest.mode === "live"
              ? "[ runtime_live ]"
              : "[ runtime_static ]",
        saveQuery: loading
          ? "[ loading_trace ]"
          : isDraftDirty
            ? "[ run_trace ]"
            : "[ refresh_trace ]",
        traceResultsMeta: loading
          ? "provider 응답을 수집하는 중"
          : isDraftDirty
            ? "선택은 바뀌었지만 결과는 아직 마지막 실행 기준"
            : traceError
              ? "최근 실행에서 오류가 감지됨"
              : "마지막 실행 결과가 로드됨",
        activeSelection: isDraftDirty ? "PENDING SELECTION" : "ACTIVE SELECTION",
        telemetry: loading
          ? "FETCHING"
          : traceError
            ? "DEGRADED"
            : localizedTrace?.mode === "live"
              ? "LIVE"
              : "STATIC",
        runPrimary: loading
          ? "[ loading_trace ]"
          : isDraftDirty
            ? "[ run_trace ]"
            : "[ refresh_trace ]",
        rerun: loading ? "[ loading ]" : "[ rerun_last ]"
      }
    : {
        statusAction: loading
          ? "[ trace_loading ]"
          : traceError
            ? "[ trace_error ]"
            : executedRequest.mode === "live"
              ? "[ runtime_live ]"
              : "[ runtime_static ]",
        saveQuery: loading
          ? "[ loading_trace ]"
          : isDraftDirty
            ? "[ run_trace ]"
            : "[ refresh_trace ]",
        traceResultsMeta: loading
          ? "collecting provider response"
          : isDraftDirty
            ? "selection changed while result pane still shows last execution"
            : traceError
              ? "latest execution reported an error"
              : "last executed trace is loaded",
        activeSelection: isDraftDirty ? "PENDING SELECTION" : "ACTIVE SELECTION",
        telemetry: loading
          ? "FETCHING"
          : traceError
            ? "DEGRADED"
            : localizedTrace?.mode === "live"
              ? "LIVE"
              : "STATIC",
        runPrimary: loading
          ? "[ loading_trace ]"
          : isDraftDirty
            ? "[ run_trace ]"
            : "[ refresh_trace ]",
        rerun: loading ? "[ loading ]" : "[ rerun_last ]"
      };
  const consoleText = locale === "ko"
    ? {
        command: "lab@spring-lite:~$ inspect trace --sort=scenario",
        title: "SPRING LITE VISUAL LAB",
        subtitle: "Complete through Jul 31, 2026",
        queryLocked: "// TRACE CONTROLS",
        traceResults: "TRACE RESULTS",
        ...dynamicConsoleText
      }
    : {
        command: "lab@spring-lite:~$ inspect trace --sort=scenario",
        title: "SPRING LITE VISUAL LAB",
        subtitle: "Complete through Jul 31, 2026",
        queryLocked: "// TRACE CONTROLS",
        traceResults: "TRACE RESULTS",
        ...dynamicConsoleText
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
            <div className="hero-status-stack">
              <span className={isDraftDirty ? "status-pill warning" : "status-pill success"}>
                {isDraftDirty ? text.selectionChanged : text.selectionSynced}
              </span>
              <span className={activeTraceModeTone}>{activeTraceModeLabel}</span>
            </div>
          </div>
        </header>

        <main className="workspace-layout" id="app-main">
          <section className="panel query-panel">
            <div className="panel-label">{consoleText.queryLocked}</div>
            <div className="control-block">
              <span className="control-step">1. {text.runtimeMode}</span>
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
            </div>

            <div className="control-block">
              <span className="control-step">2. {text.labModules}</span>
              <div className="lab-tab-row" role="tablist" aria-label={text.labModules}>
                {localizedCards.map((card) => (
                  <button
                    className={selectedLab === card.id ? "lab-tab active" : "lab-tab"}
                    key={card.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedLab === card.id}
                    onClick={() => focusLab(card.id)}
                  >
                    <strong>{card.title}</strong>
                    <span>{card.summary}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-block">
              <span className="control-step">3. {text.tracePreset}</span>
              <div className="scenario-panel">
                <div className="scenario-panel-head">
                  <div>
                    <strong>{activeLabCard?.title}</strong>
                    <p>{activeLabCard?.summary}</p>
                  </div>
                  <span className="status-pill neutral">{filteredPresets.length} presets</span>
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
              </div>
            </div>

            <div className="selection-preview">
              <div className="request-card">
                <strong>4. {text.selectedRequest}</strong>
                <p>{draftRequest.labId} / {draftRequest.scenario} / {localizeModeLabel(draftRequest.mode, locale)}</p>
              </div>
              <div className="request-card">
                <strong>{text.lastExecuted}</strong>
                <p>{executedRequest.labId} / {executedRequest.scenario} / {localizeModeLabel(executedRequest.mode, locale)}</p>
              </div>
            </div>

            <div className="run-actions query-actions">
              <button className="run-button primary-run-button" type="button" onClick={runSelectedTrace} disabled={loading && !isDraftDirty}>
                {consoleText.runPrimary}
              </button>
              <button className="ghost-button" type="button" onClick={rerunLastTrace} disabled={loading}>
                {consoleText.rerun}
              </button>
            </div>
          </section>

          <section className="result-column">
            <section className="panel result-panel">
              <div className="results-header">
                <div>
                  <p className="eyebrow">{consoleText.traceResults}</p>
                  <p className="results-meta">{consoleText.traceResultsMeta}</p>
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
                  <strong>{pipelineTitle}</strong>
                  <p>{pipelineDetail}</p>
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
                  value={JSON.stringify(requestPreview, null, 2)}
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
          </section>
        </main>
      </div>
    </div>
  );
}
