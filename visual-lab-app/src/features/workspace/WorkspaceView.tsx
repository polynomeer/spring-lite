import { useCallback, useEffect, useState } from "react";
import { fetchTestReport, fetchWorkspaceSource, runPitfall, runSandbox } from "../../lib/live-api";
import { recordActivity } from "../../lib/progress-store";
import type { SandboxNode, WorkspaceEvent, WorkspaceTestReport } from "../../lib/types";
import { workspaceReference } from "../../lib/workspace-reference";
import { layerLabels } from "../replay/replay-state";
import {
  firstDivergence,
  focusLines,
  gradleCommand,
  taskTestStatuses,
  workspaceTasks,
  type TestStatus,
  type WorkspaceTask
} from "./workspace-model";
import "../replay/replay.css";
import "../pitfalls/pitfalls.css";
import "./workspace.css";

const statusLabels: Record<TestStatus, string> = { passed: "통과", failed: "실패", skipped: "건너뜀", "not-run": "미실행" };

function sandboxTree(propagation: "REQUIRED" | "REQUIRES_NEW"): SandboxNode {
  return {
    name: "OrderService.placeOrder",
    propagation: "REQUIRED",
    steps: [
      { type: "insert", target: "orders" },
      {
        type: "call",
        catch: true,
        call: { name: "AuditService.log", propagation, steps: [{ type: "insert", target: "audit_log" }, { type: "throw" }] }
      }
    ]
  };
}

async function runFlow(task: WorkspaceTask): Promise<WorkspaceEvent[]> {
  const events = task.flow.kind === "sandbox"
    ? (await runSandbox(sandboxTree(task.flow.propagation))).events
    : (await runPitfall("circular-dependency", "broken")).events;
  return events.map(({ seq, layer, kind, marker, detail }) => ({ seq, layer, kind, marker, detail }));
}

