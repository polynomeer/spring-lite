import type { LabTraceRequest } from "./types";

const storageKey = "spring-lite.visual-lab.saved-runs.v1";
const maxSavedRuns = 8;

export interface SavedRun {
  id: string;
  request: LabTraceRequest;
  savedAt: string;
}

function readSavedRuns(): SavedRun[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SavedRun => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<SavedRun>;
      return typeof candidate.id === "string"
        && typeof candidate.savedAt === "string"
        && Boolean(candidate.request)
        && typeof candidate.request?.labId === "string"
        && typeof candidate.request?.scenario === "string"
        && (candidate.request?.mode === "static" || candidate.request?.mode === "live");
    }).slice(0, maxSavedRuns);
  } catch {
    return [];
  }
}

function writeSavedRuns(runs: SavedRun[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(runs.slice(0, maxSavedRuns)));
}

export function loadSavedRuns(): SavedRun[] {
  return readSavedRuns();
}

export function saveRun(request: LabTraceRequest): SavedRun[] {
  const run: SavedRun = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    request,
    savedAt: new Date().toISOString()
  };
  const runs = [run, ...readSavedRuns()];
  writeSavedRuns(runs);
  return runs.slice(0, maxSavedRuns);
}

export function removeSavedRun(id: string): SavedRun[] {
  const runs = readSavedRuns().filter((run) => run.id !== id);
  writeSavedRuns(runs);
  return runs;
}
