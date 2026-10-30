export interface LearningProgress {
  /** Signals left by lab screens, e.g. "sandbox:run" or "pitfall:self-invocation". */
  activities: string[];
  /** Step keys ("track/index") the learner marked done by hand. */
  completed: string[];
  /** The step the learner last opened from the map, for "continue where you left off". */
  lastStep: { track: string; index: number; at: string } | null;
}

const STORAGE_KEY = "spring-lite-lab-progress";

const emptyProgress: LearningProgress = { activities: [], completed: [], lastStep: null };

/** Reads progress saved in this browser; an unavailable or malformed store reads as empty. */
export function loadProgress(): LearningProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<LearningProgress>) : {};
    return {
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      lastStep: parsed.lastStep ?? null
    };
  } catch {
    return { ...emptyProgress };
  }
}

function saveProgress(progress: LearningProgress): LearningProgress {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage can be unavailable (private mode); progress then lasts only for this visit.
  }
  return progress;
}

/** Remembers that a lab screen produced a learning signal. Recording the same signal twice is a no-op. */
export function recordActivity(...signals: string[]): void {
  const progress = loadProgress();
  const missing = signals.filter((signal) => !progress.activities.includes(signal));
  if (missing.length > 0) {
    saveProgress({ ...progress, activities: [...progress.activities, ...missing] });
  }
}

export function setStepCompleted(key: string, done: boolean): LearningProgress {
  const progress = loadProgress();
  const completed = progress.completed.filter((item) => item !== key);
  return saveProgress({ ...progress, completed: done ? [...completed, key] : completed });
}

const STARTED_KEY = "spring-lite-lab-workspace-started";

/** Workspace tasks this browser has seen in a started or edited state, so a passing reference build is not counted. */
export function loadStartedTasks(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STARTED_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function markTaskStarted(id: string): void {
  const started = loadStartedTasks();
  if (!started.includes(id)) {
    try {
      window.localStorage.setItem(STARTED_KEY, JSON.stringify([...started, id]));
    } catch {
      // Storage can be unavailable (private mode); completion then needs the task to be started again.
    }
  }
}

export function rememberLastStep(track: string, index: number): LearningProgress {
  return saveProgress({ ...loadProgress(), lastStep: { track, index, at: new Date().toISOString() } });
}
