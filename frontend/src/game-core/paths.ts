/**
 * game-core/paths.ts
 *
 * Canonical path definitions — values match the PRD exactly.
 * NO React / DOM / browser imports.
 */

import type { PathConfig } from './types';

export const PATHS: Record<string, PathConfig> = {
  easy: {
    id: 'easy',
    label: 'Easy',
    step: 1,
    stun: 1000,
    back: 0,
    icon: '▲ +1 · ⏱ 1s',
    color: 0x4caf50,
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    step: 2,
    stun: 2000,
    back: 0,
    icon: '▲ +2 · ⏱ 2s',
    color: 0xff9800,
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    step: 4,
    stun: 3500,
    back: 1,
    icon: '▲ +4 · ↩ −1 · ⏱ 3.5s',
    color: 0xf44336,
  },
};

export const TOTAL_CHECKPOINTS = 6;
export const MAX_STEPS = 24;
