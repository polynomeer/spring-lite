import { useId } from "react";
import type { SandboxNode, SandboxPropagation, SandboxStep, SandboxTable } from "../../lib/types";
import { MAX_CALL_DEPTH, propagationLabels, sandboxTables } from "./sandbox-model";

interface NodeEditorProps {
  node: SandboxNode;
  depth: number;
  onChange: (node: SandboxNode) => void;
}

const newCall = (depth: number): SandboxStep => ({
  type: "call",
  catch: false,
  call: { name: `Service${depth + 1}.work`, propagation: "REQUIRED", steps: [{ type: "insert", target: "audit_log" }] }
});

/** Edits one method of the sandbox call tree; nested calls render another editor inside. */
export function NodeEditor({ node, depth, onChange }: NodeEditorProps) {
  const id = useId();
  const replaceStep = (index: number, step: SandboxStep) =>
    onChange({ ...node, steps: node.steps.map((current, position) => (position === index ? step : current)) });
  const removeStep = (index: number) => onChange({ ...node, steps: node.steps.filter((_, position) => position !== index) });
  const addStep = (step: SandboxStep) => onChange({ ...node, steps: [...node.steps, step] });

  return (
    <div className={`sandbox-node propagation-${node.propagation.toLowerCase()}`}>
      <div className="sandbox-node-head">
        <label className="sandbox-inline-field">
          <span>메서드</span>
          <input
            value={node.name}
            onChange={(event) => onChange({ ...node, name: event.target.value })}
            pattern="[A-Za-z][A-Za-z0-9_.]{0,47}"
            spellCheck={false}
          />
        </label>
        <label className="sandbox-inline-field">
          <span>전파</span>
          <select value={node.propagation} onChange={(event) => onChange({ ...node, propagation: event.target.value as SandboxPropagation })}>
            {(Object.keys(propagationLabels) as SandboxPropagation[]).map((propagation) => (
              <option key={propagation} value={propagation}>{propagationLabels[propagation]}</option>
            ))}
          </select>
        </label>
      </div>

      <ol className="sandbox-steps">
        {node.steps.map((step, index) => (
          <li key={`${id}-${index}`} className={`sandbox-step step-${step.type}`}>
            {step.type === "insert" && (
              <div className="sandbox-step-row">
                <code>insert into</code>
                <select
                  aria-label="대상 테이블"
                  value={step.target}
                  onChange={(event) => replaceStep(index, { type: "insert", target: event.target.value as SandboxTable })}
                >
                  {sandboxTables.map((table) => <option key={table} value={table}>{table}</option>)}
                </select>
                <RemoveButton onClick={() => removeStep(index)} />
              </div>
            )}
            {step.type === "throw" && (
              <div className="sandbox-step-row">
                <code>throw new RuntimeException()</code>
                <RemoveButton onClick={() => removeStep(index)} />
              </div>
            )}
            {step.type === "call" && (
              <div className="sandbox-call">
                <div className="sandbox-step-row">
                  <code>{step.catch ? "try {" : "call"}</code>
                  <label className="sandbox-check">
                    <input type="checkbox" checked={step.catch} onChange={(event) => replaceStep(index, { ...step, catch: event.target.checked })} />
                    바깥에서 catch
                  </label>
                  <RemoveButton onClick={() => removeStep(index)} />
                </div>
                <NodeEditor node={step.call} depth={depth + 1} onChange={(call) => replaceStep(index, { ...step, call })} />
                {step.catch && <code className="sandbox-catch-tail">{"} catch (RuntimeException e) { /* 삼킨다 */ }"}</code>}
              </div>
            )}
          </li>
        ))}
      </ol>

      <div className="sandbox-add">
        <button type="button" className="lab-button" onClick={() => addStep({ type: "insert", target: "orders" })}>+ insert</button>
        <button type="button" className="lab-button" onClick={() => addStep(newCall(depth))} disabled={depth >= MAX_CALL_DEPTH}>+ 호출</button>
        <button type="button" className="lab-button" onClick={() => addStep({ type: "throw" })}>+ 예외</button>
      </div>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="sandbox-remove" onClick={onClick} aria-label="단계 삭제">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
    </button>
  );
}