export function WorkspaceView() {
  const [selectedId, setSelectedId] = useState(workspaceTasks[0].id);
  const [report, setReport] = useState<WorkspaceTestReport | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [mine, setMine] = useState<WorkspaceEvent[] | null>(null);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const task = workspaceTasks.find((item) => item.id === selectedId) ?? workspaceTasks[0];
  const reference = workspaceReference[task.id] ?? [];
  const statuses = taskTestStatuses(task, report);
  const allPassed = statuses.every((test) => test.status === "passed");
  const divergence = mine ? firstDivergence(reference, mine) : null;
  const focus = source ? focusLines(source, task) : [];

  const loadReport = useCallback(async () => {
    setReportError(null);
    try {
      setReport(await fetchTestReport(task.module, task.suite));
    } catch (cause) {
      setReport(null);
      setReportError(cause instanceof Error ? cause.message : String(cause));
    }
  }, [task]);

  useEffect(() => {
    setHintsShown(0);
    setMine(null);
    setFlowError(null);
    setSource(null);
    void loadReport();
    fetchWorkspaceSource(task.focus.file).then(setSource).catch(() => setSource(null));
  }, [task, loadReport]);

  useEffect(() => {
    if (report?.found && allPassed) {
      recordActivity(`workspace:${task.id}`);
    }
  }, [report, allPassed, task.id]);

  const compare = async () => {
    setRunning(true);
    setFlowError(null);
    try {
      setMine(await runFlow(task));
    } catch (cause) {
      setMine(null);
      setFlowError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRunning(false);
    }
  };

  const rows = Math.max(reference.length, mine?.length ?? 0);

  return (
    <div className="pitfalls-page">
      <section className="pitfalls-head">
        <div>
          <p className="pitfalls-crumb">학습 지도 · 구현 워크스페이스</p>
          <h1>직접 고치고, 테스트와 실행 흐름으로 확인한다</h1>
          <p className="pitfalls-lede">
            과제 코드는 IDE에서 고치고 Gradle로 테스트를 돌린다. 이 화면은 로컬 테스트 결과를 읽어 보여주고, 지금 작업 트리로 띄운 example-app의 실행 흐름을 기준 구현과 나란히 세워 처음 갈라지는 지점을 표시한다.
          </p>
        </div>
      </section>

      <div className="pitfalls-layout">
        <nav className="pitfalls-list" aria-label="과제 목록">
          {workspaceTasks.map((item) => (
            <button
              key={item.id}
              type="button"
              className="pitfalls-card"
              aria-current={item.id === task.id ? "true" : undefined}
              onClick={() => setSelectedId(item.id)}
            >
              <span className="pitfalls-tags">{item.track}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </nav>

        <section className="pitfalls-detail" aria-labelledby="workspace-title">
          <div className="pitfalls-panel">
            <span className="pitfalls-tags">{task.track} · {task.module}</span>
            <h2 id="workspace-title">{task.title}</h2>
            <p>{task.goal}</p>
            <ul className="workspace-success">
              {task.success.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div className="workspace-columns">
            <section className="pitfalls-panel" aria-labelledby="workspace-tests">
              <div className="workspace-panel-head">
                <h3 id="workspace-tests">테스트</h3>
                <button type="button" className="lab-button" onClick={() => void loadReport()}>결과 다시 읽기</button>
              </div>
              <code className="workspace-command">{gradleCommand(task)}</code>
              {reportError ? (
                <p className="replay-notice is-error">{reportError}.</p>
              ) : !report?.found ? (
                <p className="replay-empty">아직 테스트 보고서가 없다. 위 명령을 실행한 뒤 "결과 다시 읽기"를 누른다.</p>
              ) : (
                <p className="workspace-meta">보고서 시각 {new Date(report.modifiedAt ?? "").toLocaleString("ko-KR")}</p>
              )}
              <ul className="workspace-tests">
                {statuses.map((test) => (
                  <li key={test.name} className={`is-${test.status}`}>
                    <span className="workspace-status">{statusLabels[test.status]}</span>
                    <code>{test.name}</code>
                    {test.message && <pre>{test.message}</pre>}
                  </li>
                ))}
              </ul>
              {report?.found && allPassed && <p className="workspace-done">과제 테스트를 모두 통과했다. 학습 지도에 구현 단계가 완료로 남는다.</p>}
            </section>

            <section className="pitfalls-panel" aria-labelledby="workspace-hints">
              <h3 id="workspace-hints">힌트 {hintsShown} / {task.hints.length}</h3>
              <ol className="workspace-hints">
                {task.hints.slice(0, hintsShown).map((hint) => <li key={hint}>{hint}</li>)}
              </ol>
              {hintsShown < task.hints.length && (
                <button type="button" className="lab-button" onClick={() => setHintsShown((value) => value + 1)}>
                  {hintsShown === 0 ? "첫 힌트 보기" : "다음 힌트"}
                </button>
              )}
            </section>
          </div>

          <section className="pitfalls-panel" aria-labelledby="workspace-source">
            <h3 id="workspace-source">고칠 곳</h3>
            <p className="workspace-meta"><code>{task.focus.file}</code> — IDE에서 편집한다. 아래는 작업 트리의 현재 내용이다.</p>
            {focus.length > 0 ? (
              <pre className="pitfalls-code workspace-source">
                {focus.map((line) => (
                  <span key={line.number}><span className="workspace-line">{line.number}</span>{line.text}{"\n"}</span>
                ))}
              </pre>
            ) : (
              <p className="replay-empty">소스를 읽지 못했다. 개발 서버(npm run dev)에서 열었는지, 메서드 시그니처가 바뀌지 않았는지 확인하라.</p>
            )}
          </section>

          <section className="pitfalls-panel" aria-labelledby="workspace-flow">
            <div className="workspace-panel-head">
              <h3 id="workspace-flow">실행 흐름 비교</h3>
              <button type="button" className="lab-button primary" onClick={compare} disabled={running}>
                {running ? "실행 중…" : mine ? "다시 실행" : "내 구현으로 실행"}
              </button>
            </div>
            <p>{task.flow.label}. example-app을 지금 작업 트리로 다시 띄운 뒤 실행해야 내 구현이 반영된다.</p>
            {flowError && <p className="replay-notice is-error" role="alert">실행하지 못했다: {flowError}. example-app이 실행 중인지 확인하라.</p>}
            {divergence !== null && (
              <p className={`workspace-verdict${divergence < 0 ? " is-same" : " is-diff"}`} role="status">
                {divergence < 0
                  ? `기준 구현과 같은 경로로 움직였다(${reference.length}단계).`
                  : `${divergence + 1}번째 이벤트부터 갈라졌다. 기준은 ${describe(reference[divergence])}, 내 구현은 ${describe(mine?.[divergence])}.`}
              </p>
            )}
            <div className="workspace-flow" role="table" aria-label="기준 구현과 내 구현의 이벤트">
              <div className="workspace-flow-row is-head" role="row">
                <span role="columnheader">#</span>
                <span role="columnheader">기준 구현</span>
                <span role="columnheader">내 구현</span>
              </div>
              {Array.from({ length: rows }, (_, index) => {
                const state = divergence === null || divergence < 0 || index < divergence ? "" : index === divergence ? " is-first" : " is-after";
                return (
                  <div key={index} className={`workspace-flow-row${state}`} role="row">
                    <span role="cell">{index + 1}</span>
                    <FlowCell event={reference[index]} />
                    {mine ? <FlowCell event={mine[index]} /> : <span role="cell" className="workspace-flow-empty">실행 전</span>}
                  </div>
                );
              })}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

function describe(event: WorkspaceEvent | undefined): string {
  return event ? `${layerLabels[event.layer]} ${event.kind}` : "이벤트 없음";
}

function FlowCell({ event }: { event?: WorkspaceEvent }) {
  return event ? (
    <span role="cell" className="workspace-flow-cell">
      <strong>{layerLabels[event.layer]} · {event.kind}</strong>
      <small>{event.detail}</small>
    </span>
  ) : (
    <span role="cell" className="workspace-flow-empty">없음</span>
  );
}
