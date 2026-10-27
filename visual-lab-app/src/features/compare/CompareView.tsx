import { useEffect, useState } from "react";
import { comparisonSamples } from "../../lib/comparison-sample";
import { fetchComparisonEvents } from "../../lib/live-api";
import { recordActivity } from "../../lib/progress-store";
import type { ComparisonEventTrace, ComparisonTraceEvent, RuntimeMode } from "../../lib/types";
import { alignTraces, rowVerdict, stepExplain, stepLabel, verdictLabels, type Verdict } from "./trace-alignment";
import "../replay/replay.css";
import "./compare.css";

const scenarios = [
  { id: "tx-rollback", label: "insert 뒤 예외 · 롤백" },
  { id: "tx-commit", label: "정상 반환 · 커밋" }
];

type Side = "lite" | "boot";

const sideLabels: Record<Side, string> = { lite: "spring-lite", boot: "Spring Boot" };

interface SideState {
  trace: ComparisonEventTrace | null;
  error: string | null;
}

export function CompareView() {
  const [scenario, setScenario] = useState(scenarios[0].id);
  const [mode, setMode] = useState<RuntimeMode>("static");
  const [live, setLive] = useState<Record<Side, SideState> | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);

  const sides: Record<Side, SideState> = mode === "static"
    ? { lite: { trace: comparisonSamples[scenario].lite, error: null }, boot: { trace: comparisonSamples[scenario].boot, error: null } }
    : live ?? { lite: { trace: null, error: null }, boot: { trace: null, error: null } };
  const lite = sides.lite.trace;
  const boot = sides.boot.trace;
  const rows = lite && boot ? alignTraces(lite.events, boot.events) : [];
  const counts = rows.reduce<Record<Verdict, number>>(
    (total, row) => ({ ...total, [rowVerdict(row)]: total[rowVerdict(row)] + 1 }),
    { same: 0, simplified: 0, missing: 0 }
  );
  const row = rows[Math.min(selected, Math.max(rows.length - 1, 0))];

  useEffect(() => {
    setSelected(0);
  }, [scenario, mode, live]);

  useEffect(() => {
    setLive(null);
  }, [scenario]);

  const runLive = async () => {
    setLoading(true);
    const settle = async (side: Side): Promise<SideState> => {
      try {
        return { trace: await fetchComparisonEvents(side, scenario), error: null };
      } catch (cause) {
        return { trace: null, error: cause instanceof Error ? cause.message : String(cause) };
      }
    };
    const [liteState, bootState] = await Promise.all([settle("lite"), settle("boot")]);
    setLive({ lite: liteState, boot: bootState });
    setLoading(false);
  };

  return (
    <div className="compare-page">
      <section className="compare-head">
        <div>
          <p className="compare-crumb">비교 · tx</p>
          <h1>같은 호출, 두 런타임의 실행 경로</h1>
          <p className="compare-lede">
            같은 <code>@Transactional</code> 메서드를 spring-lite와 실제 Spring Boot에서 실행하고, 두 프레임워크가 지나간 단계를 이름으로 맞춰 세운다. 한쪽에만 있는 단계는 점선 칸으로 표시된다.
          </p>
        </div>
        <div className="compare-controls">
          <div className="replay-segmented" role="group" aria-label="시나리오">
            {scenarios.map((item) => (
              <button key={item.id} type="button" aria-pressed={scenario === item.id} onClick={() => setScenario(item.id)}>{item.label}</button>
            ))}
          </div>
          <div className="replay-segmented" role="group" aria-label="데이터 출처">
            <button type="button" aria-pressed={mode === "static"} onClick={() => setMode("static")}>정적 샘플</button>
            <button type="button" aria-pressed={mode === "live"} onClick={() => setMode("live")}>live</button>
          </div>
          {mode === "live" && (
            <button type="button" className="lab-button primary" onClick={runLive} disabled={loading}>
              {loading ? "실행 중…" : "두 런타임에서 실행"}
            </button>
          )}
        </div>
      </section>

      <div className="compare-runtimes">
        {(["lite", "boot"] as const).map((side) => {
          const state = sides[side];
          return (
            <section key={side} className={`compare-runtime side-${side}`} aria-label={sideLabels[side]}>
              <div className="compare-runtime-head">
                <h2>{sideLabels[side]}</h2>
                <span className={`compare-connection${state.error ? " is-error" : state.trace ? " is-ok" : ""}`}>
                  {mode === "static" ? "정적 샘플" : state.error ? "연결 실패" : state.trace ? "연결됨" : "실행 전"}
                </span>
              </div>
              {state.trace ? (
                <dl className="replay-attributes">
                  <div><dt>메서드 결과</dt><dd>{state.trace.outcome === "returned" ? "정상 반환" : state.trace.outcome}</dd></div>
                  <div><dt>orders 행 수</dt><dd>{state.trace.ordersBefore} → {state.trace.ordersAfter}</dd></div>
                  <div><dt>기록된 단계</dt><dd>{state.trace.events.length}개</dd></div>
                </dl>
              ) : (
                <p className="replay-empty">
                  {state.error
                    ? `${state.error}. ${side === "lite" ? "comparison-spring-lite-app(18081)" : "comparison-spring-boot-app(18082)"}이 실행 중인지 확인하라.`
                    : "“두 런타임에서 실행”을 누르면 실제 앱에서 기록을 받아 온다."}
                </p>
              )}
            </section>
          );
        })}
      </div>

      {rows.length > 0 && (
        <div className="compare-layout">
          <section className="compare-panel compare-path" aria-labelledby="compare-path">
            <div className="compare-panel-head">
              <h2 id="compare-path">실행 경로 정렬</h2>
              <ul className="compare-counts" aria-label="판정 집계">
                {(["same", "simplified", "missing"] as const).map((verdict) => (
                  <li key={verdict} className={`verdict-${verdict}`}>{verdictLabels[verdict]} {counts[verdict]}</li>
                ))}
              </ul>
            </div>
            <div className="compare-grid" role="table" aria-label="두 런타임의 단계">
              <div className="compare-grid-head" role="row">
                <span role="columnheader">spring-lite</span>
                <span role="columnheader">단계</span>
                <span role="columnheader">Spring Boot</span>
              </div>
              {rows.map((item, index) => {
                const verdict = rowVerdict(item);
                return (
                  <button
                    key={`${item.step}-${index}`}
                    type="button"
                    role="row"
                    className={`compare-row verdict-${verdict}`}
                    aria-pressed={index === selected}
                    onClick={() => {
                      setSelected(index);
                      recordActivity(`compare:${scenario}`);
                    }}
                  >
                    <StepCell event={item.lite} />
                    <span className="compare-step" role="cell">
                      <strong>{stepLabel(item.step)}</strong>
                      <code>{item.step}</code>
                    </span>
                    <StepCell event={item.boot} />
                  </button>
                );
              })}
            </div>
          </section>

          {row && (
            <aside className="compare-panel compare-detail" aria-labelledby="compare-detail">
              <p className="compare-crumb">{verdictLabels[rowVerdict(row)]}</p>
              <h2 id="compare-detail">{stepLabel(row.step)}</h2>
              <p>{stepExplain(row.step)}</p>
              {(["lite", "boot"] as const).map((side) => {
                const event = row[side];
                return (
                  <div key={side} className="compare-detail-side">
                    <h3>{sideLabels[side]}</h3>
                    {event ? (
                      <>
                        <p>{event.detail}</p>
                        {Object.keys(event.attributes).length > 0 && (
                          <dl className="replay-attributes">
                            {Object.entries(event.attributes).map(([key, value]) => (
                              <div key={key}><dt>{key}</dt><dd>{value}</dd></div>
                            ))}
                          </dl>
                        )}
                      </>
                    ) : (
                      <p className="replay-empty">이 런타임은 이 단계를 거치지 않는다.</p>
                    )}
                  </div>
                );
              })}
            </aside>
          )}
        </div>
      )}

      <section className="compare-panel compare-study" aria-labelledby="compare-study">
        <h2 id="compare-study">이렇게 읽어 보자</h2>
        <ol>
          <li>먼저 두 런타임의 orders 행 수가 같은지 본다. 결과는 같아야 한다.</li>
          <li>"같음" 단계만 따라가면 트랜잭션의 뼈대(프록시 → 시작 → SQL → 결말)가 보인다.</li>
          <li>점선 칸은 Spring에만 있는 확장 지점이다. 동기화 콜백이 왜 필요한지 커밋 시나리오에서 afterCommit 위치를 확인한다.</li>
          <li>전파 속성이 섞인 경우는 <a href="#/sandbox">샌드박스</a>에서 직접 조립해 본다.</li>
        </ol>
      </section>
    </div>
  );
}

function StepCell({ event }: { event?: ComparisonTraceEvent }) {
  return event ? (
    <span className="compare-cell" role="cell">
      <span className="compare-seq">#{event.seq}</span>
      <span>{event.layer}</span>
    </span>
  ) : (
    <span className="compare-cell is-empty" role="cell">없음</span>
  );
}
