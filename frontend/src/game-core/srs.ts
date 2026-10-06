/**
 * game-core/srs.ts
 *
 * Lightweight SM-2-inspired Spaced Repetition System.
 *
 * Key design decisions:
 *  - "Intervals" are measured in RUNS (not days), so the SRS adapts
 *    within a single play session as well as across sessions.
 *  - Persistence is handled by the caller (pass loadSRSState /
 *    saveSRSState a storage adapter) so this module stays DOM-free
 *    and works identically in React Native.
 *
 * NO React / DOM / browser imports.
 */

import type { SRSCard, SRSState } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_EASE = 2.5;
const MIN_EASE = 1.3;
const EASE_BONUS_CORRECT = 0.1;
const EASE_PENALTY_WRONG = 0.2;

// ---------------------------------------------------------------------------
// Card helpers
// ---------------------------------------------------------------------------

function newCard(questionId: string): SRSCard {
  return {
    questionId,
    interval: 1,
    easeFactor: INITIAL_EASE,
    dueAfterRun: 0, // due immediately (new card)
    lapses: 0,
    successes: 0,
  };
}

/**
 * Update a card after a correct answer.
 * Interval grows by easeFactor; ease factor nudges up slightly.
 */
export function updateCardCorrect(card: SRSCard, currentRun: number): SRSCard {
  const newEase = Math.min(3.0, card.easeFactor + EASE_BONUS_CORRECT);
  const newInterval = Math.round(card.interval * newEase);
  return {
    ...card,
    interval: newInterval,
    easeFactor: newEase,
    dueAfterRun: currentRun + newInterval,
    successes: card.successes + 1,
  };
}

/**
 * Update a card after a wrong answer.
 * Interval resets to 1; ease factor drops; card is due immediately.
 */
export function updateCardWrong(card: SRSCard, _currentRun: number): SRSCard {
  const newEase = Math.max(MIN_EASE, card.easeFactor - EASE_PENALTY_WRONG);
  return {
    ...card,
    interval: 1,
    easeFactor: newEase,
    dueAfterRun: 0, // due on the very next run
    lapses: card.lapses + 1,
  };
}

// ---------------------------------------------------------------------------
// State-level API
// ---------------------------------------------------------------------------

/**
 * Get or create a card for a question ID.
 */
export function getCard(state: SRSState, questionId: string): SRSCard {
  return state[questionId] ?? newCard(questionId);
}

/**
 * Apply a correct answer to the SRS state and return the updated state.
 * Pure — does not mutate the input.
 */
export function recordCorrect(
  state: SRSState,
  questionId: string,
  currentRun: number,
): SRSState {
  const card = getCard(state, questionId);
  return { ...state, [questionId]: updateCardCorrect(card, currentRun) };
}

/**
 * Apply a wrong answer to the SRS state and return the updated state.
 * Pure — does not mutate the input.
 */
export function recordWrong(
  state: SRSState,
  questionId: string,
  currentRun: number,
): SRSState {
  const card = getCard(state, questionId);
  return { ...state, [questionId]: updateCardWrong(card, currentRun) };
}

// ---------------------------------------------------------------------------
// Priority weight
// ---------------------------------------------------------------------------

/**
 * Compute the sampling weight for a question given the current run number.
 *
 * - New card (never seen):        weight = 3   (high priority)
 * - Overdue card (lapsed/missed): weight = 2 + overdueRuns (scales up)
 * - Due this run:                 weight = 2
 * - Not yet due:                  weight = 0.1 (still possible, just rare)
 */
export function cardWeight(card: SRSCard | undefined, currentRun: number): number {
  if (!card) return 3; // new card
  const overdue = currentRun - card.dueAfterRun;
  if (overdue >= 0) {
    return 2 + Math.min(overdue, 5); // cap bonus at +5 to avoid extreme skew
  }
  return 0.1;
}

// ---------------------------------------------------------------------------
// Persistence helpers (storage-adapter pattern — caller supplies read/write)
// ---------------------------------------------------------------------------

const SRS_STORAGE_KEY = 'langrush_srs_v1';
const RUN_COUNTER_KEY = 'langrush_run_count_v1';

export function loadSRSState(): SRSState {
  try {
    const raw = localStorage.getItem(SRS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SRSState) : {};
  } catch {
    return {};
  }
}

export function saveSRSState(state: SRSState): void {
  try {
    localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage quota exceeded — silently ignore
  }
}

export function loadRunCount(): number {
  try {
    return parseInt(localStorage.getItem(RUN_COUNTER_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function saveRunCount(count: number): void {
  try {
    localStorage.setItem(RUN_COUNTER_KEY, String(count));
  } catch {
    // ignore
  }
}
