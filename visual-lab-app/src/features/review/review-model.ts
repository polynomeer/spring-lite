import type { PredictionRecord } from "../../lib/prediction-store";
import type { ReviewSchedule } from "../../lib/review-store";
import { outcomeLabel } from "../replay/replay-state";
import { sandboxPresets } from "../sandbox/sandbox-model";

export interface Concept {
  id: string;
  label: string;
  /** What to remember when the card comes back. */
  point: string;
  href: string;
  action: string;
}

export const concepts: Concept[] = [
  {
    id: "tx-outcome",
    label: "트랜잭션 결말",
    point: "트랜잭션 메서드가 예외로 끝나면 롤백, 정상 반환이면 커밋이다. 바깥에서 예외를 잡았는지가 아니라 프록시가 예외를 보았는지가 기준이다.",
    href: "#/replay",
    action: "리플레이로 다시 보기"
  },
  {
    id: "exception-propagation",
    label: "예외 전파와 메서드 결말",
    point: "예외는 catch를 만날 때까지 호출 스택을 거슬러 올라간다. 중간 메서드도 예외를 잡지 않으면 예외로 끝난다.",
    href: "#/replay",
    action: "리플레이로 다시 보기"
  },
  {
    id: "tx-propagation",
    label: "전파 속성과 rollback-only",
    point: "REQUIRED는 바깥 트랜잭션에 참여해 실패하면 전체를 rollback-only로 만든다. REQUIRES_NEW는 바깥을 보류하고 따로 커밋하거나 롤백한다.",
    href: "#/sandbox",
    action: "샌드박스에서 다시 조립하기"
  },
  {
    id: "tx-boundary",
    label: "트랜잭션 경계",
    point: "트랜잭션이 없으면 쓰기마다 바로 커밋된다. 뒤이은 예외가 앞선 insert를 되돌리지 못한다.",
    href: "#/sandbox",
    action: "샌드박스에서 다시 조립하기"
  }
];

const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));

/** Maps a saved prediction to the concept it tested, from the question shapes the replay and sandbox produce. */
export function conceptFor(record: PredictionRecord): Concept {
  if (record.source === "sandbox") {
    return conceptById.get(record.scenario === "sandbox:no-transaction" ? "tx-boundary" : "tx-propagation")!;
  }
  if (record.answer === "commit" || record.answer === "rollback") {
    return conceptById.get("tx-outcome")!;
  }
  return conceptById.get("exception-propagation")!;
}

export function answerLabel(value: string): string {
  return outcomeLabel(value);
}

/** Names the experiment behind a prediction; sandbox records name the preset the tree started from. */
export function scenarioLabel(record: PredictionRecord): string {
  const presetId = record.scenario.replace(/^sandbox:/, "");
  const preset = record.source === "sandbox" ? sandboxPresets.find((item) => item.id === presetId) : undefined;
  return preset?.label ?? record.scenario;
}

export interface ReviewCard {
  id: string;
  record: PredictionRecord;
  concept: Concept;
  misses: number;
}

/** One card per distinct wrong question, keeping the latest attempt and counting how often it was missed. */
export function buildCards(records: PredictionRecord[]): ReviewCard[] {
  const cards = new Map<string, ReviewCard>();
  for (const record of records) {
    if (record.correct) {
      continue;
    }
    const id = `${record.scenario}|${record.question}`;
    const existing = cards.get(id);
    cards.set(id, { id, record, concept: conceptFor(record), misses: (existing?.misses ?? 0) + 1 });
  }
  return [...cards.values()];
}

/** Leitner-style intervals in days: each remembered review moves the card one box further. */
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

export function todayKey(now = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isMastered(schedule: ReviewSchedule | undefined): boolean {
  return schedule !== undefined && schedule.box >= REVIEW_INTERVALS.length;
}

/** A card never reviewed is due today; a mastered card is never due again. */
export function isDue(schedule: ReviewSchedule | undefined, today: string): boolean {
  if (!schedule) {
    return true;
  }
  return !isMastered(schedule) && schedule.due <= today;
}

export function nextSchedule(schedule: ReviewSchedule | undefined, remembered: boolean, today: string): ReviewSchedule {
  if (!remembered) {
    return { box: 0, due: addDays(today, REVIEW_INTERVALS[0]) };
  }
  const box = (schedule?.box ?? 0) + 1;
  return { box, due: box >= REVIEW_INTERVALS.length ? today : addDays(today, REVIEW_INTERVALS[box]) };
}

export interface WeakConcept {
  concept: Concept;
  misses: number;
  attempts: number;
}

/** Concepts ordered by how many predictions about them went wrong. */
export function weakConcepts(records: PredictionRecord[]): WeakConcept[] {
  const stats = new Map<string, WeakConcept>();
  for (const record of records) {
    const concept = conceptFor(record);
    const entry = stats.get(concept.id) ?? { concept, misses: 0, attempts: 0 };
    entry.attempts += 1;
    entry.misses += record.correct ? 0 : 1;
    stats.set(concept.id, entry);
  }
  return [...stats.values()].filter((entry) => entry.misses > 0).sort((a, b) => b.misses - a.misses || b.misses / b.attempts - a.misses / a.attempts);
}
