import { useEffect, useState } from "react";
import { runMissingValid, runPitfall } from "../../lib/live-api";
import { recordActivity } from "../../lib/progress-store";
import type { PitfallRunResult } from "../../lib/types";
import { layerLabels } from "../replay/replay-state";
import { pitfallLayerLabels, pitfalls, type Pitfall, type PitfallLayer } from "./pitfall-catalog";
import "../replay/replay.css";
import "./pitfalls.css";

type Variant = "broken" | "fixed";

export function PitfallsView() {
  const [layer, setLayer] = useState<PitfallLayer | "all">("all");
  const [selectedId, setSelectedId] = useState(pitfalls[0].id);
  const [results, setResults] = useState<Record<string, Partial<Record<Variant, PitfallRunResult>>>>({});
  const [running, setRunning] = useState<Variant | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = pitfalls.filter((pitfall) => layer === "all" || pitfall.layers.includes(layer));
  const selected = pitfalls.find((pitfall) => pitfall.id === selectedId) ?? pitfalls[0];
  const selectedResults = results[selected.id] ?? {};

  useEffect(() => {
    for (const [id, variants] of Object.entries(results)) {
      if (variants.broken && variants.fixed) {
        recordActivity(`pitfall:${id}`);
      }
    }
  }, [results]);

  const run = async (pitfall: Pitfall, variant: Variant) => {
    setRunning(variant);
    setError(null);
    try {
      const result = pitfall.kind === "http" ? await runMissingValid(variant) : await runPitfall(pitfall.id, variant);
      setResults((value) => ({ ...value, [pitfall.id]: { ...value[pitfall.id], [variant]: result } }));
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
          <p className="pitfalls-crumb">함정 실험실</p>
          <h1>일부러 망가뜨려 보는 실험실</h1>
          <p className="pitfalls-lede">
            실무에서 자주 겪는 "왜 안 되지?"를 example-app에서 실제로 재현한다. 망가진 버전을 먼저 실행해 증상을 보고, 고친 버전과 결과를 나란히 비교한다.
          </p>
        </div>
        <div className="pitfalls-filter" role="group" aria-label="계층 필터">
          {(["all", "context", "aop", "tx", "web"] as const).map((item) => (
            <button key={item} type="button" aria-pressed={layer === item} onClick={() => setLayer(item)}>
              {item === "all" ? "전체" : pitfallLayerLabels[item]}
            </button>
          ))}
        </div>
      </section>

      <div className="pitfalls-layout">
        <nav className="pitfalls-list" aria-label="실험 목록">
          {visible.map((pitfall) => {
            const done = results[pitfall.id];
            return (
              <button
                key={pitfall.id}
                type="button"
                className="pitfalls-card"
                aria-current={pitfall.id === selected.id ? "true" : undefined}
                onClick={() => setSelectedId(pitfall.id)}
              >
                <span className="pitfalls-tags">{pitfall.layers.join(" · ")}{done?.broken && done.fixed ? " · 완료" : ""}</span>
                <strong>{pitfall.title}</strong>
              </button>
            );
          })}
        </nav>

        <section className="pitfalls-detail" aria-labelledby="pitfall-title">
          <div className="pitfalls-panel">
            <span className="pitfalls-tags">{selected.layers.join(" · ")}</span>
            <h2 id="pitfall-title">{selected.title}</h2>
            <p><b>증상.</b> {selected.symptom}</p>
            {selected.springNote && <p className="pitfalls-spring-note">{selected.springNote}</p>}
          </div>

          <div className="pitfalls-variants">
            {(["broken", "fixed"] as const).map((variant) => {
              const result = selectedResults[variant];
              return (
                <article key={variant} className={`pitfalls-variant variant-${variant}`} aria-labelledby={`variant-${variant}`}>
                  <div className="pitfalls-variant-head">
                    <h3 id={`variant-${variant}`}>{variant === "broken" ? "망가진 버전" : "고친 버전"} · {variant === "broken" ? selected.brokenLabel : selected.fixedLabel}</h3>
                    <button
                      type="button"
                      className={`lab-button${variant === "broken" ? "" : " primary"}`}
                      onClick={() => run(selected, variant)}
                      disabled={running !== null}
                    >
                      {running === variant ? "실행 중…" : result ? "다시 실행" : "실행"}
                    </button>
                  </div>
                  <pre className="pitfalls-code">{variant === "broken" ? selected.brokenCode : selected.fixedCode}</pre>
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
                          <summary>실행 이벤트 {result.events.length}개</summary>
                          <ol>
                            {result.events.map((event) => (
                              <li key={event.seq}>
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

          {(selectedResults.broken || selectedResults.fixed) && (
            <div className="pitfalls-panel pitfalls-explain">
              <p><b>원인.</b> {selected.cause}</p>
              <p><b>고치는 법.</b> {selected.fix}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
