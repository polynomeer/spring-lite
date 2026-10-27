export interface ReviewSchedule {
  /** Leitner box: 0 after a miss, one higher after each remembered review. */
  box: number;
  /** Next review day as YYYY-MM-DD in local time. */
  due: string;
}

const STORAGE_KEY = "spring-lite-lab-reviews";

/** Reads review schedules saved in this browser, keyed by review card id. */
export function loadReviews(): Record<string, ReviewSchedule> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, ReviewSchedule>) : {};
  } catch {
    return {};
  }
}

export function saveReview(cardId: string, schedule: ReviewSchedule): Record<string, ReviewSchedule> {
  const reviews = { ...loadReviews(), [cardId]: schedule };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // Storage can be unavailable (private mode); the review still counts for this visit.
  }
  return reviews;
}
