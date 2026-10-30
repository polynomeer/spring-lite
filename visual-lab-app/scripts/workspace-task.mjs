#!/usr/bin/env node
// Starts and restores implementation-workspace tasks by swapping the reference code for a starter stub.
// Usage: npm run workspace -- <list|status|start|restore|verify> [task-id] [--yes]
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(appRoot, "..");
const tasks = JSON.parse(readFileSync(resolve(appRoot, "src/lib/workspace-tasks.json"), "utf8"));

function count(text, part) {
  return text.split(part).length - 1;
}

function read(file) {
  return readFileSync(resolve(repoRoot, file), "utf8");
}

function findTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    fail(`알 수 없는 과제: ${id ?? "(없음)"}. 가능한 과제: ${tasks.map((item) => item.id).join(", ")}`);
  }
  return task;
}

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function filesOf(task) {
  return [...new Set(task.starter.map((step) => step.file))];
}

/** "reference" while every original snippet is present, "started" while every stub is untouched, otherwise "edited". */
function taskState(task) {
  const sources = new Map(filesOf(task).map((file) => [file, read(file)]));
  if (task.starter.every((step) => count(sources.get(step.file), step.find) === 1)) {
    return "reference";
  }
  if (task.starter.every((step) => count(sources.get(step.file), step.replace) === 1)) {
    return "started";
  }
  return "edited";
}

function swap(task, from, to) {
  const sources = new Map(filesOf(task).map((file) => [file, read(file)]));
  for (const step of task.starter) {
    const text = sources.get(step.file);
    if (count(text, step[from]) !== 1) {
      fail(`${step.file}에서 바꿀 부분을 정확히 한 번 찾지 못했다. 코드가 바뀌었다면 workspace-tasks.json의 starter를 갱신한다.`);
    }
    sources.set(step.file, text.replace(step[from], () => step[to]));
  }
  for (const [file, text] of sources) {
    writeFileSync(resolve(repoRoot, file), text);
  }
}

function start(task) {
  const state = taskState(task);
  if (state === "started") {
    console.log(`이미 시작한 과제다: ${task.id}`);
    return;
  }
  if (state === "edited") {
    fail(`${task.id}의 대상 코드가 이미 수정되어 있다. 먼저 'npm run workspace -- restore ${task.id} --yes'로 되돌린다.`);
  }
  swap(task, "find", "replace");
  console.log(`✓ ${task.title} 시작: 기준 구현을 스텁으로 바꿨다.`);
  for (const file of filesOf(task)) {
    console.log(`  고칠 파일  ${file}`);
  }
  const filters = task.tests.map((test) => `--tests '${task.suite}.${test.replace(/\(\)$/, "")}'`).join(" ");
  console.log(`  테스트     ./gradlew :${task.module}:test ${filters}`);
  console.log("  흐름 비교  example-app을 다시 띄운 뒤 워크스페이스에서 \"내 구현으로 실행\"");
}

function restore(task, confirmed) {
  const state = taskState(task);
  if (state === "reference") {
    console.log(`이미 기준 구현 상태다: ${task.id}`);
    return;
  }
  if (state === "started") {
    swap(task, "replace", "find");
    console.log(`✓ ${task.id}: 스텁을 기준 구현으로 되돌렸다.`);
    return;
  }
  const files = filesOf(task);
  if (!confirmed) {
    fail(`대상 코드를 직접 고친 상태라 파일 전체를 git에서 되돌려야 한다. 이 파일들의 커밋되지 않은 변경이 모두 사라진다:\n  ${files.join("\n  ")}\n다시 실행: npm run workspace -- restore ${task.id} --yes`);
  }
  execFileSync("git", ["restore", "--", ...files], { cwd: repoRoot, stdio: "inherit" });
  console.log(`✓ ${task.id}: ${files.length}개 파일을 커밋된 상태로 되돌렸다.`);
}

/** Fails when a starter no longer matches the code in either state, so drift is caught at build time. */
function verify() {
  const problems = [];
  for (const task of tasks) {
    for (const step of task.starter) {
      const text = read(step.file);
      if (count(text, step.find) !== 1 && count(text, step.replace) !== 1) {
        problems.push(`${task.id}: ${step.file}`);
      }
    }
  }
  if (problems.length > 0) {
    fail(`워크스페이스 starter가 현재 코드와 맞지 않는다:\n  ${problems.join("\n  ")}`);
  }
  console.log(`✓ 워크스페이스 과제 ${tasks.length}개의 starter가 현재 코드와 맞는다.`);
}

const stateLabels = { reference: "기준 구현", started: "시작함(스텁)", edited: "작업 중" };

const [command, id] = process.argv.slice(2);
const confirmed = process.argv.includes("--yes");
switch (command) {
  case "list":
  case "status":
    for (const task of tasks) {
      console.log(`${task.id.padEnd(16)} ${stateLabels[taskState(task)].padEnd(10)} ${task.title}`);
    }
    break;
  case "start":
    start(findTask(id));
    break;
  case "restore":
    restore(findTask(id), confirmed);
    break;
  case "verify":
    verify();
    break;
  default:
    console.log("사용법: npm run workspace -- <list|status|start|restore|verify> [과제 id] [--yes]");
    process.exit(command ? 1 : 0);
}
