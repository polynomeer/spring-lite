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
}

export const workspaceTasks = tasksJson as WorkspaceTask[];

export function gradleCommand(task: WorkspaceTask): string {
  return `./gradlew :${task.module}:test --tests '${task.suite}'`;
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
