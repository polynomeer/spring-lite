import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchLabEventTrace } from "../../lib/live-api";
import { replaySamples } from "../../lib/replay-samples";
import type { LabEventTrace, RuntimeMode } from "../../lib/types";
import {
  deriveTransactions,
  describeLatestConnection,
  isFailure,
  layerLabels,
  transactionStatusLabels
} from "./replay-state";
import "./replay.css";

const scenarios = [
  { id: "rollback", label: "rollback · insert 뒤 예외" },
  { id: "create", label: "create · 주문 생성" },
  { id: "validation", label: "validation · 입력 검증 실패" },
  { id: "not-found", label: "not-found · 없는 주문 조회" },
  { id: "service-error", label: "service-error · 서비스 예외" }
];

const PLAY_INTERVAL_MS = 900;

export function ReplayView() {
  const [mode, setMode] = useState<RuntimeMode>("static");
  const [scenario, setScenario] = useState("rollback");
  const [liveData, setLiveData] = useState<LabEventTrace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const staticData = replaySamples[scenario] ?? null;
  const data = mode === "static" ? staticData : liveData;
  const events = data?.events ?? [];
  const lastIndex = Math.max(events.length - 1, 0);
  // The event list can change before the reset effect runs, so always read through a clamped position.
  const position = Math.min(index, lastIndex);
  const current = events[position];

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [mode, scenario, liveData]);

  const runLive = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLiveData(await fetchLabEventTrace({ labId: "example-flow", scenario, mode: "live" }));
    } catch (cause) {
      setLiveData(null);
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, [scenario]);

  const step = useCallback((delta: number) => {
    setPlaying(false);
    setIndex((value) => Math.min(Math.max(value + delta, 0), lastIndex));
  }, [lastIndex]);

  useEffect(() => {
    if (!playing) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setIndex((value) => {
        if (value >= lastIndex) {
          setPlaying(false);
          return value;
        }
        return value + 1;
      });
    }, PLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [playing, lastIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === " " && tag !== "BUTTON" && tag !== "A") {
        event.preventDefault();
        setPlaying((value) => !value && events.length > 0);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step, events.length]);

  const transactions = useMemo(() => deriveTransactions(events, position), [events, position]);
  const connection = useMemo(() => describeLatestConnection(events, position), [events, position]);
  const outcome = data?.trace.metrics.slice(0, 3) ?? [];

  return (
    <div className="replay-page">
      <section className="replay-head">
        <div>
          <p className="replay-crumb">example-flow / {scenario}</p>
          <h1>요청 리플레이</h1>
          <p className="replay-lede">
            spring-lite가 실제로 남긴 실행 이벤트를 한 단계씩 재생한다. ←/→로 이동하고 스페이스로 재생·정지한다.
          </p>
        </div>
        <div className="replay-controls">
          <label className="replay-field">
            <span>시나리오</span>
            <select value={scenario} onChange={(event) => setScenario(event.target.value)}>
              {scenarios.map((item) => (
                <option key={item.id} value={item.id} disabled={mode === "static" && !replaySamples[item.id]}>
                  {item.label}{mode === "static" && !replaySamples[item.id] ? " (live 전용)" : ""}
                </option>
              ))}
            </select>
          </label>
          <div className="replay-segmented" role="group" aria-label="데이터 출처">
            <button type="button" aria-pressed={mode === "static"} onClick={() => setMode("static")}>정적 샘플</button>
            <button type="button" aria-pressed={mode === "live"} onClick={() => setMode("live")}>live</button>
          </div>
          {mode === "live" && (
            <button type="button" className="lab-button primary" onClick={runLive} disabled={loading}>
              {loading ? "실행 중…" : "요청 보내기"}
            </button>
          )}
        </div>
      </section>

      {error && (
        <p className="replay-notice is-error" role="alert">
          live 이벤트를 받지 못했다: {error}. example-app이 실행 중인지 확인하라(<code>./gradlew :example-app:run</code>).
        </p>
      )}

      {!data && !error && (
        <p className="replay-notice">
          {mode === "live" ? "“요청 보내기”를 누르면 example-app에서 시나리오를 실행하고 이벤트를 받아온다." : "이 시나리오의 정적 샘플이 없다. live로 실행하라."}
        </p>
      )}

      {data && events.length === 0 && (
        <p className="replay-notice">이 시나리오는 기록된 프레임워크 이벤트가 없다.</p>
      )}

      {data && current && (
        <>
          {outcome.length > 0 && (
            <section className="replay-outcome" aria-label="결과">
              {outcome.map((metric) => (
                <div key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </section>
          )}

          <section className="replay-scrubber" aria-label="재생 컨트롤">
            <div className="replay-buttons">
              <button type="button" className="lab-button icon" onClick={() => step(-1)} disabled={position === 0} aria-label="이전 이벤트">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" className="lab-button icon primary" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "정지" : "재생"}>
                {playing ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5l9 5.5-9 5.5z" fill="currentColor" /></svg>
                )}
              </button>
              <button type="button" className="lab-button icon" onClick={() => step(1)} disabled={position >= lastIndex} aria-label="다음 이벤트">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <ol className="replay-track">
              {events.map((event, eventIndex) => (
                <li key={event.seq}>
                  <button
                    type="button"
                    className={`replay-tick layer-${event.layer}${isFailure(event) ? " is-failure" : ""}${eventIndex === position ? " is-current" : ""}${eventIndex > position ? " is-ahead" : ""}`}
                    onClick={() => { setPlaying(false); setIndex(eventIndex); }}
                    aria-label={`${event.seq}번 ${layerLabels[event.layer]} ${event.marker}`}
                    aria-current={eventIndex === position ? "step" : undefined}
                  >
                    <span className="replay-tick-bar" />
                    <span className="replay-tick-label">{event.marker}</span>
                  </button>
                </li>
              ))}
            </ol>
            <span className="replay-counter">{position + 1} / {events.length}</span>
          </section>

          <div className="replay-panels">
            <section className="replay-panel" aria-labelledby="replay-stack">
              <h2 id="replay-stack">콜스택</h2>
              {current.stack.length === 0 ? (
                <p className="replay-empty">프록시 바깥, 호출한 쪽 코드에서 일어난 이벤트다.</p>
              ) : (
                <ol className="replay-stack">
                  {current.stack.map((frame, frameIndex) => (
                    <li key={`${frame}-${frameIndex}`} className={frameIndex === current.stack.length - 1 ? "is-top" : undefined}>{frame}</li>
                  ))}
                </ol>
              )}
            </section>

            <section className={`replay-panel replay-detail layer-${current.layer}${isFailure(current) ? " is-failure" : ""}`} aria-labelledby="replay-detail">
              <div className="replay-detail-head">
                <span className="replay-layer">{layerLabels[current.layer]}</span>
                <span className="replay-seq">#{current.seq} · {current.kind}</span>
              </div>
              <h2 id="replay-detail" className="replay-marker">{current.marker}</h2>
              <p>{current.detail}</p>
              {current.attributes.sql && <pre className="replay-sql">{current.attributes.sql}</pre>}
              <dl className="replay-attributes">
                {Object.entries(current.attributes).filter(([key]) => key !== "sql").map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="replay-panel" aria-labelledby="replay-state">
              <h2 id="replay-state">상태 인스펙터</h2>
              {transactions.length === 0 ? (
                <p className="replay-empty">아직 열린 트랜잭션이 없다.</p>
              ) : (
                <ul className="replay-tx-list">
                  {transactions.map((tx) => (
                    <li key={tx.name} className={`status-${tx.status}`}>
                      <strong>{tx.name}</strong>
                      <span className="replay-tx-status">{transactionStatusLabels[tx.status]}</span>
                      <span>depth {tx.depth}</span>
                      {tx.rollbackOnly && <span className="replay-tx-flag">rollback-only</span>}
                    </li>
                  ))}
                </ul>
              )}
              <dl className="replay-attributes">
                <div>
                  <dt>최근 SQL 커넥션</dt>
                  <dd>{connection ?? "아직 SQL 없음"}</dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="replay-panel replay-log" aria-labelledby="replay-log">
            <h2 id="replay-log">이벤트 로그</h2>
            <div className="replay-log-scroll">
              <table>
                <thead>
                  <tr><th>#</th><th>계층</th><th>이벤트</th><th>설명</th></tr>
                </thead>
                <tbody>
                  {events.map((event, eventIndex) => (
                    <tr key={event.seq} className={`${eventIndex === position ? "is-current" : ""}${isFailure(event) ? " is-failure" : ""}`}>
                      <td>{String(event.seq).padStart(2, "0")}</td>
                      <td><span className={`replay-layer-dot layer-${event.layer}`} />{layerLabels[event.layer]}</td>
                      <td>
                        <button type="button" className="replay-log-jump" onClick={() => { setPlaying(false); setIndex(eventIndex); }}>
                          {event.marker}
                        </button>
                      </td>
                      <td>{event.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
