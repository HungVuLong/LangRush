/**
 * game-core/__tests__/raceState.test.ts
 *
 * Unit tests for resolvePathChoice — 6 outcome combinations (3 paths × correct/wrong).
 * Pure logic only; no DOM, no Phaser, no React.
 */

import { describe, it, expect } from 'vitest';
import {
  createRaceState,
  resolvePathChoice,
  checkpointFromPosition,
} from '../raceState';
import { MAX_STEPS } from '../paths';

// Fixed "now" timestamp so stun assertions are deterministic.
const NOW = 1_000_000;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function stateAt(position: number) {
  return {
    ...createRaceState(),
    position,
    currentCheckpoint: checkpointFromPosition(position),
  };
}

// ---------------------------------------------------------------------------
// Easy path
// ---------------------------------------------------------------------------

describe('Easy path', () => {
  it('correct → advances +1 step, no stun, status active', () => {
    const state = stateAt(5);
    const { nextState, stepDelta, stunMs } = resolvePathChoice(
      state,
      'easy',
      true,
      NOW,
    );

    expect(nextState.position).toBe(6);
    expect(stepDelta).toBe(1);
    expect(stunMs).toBe(0);
    expect(nextState.status).toBe('active');
    expect(nextState.stunEndsAt).toBe(0);
  });

  it('wrong → stunned 1 s, position unchanged', () => {
    const state = stateAt(5);
    const { nextState, stepDelta, stunMs } = resolvePathChoice(
      state,
      'easy',
      false,
      NOW,
    );

    expect(nextState.position).toBe(5); // easy.back === 0
    expect(stepDelta).toBe(0);
    expect(stunMs).toBe(1000);
    expect(nextState.status).toBe('stunned');
    expect(nextState.stunEndsAt).toBe(NOW + 1000);
  });
});

// ---------------------------------------------------------------------------
// Medium path
// ---------------------------------------------------------------------------

describe('Medium path', () => {
  it('correct → advances +2 steps, no stun, status active', () => {
    const state = stateAt(5);
    const { nextState, stepDelta, stunMs } = resolvePathChoice(
      state,
      'medium',
      true,
      NOW,
    );

    expect(nextState.position).toBe(7);
    expect(stepDelta).toBe(2);
    expect(stunMs).toBe(0);
    expect(nextState.status).toBe('active');
    expect(nextState.stunEndsAt).toBe(0);
  });

  it('wrong → stunned 2 s, position unchanged', () => {
    const state = stateAt(5);
    const { nextState, stepDelta, stunMs } = resolvePathChoice(
      state,
      'medium',
      false,
      NOW,
    );

    expect(nextState.position).toBe(5); // medium.back === 0
    expect(stepDelta).toBe(0);
    expect(stunMs).toBe(2000);
    expect(nextState.status).toBe('stunned');
    expect(nextState.stunEndsAt).toBe(NOW + 2000);
  });
});

// ---------------------------------------------------------------------------
// Hard path
// ---------------------------------------------------------------------------

describe('Hard path', () => {
  it('correct → advances +4 steps, no stun, status active', () => {
    const state = stateAt(5);
    const { nextState, stepDelta, stunMs } = resolvePathChoice(
      state,
      'hard',
      true,
      NOW,
    );

    expect(nextState.position).toBe(9);
    expect(stepDelta).toBe(4);
    expect(stunMs).toBe(0);
    expect(nextState.status).toBe('active');
    expect(nextState.stunEndsAt).toBe(0);
  });

  it('wrong → moves back 1 step + stunned 3.5 s', () => {
    const state = stateAt(5);
    const { nextState, stepDelta, stunMs } = resolvePathChoice(
      state,
      'hard',
      false,
      NOW,
    );

    expect(nextState.position).toBe(4); // 5 - 1
    expect(stepDelta).toBe(-1);
    expect(stunMs).toBe(3500);
    expect(nextState.status).toBe('stunned');
    expect(nextState.stunEndsAt).toBe(NOW + 3500);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('Edge cases', () => {
  it('position is capped at MAX_STEPS and status becomes finished', () => {
    const state = stateAt(MAX_STEPS - 1); // one step from finish
    const { nextState } = resolvePathChoice(state, 'hard', true, NOW);

    expect(nextState.position).toBe(MAX_STEPS);
    expect(nextState.status).toBe('finished');
  });

  it('position cannot go below 0 when wrong at position 0', () => {
    const state = stateAt(0);
    const { nextState, stepDelta } = resolvePathChoice(
      state,
      'hard',
      false,
      NOW,
    );

    expect(nextState.position).toBe(0); // floored at 0
    expect(stepDelta).toBe(0);
  });

  it('checkpoint updates correctly after advancing', () => {
    // Steps 0-3 → checkpoint 0, steps 4-7 → checkpoint 1
    const state = stateAt(3);
    const { nextState } = resolvePathChoice(state, 'easy', true, NOW);

    expect(nextState.position).toBe(4);
    expect(nextState.currentCheckpoint).toBe(1);
  });
});
