/**
 * game-core/scoring.ts
 *
 * Pure functions for applying path outcomes to race position.
 * NO React / DOM / browser imports.
 */

import type { PathConfig } from './types';
import { MAX_STEPS } from './paths';

export interface PositionResult {
  newPosition: number;
  /** Steps actually gained (may differ from path.step if capped at MAX_STEPS) */
  stepsGained: number;
}

/**
 * Apply a correct answer: advance position by path.step, capped at MAX_STEPS.
 */
export function applyCorrect(
  currentPosition: number,
  path: PathConfig,
): PositionResult {
  const newPosition = Math.min(MAX_STEPS, currentPosition + path.step);
  return {
    newPosition,
    stepsGained: newPosition - currentPosition,
  };
}

/**
 * Apply a wrong answer: move back path.back steps (floored at 0).
 * Returns the new position; stun is handled separately by the caller.
 */
export function applyWrong(
  currentPosition: number,
  path: PathConfig,
): number {
  return Math.max(0, currentPosition - path.back);
}
