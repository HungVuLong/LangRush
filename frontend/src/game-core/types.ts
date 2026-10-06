/**
 * game-core/types.ts
 *
 * Canonical shared types for LangRush game logic.
 * NO React / DOM / browser imports — this module must be reusable
 * in the React Native WebView wrapper without modification.
 */

export type PathId = 'easy' | 'medium' | 'hard';

export interface PathConfig {
  id: PathId;
  label: string;
  /** Steps advanced on correct answer */
  step: number;
  /** Stun duration in milliseconds on wrong answer */
  stun: number;
  /** Steps moved back on wrong answer (0 for easy/medium) */
  back: number;
  /** Short display string for UI */
  icon: string;
  /** Phaser hex colour */
  color: number;
}

export type QuestionTier = PathId;

export interface Question {
  id: string;
  /** The Japanese word / phrase being tested — used as the SRS card key */
  vocab: string;
  /** Prompt shown to the player */
  prompt: string;
  /** Four answer options */
  options: [string, string, string, string];
  /** Index of the correct option (0–3) */
  correct: number;
  /** Emoji or image URL for medium-tier image questions */
  image?: string;
  /** Which difficulty tier this question belongs to */
  tier: QuestionTier;
}

// ---------------------------------------------------------------------------
// SRS
// ---------------------------------------------------------------------------

export interface SRSCard {
  /** Matches Question.id */
  questionId: string;
  /** Current review interval in "runs" (starts at 1) */
  interval: number;
  /** SM-2 ease factor (starts at 2.5) */
  easeFactor: number;
  /**
   * Run number after which this card is due again.
   * 0 = due immediately (new card or lapsed).
   */
  dueAfterRun: number;
  /** Total times answered incorrectly */
  lapses: number;
  /** Total times answered correctly */
  successes: number;
}

export type SRSState = Record<string, SRSCard>;

// ---------------------------------------------------------------------------
// Run / race
// ---------------------------------------------------------------------------

export interface RunResult {
  correct: number;
  incorrect: number;
  position: number;
  /** vocab strings of every question seen this run */
  vocabSeen: string[];
  /** question IDs answered incorrectly this run */
  missedIds: string[];
}
