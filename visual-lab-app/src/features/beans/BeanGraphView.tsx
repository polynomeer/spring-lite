import { useEffect, useMemo, useState } from "react";
import { containerSample } from "../../lib/container-sample";
import { fetchContainerGraph } from "../../lib/live-api";
import { recordActivity } from "../../lib/progress-store";
import type { ContainerGraph, RuntimeMode } from "../../lib/types";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  creationOrder,
  definitionKindLabels,
  eventsForBean,
  isApplicationBean,
  layoutGraph,
  lifecycleLabels,
  processorResults
} from "./bean-graph";
import "../replay/replay.css";
import "./beans.css";

const PLAY_INTERVAL_MS = 450;

export function BeanGraphView() {
  const [mode, setMode] = useState<RuntimeMode>("static");
  const [liveGraph, setLiveGraph] = useState<ContainerGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeInfrastructure, setIncludeInfrastructure] = useState(false);
  const [selected, setSelected] = useState("defaultOrderService");
  const [step, setStep] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const graph = mode === "static" ? containerSample : liveGraph;

  const loadLive = async () => {
    setLoading(true);
    setError(null);
    try {
      setLiveGraph(await fetchContainerGraph());
    } catch (cause) {
      setLiveGraph(null);
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  };

  const visibleBeans = useMemo(
    () => (graph?.beans ?? []).filter((bean) => includeInfrastructure || isApplicationBean(bean)),
    [graph, includeInfrastructure]
  );
  const layout = useMemo(() => layoutGraph(visibleBeans), [visibleBeans]);
  const order = useMemo(() => {
    const visible = new Set(visibleBeans.map((bean) => bean.name));
    return creationOrder(graph?.refresh ?? []).filter((name) => visible.has(name));
  }, [graph, visibleBeans]);
  const createdUpTo = step === null ? null : new Set(order.slice(0, step + 1));
  const creatingNow = step === null ? null : order[step];

  useEffect(() => {
    setStep(null);
    setPlaying(false);
  }, [graph, includeInfrastructure]);

  useEffect(() => {
    if (!playing) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setStep((value) => {
        const next = value === null ? 0 : value + 1;
        if (next >= order.length - 1) {
          setPlaying(false);
          recordActivity("beans:playback");
          return order.length - 1;
        }
        return next;
      });
    }, PLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [playing, order.length]);

  const selectedBean = graph?.beans.find((bean) => bean.name === selected) ?? visibleBeans[0];
  const dependents = graph?.beans.filter((bean) => selectedBean && bean.dependencies.includes(selectedBean.name)) ?? [];
  const lifecycle = selectedBean && graph ? eventsForBean(graph.refresh, selectedBean.name) : [];
  const processors = selectedBean && graph ? processorResults(graph.refresh, selectedBean.name) : [];
  const positions = new Map(layout.nodes.map((node) => [node.bean.name, node]));

  return (
    <div className="beans-page">
      <section className="beans-head">
        <div>
          <p className="beans-crumb">context · 빈 그래프</p>
          <h1>누가 누구를 주입받고, 누가 프록시가 되는가</h1>
          <p className="beans-lede">
            실행 중인 컨테이너의 빈과 주입 관계다. 화살표는 "이 빈이 저 빈을 주입받는다"는 뜻이고, 주황 테두리는 후처리기가 프록시로 바꾼 빈이다. 빈을 고르면 생애 단계를 볼 수 있다.
          </p>
        </div>
        <div className="beans-controls">
          <div className="replay-segmented" role="group" aria-label="데이터 출처">
            <button type="button" aria-pressed={mode === "static"} onClick={() => setMode("static")}>정적 샘플</button>
            <button type="button" aria-pressed={mode === "live"} onClick={() => setMode("live")}>live</button>
          </div>
          {mode === "live" && (
            <button type="button" className="lab-button primary" onClick={loadLive} disabled={loading}>
              {loading ? "불러오는 중…" : "컨테이너 조회"}
            </button>
          )}
          <label className="replay-toggle">
            <input type="checkbox" checked={includeInfrastructure} onChange={(event) => setIncludeInfrastructure(event.target.checked)} />
            프레임워크·자동 설정 빈 포함
          </label>
        </div>
      </section>

      {error && <p className="replay-notice is-error" role="alert">컨테이너를 조회하지 못했다: {error}. example-app이 실행 중인지 확인하라.</p>}
      {!graph && !error && <p className="replay-notice">“컨테이너 조회”를 누르면 실행 중인 example-app의 빈을 읽어 온다. 조회는 빈을 새로 만들지 않는다.</p>}

      {graph && (
        <div className="beans-layout">
          <section className="beans-panel beans-graph-panel" aria-labelledby="beans-graph">
            <div className="beans-panel-head">
              <h2 id="beans-graph">의존 그래프 · {visibleBeans.length}개</h2>
              <div className="beans-replay">
                <button type="button" className="lab-button" onClick={() => { setStep(null); setPlaying(false); }} disabled={step === null}>전체 보기</button>
                <button
                  type="button"
                  className="lab-button primary"
                  onClick={() => {
                    if (!playing && (step === null || step >= order.length - 1)) {
                      setStep(0);
                    }
                    setPlaying((value) => !value);
                  }}
                >
                  {playing ? "정지" : "생성 순서 재생"}
                </button>
                {step !== null && <span className="beans-step">{step + 1} / {order.length} · {creatingNow}</span>}
              </div>
            </div>
            <div className="beans-graph-scroll">
              <div className="beans-graph" style={{ width: layout.width, height: layout.height }}>
                <svg className="beans-edges" width={layout.width} height={layout.height} aria-hidden="true">
                  <defs>
                    <marker id="beans-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L8 4 L0 8 z" className="beans-arrow-head" />
                    </marker>
                  </defs>
                  {layout.edges.map((edge) => {
                    const from = positions.get(edge.from);
                    const to = positions.get(edge.to);
                    if (!from || !to) {
                      return null;
                    }
                    const x1 = from.x + NODE_WIDTH;
                    const y1 = from.y + NODE_HEIGHT / 2;
                    const x2 = to.x - 2;
                    const y2 = to.y + NODE_HEIGHT / 2;
                    const bend = Math.max(24, (x2 - x1) / 2);
                    const highlighted = selectedBean && (edge.from === selectedBean.name || edge.to === selectedBean.name);
                    const hidden = createdUpTo && !(createdUpTo.has(edge.from) && createdUpTo.has(edge.to));
                    return (
                      <path
                        key={`${edge.from}->${edge.to}`}
                        d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`}
                        className={`beans-edge${highlighted ? " is-highlighted" : ""}${hidden ? " is-pending" : ""}`}
                        markerEnd="url(#beans-arrow)"
                      />
                    );
                  })}
                </svg>
                {layout.nodes.map(({ bean, x, y }) => {
                  const pending = createdUpTo !== null && !createdUpTo.has(bean.name);
                  return (
                    <button
                      key={bean.name}
                      type="button"
                      className={[
                        "beans-node",
                        `kind-${bean.definitionKind.toLowerCase()}`,
                        bean.proxied ? "is-proxied" : "",
                        bean.name === selectedBean?.name ? "is-selected" : "",
                        pending ? "is-pending" : "",
                        bean.name === creatingNow ? "is-creating" : ""
                      ].join(" ")}
                      style={{ left: x, top: y, width: NODE_WIDTH, height: NODE_HEIGHT }}
                      onClick={() => setSelected(bean.name)}
                      aria-pressed={bean.name === selectedBean?.name}
                    >
                      <strong>{bean.name}</strong>
                      <span>
                        {order.indexOf(bean.name) >= 0 ? `#${order.indexOf(bean.name) + 1} · ` : ""}
                        {bean.proxied ? "proxy" : definitionKindLabels[bean.definitionKind]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <ul className="beans-legend" aria-label="범례">
              <li><span className="swatch swatch-component" />@Component</li>
              <li><span className="swatch swatch-factory" />@Bean</li>
              <li><span className="swatch swatch-config" />@Configuration</li>
              <li><span className="swatch swatch-proxy" />프록시로 노출</li>
            </ul>
          </section>

          {selectedBean && (
            <aside className="beans-side" aria-label="선택한 빈">
              <section className="beans-panel">
                <p className="beans-crumb">선택한 빈</p>
                <h2 className="beans-selected-name">{selectedBean.name}</h2>
                <dl className="replay-attributes">
                  <div><dt>타입</dt><dd>{selectedBean.simpleType}</dd></div>
                  <div><dt>정의</dt><dd>{definitionKindLabels[selectedBean.definitionKind]} · {selectedBean.scope}</dd></div>
                  <div><dt>노출</dt><dd>{selectedBean.proxied ? "프록시" : "원본 객체"}</dd></div>
                  <div><dt>주입받음</dt><dd>{selectedBean.dependencies.length ? selectedBean.dependencies.join(", ") : "없음"}</dd></div>
                  <div><dt>주입됨</dt><dd>{dependents.length ? dependents.map((bean) => bean.name).join(", ") : "없음"}</dd></div>
                </dl>
              </section>

              <section className="beans-panel" aria-labelledby="beans-lifecycle">
                <h2 id="beans-lifecycle">생애 단계</h2>
                {lifecycle.length === 0 ? (
                  <p className="replay-empty">refresh 기록에 이 빈의 단계가 없다.</p>
                ) : (
                  <ol className="beans-lifecycle">
                    {lifecycle.map((event) => (
                      <li key={event.seq} className={`stage-${event.kind}${event.kind === "post-process" && event.marker === "proxy" ? " is-replaced" : ""}`}>
                        <strong>{lifecycleLabels[event.kind] ?? event.kind}</strong>
                        <span>{event.detail}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              {processors.length > 0 && (
                <section className="beans-panel" aria-labelledby="beans-processors">
                  <h2 id="beans-processors">BeanPostProcessor 체인</h2>
                  <ol className="beans-processors">
                    {processors.map((result) => (
                      <li key={result.processor} className={result.replaced ? "is-replaced" : undefined}>
                        <code>{result.processor}</code>
                        <span>{result.replaced ? "프록시로 교체" : "그대로 둠"}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="replay-empty">적용 대상 애노테이션(@Transactional, @Aspect 대상, @Timed)이 있을 때만 후처리기가 빈을 바꾼다.</p>
                </section>
              )}
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
