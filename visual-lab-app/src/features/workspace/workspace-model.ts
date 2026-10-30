import tasksJson from "../../lib/workspace-tasks.json";
import type { WorkspaceEvent, WorkspaceTestCase, WorkspaceTestReport } from "../../lib/types";

export interface WorkspaceTask {
  id: string;
  track: string;
  title: string;
  goal: string;
  success: string[];
  module: string;
  suite: string;
  tests: string[];
  focus: { file: string; anchor: string; lines: number };
  hints: string[];
  flow: { kind: "sandbox"; propagation: "REQUIRED" | "REQUIRES_NEW"; label: string } | { kind: "pitfall"; label: string };
  /** Exact reference snippets and the stubs `npm run workspace -- start` swaps in; all live in focus.file. */
  starter: { file: string; find: string; replace: string }[];
}

export type TaskState = "reference" | "started" | "edited";

function occurrences(text: string, part: string): number {
  return text.split(part).length - 1;
}

/** Same rule as scripts/workspace-task.mjs: reference code intact, stub untouched, or the learner's own edit. */
export function taskState(task: WorkspaceTask, source: string): TaskState {
  if (task.starter.every((step) => occurrences(source, step.find) === 1)) {
    return "reference";
  }
  if (task.starter.every((step) => occurrences(source, step.replace) === 1)) {
    return "started";
  }
  return "edited";
}

export const workspaceTasks = tasksJson as WorkspaceTask[];

/** Runs only the task's own tests, so unrelated tests in the same suite never block the learner. */
export function gradleCommand(task: WorkspaceTask): string {
  const filters = task.tests.map((test) => `--tests '${task.suite}.${test.replace(/\(\)$/, "")}'`);
  return `./gradlew :${task.module}:test ${filters.join(" ")}`;
}

export type TestStatus = WorkspaceTestCase["status"] | "not-run";

/** Status of each test the task cares about; a test missing from the report has not run yet. */
export function taskTestStatuses(task: WorkspaceTask, report: WorkspaceTestReport | null): { name: string; status: TestStatus; message?: string }[] {
  return task.tests.map((name) => {
    const found = report?.tests?.find((test) => test.name === name);
    return found ? { name, status: found.status, message: found.message } : { name, status: "not-run" };
  });
}

/** Cuts the method the task is about out of the file, starting at its anchor line. */
export function focusLines(source: string, task: WorkspaceTask): { number: number; text: string }[] {
  const lines = source.split("\n");
  const start = lines.findIndex((line) => line.includes(task.focus.anchor));
  if (start < 0) {
    return [];
  }
  return lines.slice(start, start + task.focus.lines).map((text, index) => ({ number: start + index + 1, text }));
}

export function eventKey(event: WorkspaceEvent): string {
  return `${event.layer}:${event.kind}`;
}

/** Index of the first event whose layer and kind differ from the reference path, or -1 when the paths match. */
export function firstDivergence(reference: WorkspaceEvent[], mine: WorkspaceEvent[]): number {
  const shared = Math.min(reference.length, mine.length);
  for (let index = 0; index < shared; index += 1) {
    if (eventKey(reference[index]) !== eventKey(mine[index])) {
      return index;
    }
  }
  return reference.length === mine.length ? -1 : shared;
}
