import { useMemo, useState } from "react";
import { TracePreview } from "../components/trace/TracePreview";
import { TraceNarrativePanel } from "../components/trace/TraceNarrativePanel";
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
import { staticTraceCatalog } from "../lib/lab-trace-data";
import { deriveTraceStatusSummary } from "../lib/trace-presentation";
import { labCards, questionCards, tracePresetOptions } from "../lib/static-data";
import type { LabId, LabLane, LabStep, LabTraceRequest, RuntimeMode } from "../lib/types";

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

function normalizeStepSignature(step: LabStep): string {
  return step.marker.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function summarizeStep(step: LabStep): string {
  return `${step.marker} ${step.title}`;
}

function summarizeLaneDifference(staticLane: LabLane | undefined, liveLane: LabLane | undefined, locale: Locale): string {
  if (staticLane && liveLane) {
    if (staticLane.events.length === liveLane.events.length) {
      return locale === "ko" ? "이 lane의 이벤트 수는 동일합니다." : "This lane keeps the same event count.";
    }
    return locale === "ko"
      ? `live trace가 ${Math.abs(liveLane.events.length - staticLane.events.length)}개의 이벤트를 더 자세히 드러냅니다.`
      : `The live trace exposes ${Math.abs(liveLane.events.length - staticLane.events.length)} more event(s) in this lane.`;
  }
  if (liveLane) {
    return locale === "ko" ? "이 lane은 live trace에서만 관찰됩니다." : "This lane appears only in the live trace.";
  }
  return locale === "ko" ? "이 lane은 static baseline에서만 단순화되어 남아 있습니다." : "This lane only remains in the static baseline simplification.";
}

export function App() {
  const firstPreset = tracePresetOptions[0];
  const [locale, setLocale] = useState<Locale>("ko");
  const [mode, setMode] = useState<RuntimeMode>("static");
  const [selectedLab, setSelectedLab] = useState<LabId | "all">("example-flow");
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>(toPresetKey(firstPreset.labId, firstPreset.scenario));
  const [executedRequest, setExecutedRequest] = useState<LabTraceRequest>(() => buildRequest(toPresetKey(firstPreset.labId, firstPreset.scenario), "static"));
  const [reloadKey, setReloadKey] = useState(0);
  const [lastRunLabel, setLastRunLabel] = useState(getUiText("ko").notRunYet);
  const text = getUiText(locale);

  const localizedCards = useMemo(() => localizeLabCards(labCards, locale), [locale]);
  const localizedQuestions = useMemo(
    () => questionCards.map((question) => ({
      ...question,
      question: locale === "ko" ? question.questionKo : question.questionEn,
      goal: locale === "ko" ? question.goalKo : question.goalEn,
      readPath: locale === "ko" ? question.readPathKo : question.readPathEn,
      moduleLabel: locale === "ko" ? question.moduleLabelKo : question.moduleLabelEn
    })),
    [locale]
  );

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
  const selectedQuestion = localizedQuestions.find((question) => question.labId === draftRequest.labId && question.scenario === draftRequest.scenario)
    ?? localizedQuestions.find((question) => question.labId === draftRequest.labId)
    ?? localizedQuestions[0];
  const executedQuestion = localizedQuestions.find((question) => question.labId === executedRequest.labId && question.scenario === executedRequest.scenario)
    ?? localizedQuestions.find((question) => question.labId === executedRequest.labId)
    ?? localizedQuestions[0];
  const isDraftDirty = draftRequest.labId !== executedRequest.labId
    || draftRequest.scenario !== executedRequest.scenario
    || draftRequest.mode !== executedRequest.mode;
  const activeQuestion = isDraftDirty ? selectedQuestion : executedQuestion;

  const { trace, error: traceError, loading, requestedMode, resolvedSource } = useLabTrace(executedRequest, reloadKey);
  const localizedTrace = useMemo(() => (trace ? localizeTrace(trace, locale) : null), [locale, trace]);
  const localizedStaticBaseline = useMemo(() => {
    if (executedRequest.labId !== "example-flow" || executedRequest.mode !== "live") {
      return null;
    }
    const baseline = staticTraceCatalog[`${executedRequest.labId}:${executedRequest.scenario}`];
    return baseline ? localizeTrace(baseline, locale) : null;
  }, [executedRequest.labId, executedRequest.mode, executedRequest.scenario, locale]);
  const traceInsight = useMemo(() => (localizedTrace ? adaptTrace(localizedTrace, locale) : null), [localizedTrace, locale]);
  const traceStatus = localizedTrace ? deriveTraceStatusSummary(localizedTrace, locale) : null;
  const endpointLabel = liveApiBaseUrl
    ? `${liveApiBaseUrl}${liveTraceEndpointPath}`
    : `${liveTraceEndpointPath} via Vite proxy`;
  const activeTraceModeLabel = executedRequest.mode === "live" ? text.liveSignal : text.staticReplay;
  const activeTraceModeTone = executedRequest.mode === "live" ? "status-pill info" : "status-pill neutral";
  const displayError = translateUiError(traceError, locale);
  const requestedModeLabel = requestedMode === "live" ? text.liveRuntime : text.staticSimulation;
  const resolvedSourceLabel = resolvedSource === "live-api"
    ? text.sourceLiveApi
    : resolvedSource === "live-fallback"
      ? text.sourceLiveFallback
      : text.sourceStaticCatalog;
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
        runPrimary: loading
          ? "[ loading_trace ]"
          : isDraftDirty
            ? "[ run_trace ]"
            : "[ refresh_trace ]",
        rerun: loading ? "[ loading ]" : "[ rerun_last ]"
      };
  const consoleText = {
    command: "lab@spring-lite:~$ inspect trace --focus=question",
    title: "SPRING LITE VISUAL LAB",
    subtitle: text.heroText,
    queryLocked: "// LEARNING CONTROLS",
    ...dynamicConsoleText
  };

  const narrativeTone = traceStatus?.tone ?? (traceError ? "error" : "info");
  const narrativeTitle = traceStatus?.label ?? (traceError ? text.traceLoadingFailed : text.tracePipelineReady);
  const narrativeSummary = traceError
    ? displayError ?? pipelineDetail
    : localizedTrace
      ? localizedTrace.summary
      : pipelineDetail;
  const narrativeModeDetail = executedRequest.mode === "live"
    ? resolvedSource === "live-fallback"
      ? locale === "ko"
        ? `live 실행을 요청했지만 현재는 fallback placeholder가 렌더링되었습니다. endpoint는 ${endpointLabel} 이며, 백엔드 연결이 복구되면 실제 runtime trace로 대체됩니다.`
        : `A live run was requested, but the rendered result is the fallback placeholder. The endpoint is ${endpointLabel}, and it will switch to real runtime traces once the backend is reachable.`
      : locale === "ko"
        ? `현재 결과는 live provider 기준입니다. API 응답과 실제 런타임 상태를 따라가며, endpoint는 ${endpointLabel} 입니다.`
        : `This result comes from the live provider. It follows API-backed runtime output, and the endpoint is ${endpointLabel}.`
    : locale === "ko"
      ? "현재 결과는 static replay 기준입니다. 미리 정규화된 trace를 통해 개념을 안정적으로 학습하는 데 적합합니다."
      : "This result comes from the static replay provider. It is optimized for stable concept learning through normalized traces.";
  const narrativeBranchDetail = traceStatus
    ? `${traceStatus.detail} ${locale === "ko" ? "현재 시나리오:" : "Current scenario:"} ${executedRequest.labId}:${executedRequest.scenario}.`
    : pipelineDetail;
  const narrativeNextDetail = localizedTrace?.snapshot.next
    ?? (locale === "ko"
      ? "다음 단계에서는 흐름 탭에서 step replay를 실행하고, references 탭에서 관련 문서를 함께 보세요."
      : "Next, run the step replay in the flow tab and open the related references side by side.");
  const runtimeDiffRows = useMemo(() => {
    if (!localizedTrace || !localizedStaticBaseline || resolvedSource !== "live-api") {
      return [];
    }

    const staticMetrics = new Map(localizedStaticBaseline.metrics.map((metric) => [metric.label, metric]));
    const liveMetrics = new Map(localizedTrace.metrics.map((metric) => [metric.label, metric]));
    const labels = Array.from(new Set([...staticMetrics.keys(), ...liveMetrics.keys()]));

    return labels.map((label) => {
      const staticMetric = staticMetrics.get(label);
      const liveMetric = liveMetrics.get(label);
      return {
        label,
        staticValue: staticMetric?.value ?? "-",
        liveValue: liveMetric?.value ?? "-",
        detail: liveMetric?.detail ?? staticMetric?.detail ?? "",
        changed: (staticMetric?.value ?? "-") !== (liveMetric?.value ?? "-")
      };
    });
  }, [localizedStaticBaseline, localizedTrace, resolvedSource]);
  const runtimeFlowDiff = useMemo(() => {
    if (!localizedTrace || !localizedStaticBaseline || resolvedSource !== "live-api") {
      return undefined;
    }

    const staticSignatures = new Map(localizedStaticBaseline.steps.map((step) => [normalizeStepSignature(step), step]));
    const liveSignatures = new Map(localizedTrace.steps.map((step) => [normalizeStepSignature(step), step]));
    const sharedSteps = localizedTrace.steps
      .filter((step) => staticSignatures.has(normalizeStepSignature(step)))
      .map(summarizeStep);
    const liveOnlySteps = localizedTrace.steps
      .filter((step) => !staticSignatures.has(normalizeStepSignature(step)))
      .map(summarizeStep);
    const staticOnlySteps = localizedStaticBaseline.steps
      .filter((step) => !liveSignatures.has(normalizeStepSignature(step)))
      .map(summarizeStep);

    const laneKinds = Array.from(new Set([
      ...localizedStaticBaseline.lanes.map((lane) => lane.kind),
      ...localizedTrace.lanes.map((lane) => lane.kind)
    ]));
    const laneRows = laneKinds.map((laneKind) => {
      const staticLane = localizedStaticBaseline.lanes.find((lane) => lane.kind === laneKind);
      const liveLane = localizedTrace.lanes.find((lane) => lane.kind === laneKind);
      return {
        lane: liveLane?.label ?? staticLane?.label ?? laneKind,
        staticCount: staticLane?.events.length ?? 0,
        liveCount: liveLane?.events.length ?? 0,
        note: summarizeLaneDifference(staticLane, liveLane, locale),
        changed: (staticLane?.events.length ?? 0) !== (liveLane?.events.length ?? 0)
      };
    });

    return {
      sharedSteps,
      liveOnlySteps,
      staticOnlySteps,
      laneRows
    };
  }, [localizedStaticBaseline, localizedTrace, locale, resolvedSource]);

  function difficultyLabel(level: string) {
    if (level === "beginner") {
      return text.difficultyBeginner;
    }
    if (level === "advanced") {
      return text.difficultyAdvanced;
    }
    return text.difficultyIntermediate;
  }

  function runSelectedTrace() {
    setExecutedRequest(draftRequest);
    setReloadKey((current) => current + 1);
    setLastRunLabel(formatRunTime(new Date(), locale));
  }

  function rerunLastTrace() {
    setReloadKey((current) => current + 1);
    setLastRunLabel(formatRunTime(new Date(), locale));
  }

  function chooseQuestion(questionId: string) {
    const question = questionCards.find((candidate) => candidate.id === questionId);
    if (!question) {
      return;
    }
    setSelectedLab(question.labId);
    setSelectedPresetKey(toPresetKey(question.labId, question.scenario));
    if (!question.supportsLive && mode === "live") {
      setMode("static");
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
            <div className="hero-guides">
              <div className="guide-card">
                <strong>{text.questionGuide}</strong>
                <p>{text.questionGuideBody}</p>
              </div>
              <div className="guide-card">
                <strong>{text.quickRun}</strong>
                <p>{text.quickRunBody}</p>
              </div>
              <div className="guide-card">
                <strong>{text.resultGuide}</strong>
                <p>{text.resultGuideBody}</p>
              </div>
            </div>
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
              <span className={selectedQuestion.supportsLive ? "status-pill info" : "status-pill neutral"}>
                {selectedQuestion.supportsLive ? text.liveReady : text.staticOnly}
              </span>
              <span className={activeTraceModeTone}>{activeTraceModeLabel}</span>
            </div>
          </div>
        </header>

        <main className="workspace-layout" id="app-main">
          <section className="panel query-panel">
            <div className="panel-label">{consoleText.queryLocked}</div>

            <div className="control-block">
              <span className="control-step">1. {text.selectedQuestion}</span>
              <div className="question-grid">
                {localizedQuestions.map((question) => {
                  const isActive = selectedQuestion.id === question.id;
                  return (
                    <button
                      className={isActive ? "question-card active" : "question-card"}
                      key={question.id}
                      type="button"
                      onClick={() => chooseQuestion(question.id)}
                    >
                      <div className="question-card-head">
                        <span className="status-pill neutral">{question.moduleLabel}</span>
                        <span className={question.supportsLive ? "status-pill info" : "status-pill neutral"}>
                          {question.supportsLive ? text.liveReady : text.staticOnly}
                        </span>
                      </div>
                      <strong>{question.question}</strong>
                      <p>{question.goal}</p>
                      <div className="question-card-meta">
                        <span>{difficultyLabel(question.difficulty)}</span>
                        <span>{question.readPath}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="control-block">
              <span className="control-step">2. {text.executionTarget}</span>
              <div className="selection-brief">
                <div className="request-card">
                  <strong>{selectedQuestion.question}</strong>
                  <p>{selectedQuestion.goal}</p>
                </div>
                <div className="request-card">
                  <strong>{text.howToUse}</strong>
                  <p>1. {text.howToUseStep1}</p>
                  <p>2. {text.howToUseStep2}</p>
                  <p>3. {text.howToUseStep3}</p>
                </div>
              </div>
            </div>

            <div className="control-block">
              <span className="control-step">3. {text.runtimeMode}</span>
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
                  disabled={!selectedQuestion.supportsLive}
                >
                  {text.liveRuntime}
                </button>
              </div>
            </div>

            <div className="control-block">
              <span className="control-step">4. {text.tracePreset}</span>
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
                <strong>{text.selectedRequest}</strong>
                <p>{draftRequest.labId} / {draftRequest.scenario} / {localizeModeLabel(draftRequest.mode, locale)}</p>
              </div>
              <div className="request-card">
                <strong>{text.lastSuccessfulRun}</strong>
                <p>{lastRunLabel}</p>
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

            {isDraftDirty ? (
              <div className="info-box warning-box compact-info-box">
                <strong>{text.selectionChanged}</strong>
                <p>{text.rerunHint}</p>
              </div>
            ) : null}
          </section>

          <section className="result-column">
            <section className="panel result-panel">
              <div className="results-header">
                <div>
                  <p className="eyebrow">{text.runFocus}</p>
                  <p className="results-meta">{activeQuestion.question}</p>
                </div>
                <span className="badge">{executedRequest.mode === "static" ? text.staticProvider : text.liveProvider}</span>
              </div>

              <div className="runtime-strip table-strip">
                <span className="table-head-cell">{text.executionTarget}</span>
                <span className={isDraftDirty ? "status-pill warning" : "status-pill success"}>
                  {executedRequest.labId}:{executedRequest.scenario}
                </span>
                <span className={activeTraceModeTone}>{activeTraceModeLabel}</span>
                <span className={resolvedSource === "live-fallback" ? "status-pill warning" : "status-pill neutral"}>
                  {text.resolvedSourceLabel} {resolvedSourceLabel}
                </span>
                <span className="status-pill neutral">{text.lastRun} {lastRunLabel}</span>
              </div>

              {resolvedSource === "live-fallback" ? (
                <div className="info-box warning-box compact-info-box">
                  <strong>{text.sourceFallbackWarning}</strong>
                  <p>{text.sourceFallbackBody}</p>
                </div>
              ) : null}

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

              <div className="focus-summary">
                <div className="request-card">
                  <strong>{text.thisRunAnswers}</strong>
                  <p>{executedQuestion.question}</p>
                </div>
                <div className="request-card">
                  <strong>{text.recommendedReading}</strong>
                  <p>{executedQuestion.readPath}</p>
                </div>
                <div className="request-card">
                  <strong>{text.executionTarget}</strong>
                  <p>{executedRequest.labId} / {executedRequest.scenario} / {localizeModeLabel(executedRequest.mode, locale)}</p>
                </div>
                <div className="request-card">
                  <strong>{text.requestedModeLabel}</strong>
                  <p>{requestedModeLabel}</p>
                </div>
                <div className="request-card">
                  <strong>{text.resolvedSourceLabel}</strong>
                  <p>{resolvedSourceLabel}</p>
                </div>
                <div className="request-card">
                  <strong>endpoint</strong>
                  <p>{executedRequest.mode === "live" ? endpointLabel : text.localStaticProvider}</p>
                </div>
              </div>

              {traceStatus ? (
                <div className={`run-focus-card tone-${traceStatus.tone}`}>
                  <div className="trace-head">
                    <div>
                      <p className="eyebrow">{text.resultGuide}</p>
                      <h3>{traceStatus.label}</h3>
                    </div>
                    <span className={`status-pill ${traceStatus.tone}`}>{traceStatus.label}</span>
                  </div>
                  <p className="run-focus-detail">{traceStatus.detail}</p>
                  <div className="run-focus-grid">
                    <div className="trace-item info">
                      <strong>{text.thisRunAnswers}</strong>
                      <p>{executedQuestion.goal}</p>
                    </div>
                    <div className="trace-item info">
                      <strong>{text.recommendedReading}</strong>
                      <p>{executedQuestion.readPath}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <TraceNarrativePanel
                eyebrow={text.traceNarrative}
                title={narrativeTitle}
                summary={narrativeSummary}
                modeLabel={text.traceNarrativeMode}
                branchLabel={text.traceNarrativeBranch}
                nextStepLabel={text.traceNarrativeNext}
                modeDetail={narrativeModeDetail}
                branchDetail={narrativeBranchDetail}
                nextStepDetail={narrativeNextDetail}
                tone={narrativeTone}
              />

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
                executionPath: text.executionPath,
                activePath: text.activePath,
                alternatePath: text.alternatePath,
                comparisonDiff: text.comparisonDiff,
                stateTransition: text.stateTransition,
                primaryLifecycle: text.primaryLifecycle,
                sideEffects: text.sideEffects,
                overview: text.overview,
                flowView: text.flowView,
                flowSource: text.flowSource,
                focusCurrentRun: text.focusCurrentRun,
                focusStaticBaseline: text.focusStaticBaseline,
                focusSplitCompare: text.focusSplitCompare,
                flowCompareStepShapeDiff: text.flowCompareStepShapeDiff,
                flowCompareTitleDiff: text.flowCompareTitleDiff,
                flowCompareMarkerDiff: text.flowCompareMarkerDiff,
                flowCompareDetailDiff: text.flowCompareDetailDiff,
                flowCompareEventCountDiff: text.flowCompareEventCountDiff,
                flowTimeline: text.flowTimeline,
                replayControls: text.replayControls,
                replayPlay: text.replayPlay,
                replayPause: text.replayPause,
                replayPrevious: text.replayPrevious,
                replayNext: text.replayNext,
                replayAuto: text.replayAuto,
                replayManual: text.replayManual,
                selectedStep: text.selectedStep,
                    relatedLanes: text.relatedLanes,
                    deepLinks: text.deepLinks,
                    steps: text.steps,
                    lanes: text.lanes,
                    snapshot: text.snapshot,
                references: text.references,
                relatedFiles: text.relatedFiles,
                refs: text.refs,
                sharedCore: text.sharedCore,
                liteSide: text.liteSide,
                springSide: text.springSide,
                watch: text.watch,
                why: text.why,
                nextLabel: text.nextLabel,
                runtimeDiff: text.runtimeDiff,
                runtimeDiffSubtitle: text.runtimeDiffSubtitle,
                runtimeFlowDiff: text.runtimeFlowDiff,
                runtimeFlowDiffSubtitle: text.runtimeFlowDiffSubtitle,
                runtimeSharedSpine: text.runtimeSharedSpine,
                runtimeLiveOnly: text.runtimeLiveOnly,
                runtimeStaticOnly: text.runtimeStaticOnly,
                runtimeLaneCoverage: text.runtimeLaneCoverage,
                staticBaseline: text.staticBaseline,
                liveObserved: text.liveObserved
                  }}
                  baselineTrace={localizedStaticBaseline ?? undefined}
                  runtimeDiffRows={runtimeDiffRows}
                  runtimeFlowDiff={runtimeFlowDiff}
                />
              ) : null}
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}
