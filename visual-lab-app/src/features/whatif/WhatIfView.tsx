import { useEffect, useState } from "react";
import { runWhatIf } from "../../lib/live-api";
import { recordActivity } from "../../lib/progress-store";
import type { WhatIfRunResult } from "../../lib/types";
import { layerLabels } from "../replay/replay-state";
import { whatIfSwitches } from "./whatif-catalog";
import "../replay/replay.css";
import "../pitfalls/pitfalls.css";
import "./whatif.css";

type Mode = "off" | "on";

const modeLabels: Record<Mode, string> = { off: "스위치 끔 · 원래 동작", on: "스위치 켬 · 장치 없이" };

export function WhatIfView() {
  const [selectedId, setSelectedId] = useState(whatIfSwitches[0].id);
  const [results, setResults] = useState<Record<string, Partial<Record<Mode, WhatIfRunResult>>>>({});
  const [running, setRunning] = useState<Mode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = whatIfSwitches.find((item) => item.id === selectedId) ?? whatIfSwitches[0];
  const selectedResults = results[selected.id] ?? {};

  useEffect(() => {
    for (const [id, modes] of Object.entries(results)) {
      if (modes.off && modes.on) {
        recordActivity(`whatif:${id}`);
      }
    }
  }, [results]);

  const run = async (mode: Mode) => {
    setRunning(mode);
    setError(null);
    try {
      const result = await runWhatIf(selected.id, mode);
      setResults((value) => ({ ...value, [selected.id]: { ...value[selected.id], [mode]: result } }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="pitfalls-page">
      <section className="pitfalls-head">
        <div>
          <p className="pitfalls-crumb">What-if 스위치</p>
          <h1>장치를 하나 끄면 무슨 일이 생길까</h1>
          <p className="pitfalls-lede">
            프레임워크 안의 안전장치를 하나씩 꺼 보고 같은 시나리오의 결과를 비교한다. 장치가 왜 있는지는 그것이 없을 때 가장 잘 보인다. 스위치는 이 요청을 처리하는 스레드에서만 켜지고, 기본값은 언제나 꺼짐이다.
          </p>
        </div>
      </section>

      <div className="pitfalls-layout">
        <nav className="pitfalls-list" aria-label="스위치 목록">
          {whatIfSwitches.map((item) => {
            const done = results[item.id];
            return (
              <button
                key={item.id}
                type="button"
                className="pitfalls-card"
                aria-current={item.id === selected.id ? "true" : undefined}
                onClick={() => setSelectedId(item.id)}
              >
                <span className="pitfalls-tags">{item.module}{done?.off && done.on ? " · 완료" : ""}</span>
                <strong>{item.title}</strong>
              </button>
            );
          })}
        </nav>

        <section className="pitfalls-detail" aria-labelledby="whatif-title">
          <div className="pitfalls-panel">
            <span className="pitfalls-tags">{selected.module} · <code>{selected.flag}</code></span>
            <h2 id="whatif-title">{selected.title}</h2>
            <p><b>시나리오.</b> {selected.scenario}</p>
            <p className="whatif-file">{selected.file}</p>
            <pre className="pitfalls-code whatif-diff">
              {selected.diff.split("\n").map((line, index) => (
                <span key={index} className={line.startsWith("+") ? "is-add" : line.startsWith("-") ? "is-del" : undefined}>{line}{"\n"}</span>
              ))}
            </pre>
          </div>

          <div className="pitfalls-variants">
            {(["off", "on"] as const).map((mode) => {
              const result = selectedResults[mode];
              return (
                <article key={mode} className={`pitfalls-variant ${mode === "off" ? "variant-fixed" : "variant-broken"}`} aria-labelledby={`whatif-${mode}`}>
                  <div className="pitfalls-variant-head">
                    <h3 id={`whatif-${mode}`}>{modeLabels[mode]}</h3>
                    <button
                      type="button"
                      className={`lab-button${mode === "off" ? " primary" : ""}`}
                      onClick={() => run(mode)}
                      disabled={running !== null}
                    >
                      {running === mode ? "실행 중…" : result ? "다시 실행" : "실행"}
                    </button>
                  </div>
                  {result ? (
                    <div className="pitfalls-result" role="status">
                      <p className="pitfalls-outcome">{result.outcome}</p>
                      <dl className="replay-attributes">
                        {Object.entries(result.facts).map(([label, value]) => (
                          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                        ))}
                      </dl>
                      {result.events.length > 0 && (
                        <details className="pitfalls-events">
                          <summary>
                            실행 이벤트 {result.eventCount}개{result.eventCount > result.events.length ? ` 중 앞 ${result.events.length}개` : ""}
                          </summary>
                          <ol>
                            {result.events.map((event) => (
                              <li key={event.seq} className={event.kind === "what-if" ? "whatif-event" : undefined}>
                                <span>{layerLabels[event.layer]}</span>
                                <span>{event.detail}</span>
                              </li>
                            ))}
                          </ol>
                        </details>
                      )}
                    </div>
                  ) : (
                    <p className="replay-empty">아직 실행하지 않았다.</p>
                  )}
                </article>
              );
            })}
          </div>

          {error && <p className="replay-notice is-error" role="alert">실험을 실행하지 못했다: {error}. example-app이 실행 중인지 확인하라.</p>}

          {(selectedResults.off || selectedResults.on) && (
            <div className="pitfalls-panel">
              <p><b>그래서 이 장치가 있다.</b> {selected.why}</p>
              <p className="pitfalls-spring-note">{selected.spring}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
