/**
 * game-core/raceState.ts
 *
 * RaceState model and resolvePathChoice — pure racing logic per PRD §5.1.
 * NO React / DOM / Phaser / browser imports.
 * Reusable by the React Native WebView wrapper without modification.
 */

import type { PathId } from './types';
import { PATHS, MAX_STEPS, TOTAL_CHECKPOINTS } from './paths';
import { applyCorrect, applyWrong } from './scoring';

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

export type RaceStatus = 'active' | 'stunned' | 'finished';

export interface RaceState {
  /** Current step position on the track (0 – MAX_STEPS). */
  position: number;
  /**
   * Current checkpoint index (0-based, 0 – TOTAL_CHECKPOINTS-1).
   * Derived from position but stored explicitly for quick UI reads.
   */
  currentCheckpoint: number;
  /** Whether the player can act, is stunned, or has finished the race. */
  status: RaceStatus;
  /**
   * Absolute timestamp (ms, e.g. Date.now()) at which the stun expires.
   * 0 when the player is not stunned.
   */
  stunEndsAt: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STEPS_PER_CHECKPOINT = MAX_STEPS / TOTAL_CHECKPOINTS; // 24 / 6 = 4

/** Derive checkpoint index from a step position. */
export function checkpointFromPosition(position: number): number {
  return Math.min(
    TOTAL_CHECKPOINTS - 1,
    Math.floor(position / STEPS_PER_CHECKPOINT),
  );
}

/** Create a fresh RaceState at the start line. */
export function createRaceState(): RaceState {
  return {
    position: 0,
    currentCheckpoint: 0,
    status: 'active',
    stunEndsAt: 0,
  };
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

export interface PathChoiceResult {
  /** The updated race state after applying the outcome. */
  nextState: RaceState;
  /** Steps actually moved (positive = forward, negative = backward). */
  stepDelta: number;
  /** Stun duration applied in milliseconds (0 if none). */
  stunMs: number;
}

/**
 * Resolve a player's path choice and answer correctness.
 *
 * Pure function — returns a new RaceState; never mutates the input.
 *
 * Outcomes per PRD §5.1:
 *   Easy   correct → +1 step
 *   Easy   wrong   → stunned 1 s
 *   Medium correct → +2 steps
 *   Medium wrong   → stunned 2 s
 *   Hard   correct → +4 steps
 *   Hard   wrong   → −1 step + stunned 3.5 s
 *
 * @param state     Current race state (must have status === 'active').
 * @param pathId    Which path the player chose ('easy' | 'medium' | 'hard').
 * @param isCorrect Whether the player answered correctly.
 * @param now       Current timestamp in ms (defaults to Date.now()).
 *                  Injected for deterministic testing.
 */
export function resolvePathChoice(
  state: RaceState,
  pathId: PathId,
  isCorrect: boolean,
  now: number = Date.now(),
): PathChoiceResult {
  const path = PATHS[pathId];

  let newPosition: number;
  let stepDelta: number;
  let stunMs: number;
  let newStatus: RaceStatus;
  let stunEndsAt: number;

  if (isCorrect) {
    const result = applyCorrect(state.position, path);
    newPosition = result.newPosition;
    stepDelta = result.stepsGained;
    stunMs = 0;
    stunEndsAt = 0;
    newStatus = newPosition >= MAX_STEPS ? 'finished' : 'active';
  } else {
    newPosition = applyWrong(state.position, path);
    stepDelta = newPosition - state.position; // 0 or negative
    stunMs = path.stun;
    stunEndsAt = now + stunMs;
    newStatus = 'stunned';
  }

  const nextState: RaceState = {
    position: newPosition,
    currentCheckpoint: checkpointFromPosition(newPosition),
    status: newStatus,
    stunEndsAt,
  };

  return { nextState, stepDelta, stunMs };
}
