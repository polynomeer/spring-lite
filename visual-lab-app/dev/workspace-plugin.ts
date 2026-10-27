import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

const repoRoot = resolve(__dirname, "..", "..");
const MODULE = /^spring-lite-[a-z]+$/;
const SUITE = /^[A-Za-z0-9_.]+$/;
const SOURCE = /^spring-lite-[a-z]+\/src\/main\/java\/[A-Za-z0-9_/]+\.java$/;

interface TestCaseResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  time: number;
  message?: string;
}

function decode(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#10;/g, "\n")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Reads the handful of fields the workspace needs from a Gradle JUnit XML report. */
function parseReport(xml: string): TestCaseResult[] {
  const cases: TestCaseResult[] = [];
  const pattern = /<testcase\s+name="([^"]*)"[^>]*?time="([^"]*)"\s*(\/>|>([\s\S]*?)<\/testcase>)/g;
  for (const match of xml.matchAll(pattern)) {
    const body = match[4] ?? "";
    const failure = /<(failure|error)\s+message="([^"]*)"/.exec(body);
    cases.push({
      name: decode(match[1]),
      time: Number(match[2]),
      status: failure ? "failed" : /<skipped/.test(body) ? "skipped" : "passed",
      message: failure ? decode(failure[2]) : undefined
    });
  }
  return cases;
}

function send(res: ServerResponse, status: number, body: unknown, type = "application/json") {
  res.statusCode = status;
  res.setHeader("Content-Type", `${type}; charset=utf-8`);
  res.setHeader("Cache-Control", "no-store");
  res.end(type === "application/json" ? JSON.stringify(body) : String(body));
}

function handle(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname === "/workspace/test-results") {
    const module = url.searchParams.get("module") ?? "";
    const suite = url.searchParams.get("suite") ?? "";
    if (!MODULE.test(module) || !SUITE.test(suite)) {
      send(res, 400, { error: "invalid module or suite" });
      return;
    }
    const report = resolve(repoRoot, module, "build", "test-results", "test", `TEST-${suite}.xml`);
    if (!existsSync(report)) {
      send(res, 200, { found: false, command: `./gradlew :${module}:test --tests '${suite}'` });
      return;
    }
    send(res, 200, {
      found: true,
      modifiedAt: statSync(report).mtime.toISOString(),
      tests: parseReport(readFileSync(report, "utf8"))
    });
    return;
  }
  if (url.pathname === "/workspace/source") {
    const path = url.searchParams.get("path") ?? "";
    const file = resolve(repoRoot, path);
    if (!SOURCE.test(path) || !file.startsWith(repoRoot) || !existsSync(file)) {
      send(res, 404, "not found", "text/plain");
      return;
    }
    send(res, 200, readFileSync(file, "utf8"), "text/plain");
    return;
  }
  next();
}

/**
 * Dev-server only: lets the implementation workspace read the learner's local test reports and the
 * framework source they are editing. Nothing runs code; learners run Gradle themselves.
 */
export function workspacePlugin(): Plugin {
  return {
    name: "spring-lite-workspace",
    configureServer(server) {
      server.middlewares.use(handle);
    }
  };
}
