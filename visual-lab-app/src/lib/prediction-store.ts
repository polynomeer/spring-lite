export interface PredictionRecord {
  scenario: string;
  source: string;
  eventSeq: number;
  question: string;
  choice: string;
  answer: string;
  correct: boolean;
  at: string;
}

const STORAGE_KEY = "spring-lite-lab-predictions";
const MAX_RECORDS = 200;

/** Reads predictions saved in this browser; an unavailable store reads as empty. */
export function loadPredictions(): PredictionRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as PredictionRecord[]) : [];
  } catch {
    return [];
  }
}

/** Appends one prediction and returns the updated list, keeping only the most recent records. */
export function savePrediction(record: PredictionRecord): PredictionRecord[] {
  const records = [...loadPredictions(), record].slice(-MAX_RECORDS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Storage can be unavailable (private mode); the prediction still counts for this visit.
  }
  return records;
}
