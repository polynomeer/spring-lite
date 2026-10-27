import learningTracks from "../../lib/learning-tracks.json";
import type { LearningProgress } from "../../lib/progress-store";

export type StageId = "concept" | "build" | "experiment" | "compare";

export interface LearningStep {
  stage: StageId;
  title: string;
  /** In-app screen that carries out this step. */
  href?: string;
  action?: string;
  /** Repository path to read when the step has no screen yet. */
  reading?: string;
  /** Activity signals that complete the step without a manual check. */
  signals?: string[];
}

export interface LearningTrack {
  id: string;
  title: string;
  subtitle: string;
  steps: LearningStep[];
}

export type StepStatus = "done" | "current" | "todo";

export const stages = learningTracks.stages as { id: StageId; label: string; summary: string }[];
export const tracks = learningTracks.tracks as LearningTrack[];

export const stageLabels = Object.fromEntries(stages.map((stage) => [stage.id, stage.label])) as Record<StageId, string>;

export function stepKey(track: string, index: number): string {
  return `${track}/${index}`;
}

export function isStepDone(progress: LearningProgress, track: LearningTrack, index: number): boolean {
  const step = track.steps[index];
  return (
    progress.completed.includes(stepKey(track.id, index)) ||
    (step.signals ?? []).some((signal) => progress.activities.includes(signal))
  );
}

/** Done steps are filled; the first unfinished step of a started track is the one in progress. */
export function stepStatuses(progress: LearningProgress, track: LearningTrack): StepStatus[] {
  const done = track.steps.map((_, index) => isStepDone(progress, track, index));
  const started = done.some(Boolean) || progress.lastStep?.track === track.id;
  const current = started ? done.indexOf(false) : -1;
  return done.map((value, index) => (value ? "done" : index === current ? "current" : "todo"));
}

export interface ContinueTarget {
  track: LearningTrack;
  index: number;
  step: LearningStep;
}

/** Resumes the last opened track at its first unfinished step, falling back to the next track with work left. */
export function continueTarget(progress: LearningProgress): ContinueTarget | null {
  const lastTrack = tracks.find((track) => track.id === progress.lastStep?.track);
  const ordered = lastTrack ? [lastTrack, ...tracks.filter((track) => track !== lastTrack)] : tracks;
  for (const track of ordered) {
    const index = track.steps.findIndex((_, stepIndex) => !isStepDone(progress, track, stepIndex));
    if (index >= 0) {
      return { track, index, step: track.steps[index] };
    }
  }
  return null;
}

export function overallProgress(progress: LearningProgress): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const track of tracks) {
    track.steps.forEach((_, index) => {
      total += 1;
      done += isStepDone(progress, track, index) ? 1 : 0;
    });
  }
  return { done, total };
}
