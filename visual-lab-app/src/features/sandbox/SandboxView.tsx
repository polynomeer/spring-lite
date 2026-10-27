import { useMemo, useState } from "react";
import { runSandbox } from "../../lib/live-api";
import { savePrediction } from "../../lib/prediction-store";
import { recordActivity } from "../../lib/progress-store";
import type { SandboxNode, SandboxRunResult, SandboxTable } from "../../lib/types";
import { layerLabels } from "../replay/replay-state";
import { NodeEditor } from "./NodeEditor";
import { buildTimeline, countInserts, formatRows, renumberTransactions, sandboxPresets, sandboxTables, summarizeTransactions } from "./sandbox-model";
import "./sandbox.css";

type Prediction = Partial<Record<SandboxTable, number>>;

export function SandboxView() {
  const [presetId, setPresetId] = useState(sandboxPresets[0].id);
  const [root, setRoot] = useState<SandboxNode>(sandboxPresets[0].root);
  const [prediction, setPrediction] = useState<Prediction>({});
  const [result, setResult] = useState<{ run: SandboxRunResult; prediction: Prediction } | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inserts = useMemo(() => countInserts(root), [root]);
  const predictedTables = sandboxTables.filter((table) => inserts[table] > 0);
  const predictionComplete = predictedTables.every((table) => prediction[table] !== undefined);

  const changeTree = (next: SandboxNode) => {
    setRoot(next);
    setPrediction({});
    setResult(null);
  };

  const choosePreset = (id: string) => {
    const preset = sandboxPresets.find((item) => item.id === id) ?? sandboxPresets[0];
    setPresetId(preset.id);
    changeTree(preset.root);
  };

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      const response = await runSandbox(root);
      const run = { ...response, events: renumberTransactions(response.events) };
      const correct = predictedTables.every((table) => prediction[table] === run.rows[table]);
      savePrediction({
        scenario: `sandbox:${presetId}`,
        source: "sandbox",
        eventSeq: 0,
        question: "샌드박스: 실행 후 남는 행",
        choice: formatRows(prediction),
        answer: formatRows(Object.fromEntries(predictedTables.map((table) => [table, run.rows[table]]))),
        correct,
        at: new Date().toISOString()
      });
      recordActivity("sandbox:run");
      setResult({ run, prediction });
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="sandbox-page">
      <section className="sandbox-head">
        <p className="sandbox-crumb">tx · 샌드박스</p>
        <h1>트랜잭션 샌드박스</h1>
        <p className="sandbox-lede">
          호출 구조와 전파 속성을 고르고, 실행하기 전에 남을 행 수를 먼저 예측한다. 실행은 example-app의 실제 <code>@Transactional</code> 프록시를 거친다.
        </p>
      </section>

      <div className="sandbox-columns">
        <section className="sandbox-panel" aria-labelledby="sandbox-tree">
          <div className="sandbox-panel-head">
            <h2 id="sandbox-tree">호출 구조</h2>
            <label className="sandbox-inline-field">
              <span>예제</span>
              <select value={presetId} onChange={(event) => choosePreset(event.target.value)}>
                {sandboxPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
              </select>
            </label>
          </div>
          <NodeEditor node={root} depth={0} onChange={changeTree} />
        </section>

        <div className="sandbox-side">
          <section className="sandbox-panel" aria-labelledby="sandbox-predict">
            <h2 id="sandbox-predict">예측: 실행 후 남는 행은?</h2>
            {predictedTables.length === 0 ? (
              <p className="sandbox-muted">insert 단계를 하나 이상 넣어야 예측할 수 있다.</p>
            ) : (
              <div className="sandbox-predict-grid">
                {predictedTables.map((table) => (
                  <fieldset key={table} className="sandbox-predict-table">
                    <legend>{table}</legend>
                    <div className="sandbox-choice-row">
                      {Array.from({ length: inserts[table] + 1 }, (_, count) => (
                        <button
                          key={count}
                          type="button"
                          aria-pressed={prediction[table] === count}
                          onClick={() => {
                            setPrediction((value) => ({ ...value, [table]: count }));
                            setResult(null);
                          }}
                        >
                          {count}행
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
            <button type="button" className="lab-button primary" onClick={run} disabled={!predictionComplete || predictedTables.length === 0 || running}>
              {running ? "실행 중…" : "실행하고 확인하기"}
            </button>
            {error && (
              <p className="sandbox-error" role="alert">실행하지 못했다: {error}. example-app이 실행 중인지 확인하라.</p>
            )}
          </section>

          {result && <SandboxResult run={result.run} prediction={result.prediction} tables={predictedTables} />}
        </div>
      </div>
    </div>
  );
}

function SandboxResult({ run, prediction, tables }: { run: SandboxRunResult; prediction: Prediction; tables: SandboxTable[] }) {
  const correct = tables.every((table) => prediction[table] === run.rows[table]);
  const timeline = buildTimeline(run.events);
  const transactions = summarizeTransactions(run.events);

  return (
    <section className="sandbox-panel sandbox-result" aria-labelledby="sandbox-result">
      <div className="sandbox-panel-head">
        <h2 id="sandbox-result">실행 결과</h2>
        <span className={`sandbox-verdict ${correct ? "is-correct" : "is-wrong"}`} role="status">{correct ? "예측 적중" : "예측과 다름"}</span>
      </div>

      <div className="sandbox-rows">
        {tables.map((table) => (
          <div key={table} className={prediction[table] === run.rows[table] ? "is-match" : "is-miss"}>
            <span>{table}</span>
            <strong>{run.rows[table]}행</strong>
            <small>내 예측 {prediction[table]}행</small>
          </div>
        ))}
      </div>

      <p className="sandbox-outcome">
        {run.outcome === "exception"
          ? `가장 바깥 메서드가 예외를 밖으로 던졌다: ${run.exceptionMessage}`
          : "가장 바깥 메서드는 정상적으로 끝났다."}
      </p>

      {timeline.rows.length > 0 ? (
        <div className="sandbox-timeline-scroll">
          <div className="sandbox-timeline" style={{ gridTemplateColumns: `72px repeat(${timeline.columns.length}, minmax(64px, 1fr))` }}>
            {timeline.rows.map((row) => (
              <div key={row.name} className="sandbox-timeline-row" style={{ display: "contents" }}>
                <span className="sandbox-timeline-name">{row.name}</span>
                {row.cells.map((cell, position) => (
                  <span
                    key={position}
                    className={`sandbox-cell cell-${cell.kind}${cell.kind === "event" && cell.failure ? " is-failure" : ""}`}
                  >
                    {cell.kind === "event" ? cell.label : cell.kind === "suspended" ? "보류" : ""}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="sandbox-muted">트랜잭션이 하나도 열리지 않았다. 각 insert는 자동 커밋으로 바로 저장된다.</p>
      )}

      {transactions.length > 0 && (
        <ul className="sandbox-tx-summary">
          {transactions.map((tx) => (
            <li key={tx.name}>
              <strong>{tx.name}</strong> {tx.method} ({tx.propagation}) →{" "}
              {tx.ending === "commit" ? "커밋" : tx.ending === "rollback" ? "롤백" : "진행 중"}
              {tx.markedRollbackOnly && tx.ending === "rollback" && (
                <>
                  {" · 참여한 메서드의 실패로 rollback-only가 되어 바깥이 커밋하려 해도 롤백됐다. "}
                  <span className="sandbox-spring-note">실제 Spring은 이때 조용히 롤백하지 않고 바깥 commit에서 UnexpectedRollbackException을 던진다.</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <details className="sandbox-events">
        <summary>이벤트 {run.events.length}개 보기</summary>
        <ol>
          {run.events.map((event) => (
            <li key={event.seq}>
              <span className="sandbox-event-seq">{String(event.seq).padStart(2, "0")}</span>
              <span className="sandbox-event-layer">{layerLabels[event.layer]}</span>
              <span>{event.detail}</span>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
