/**
 * game-core/questionPicker.ts
 *
 * Builds a SRS-weighted question queue for a race run.
 * NO React / DOM / browser imports.
 */

import type { Question, SRSState, QuestionTier } from './types';
import { cardWeight } from './srs';

/**
 * Weighted random selection without replacement.
 * Returns `count` questions from `pool`, biased by SRS weight.
 * If pool is smaller than count, returns the whole pool (shuffled by weight).
 */
export function pickWeighted(
  pool: Question[],
  srsState: SRSState,
  currentRun: number,
  count: number,
): Question[] {
  if (pool.length === 0) return [];

  // Assign weights
  const weighted = pool.map((q) => ({
    q,
    w: cardWeight(srsState[q.id], currentRun),
  }));

  const result: Question[] = [];
  const remaining = [...weighted];
  const take = Math.min(count, pool.length);

  for (let i = 0; i < take; i++) {
    const total = remaining.reduce((s, x) => s + x.w, 0);
    let rand = Math.random() * total;
    let chosen = 0;
    for (let j = 0; j < remaining.length; j++) {
      rand -= remaining[j].w;
      if (rand <= 0) {
        chosen = j;
        break;
      }
    }
    result.push(remaining[chosen].q);
    remaining.splice(chosen, 1);
  }

  return result;
}

/**
 * Build the per-tier question queues for one race run.
 *
 * Each checkpoint will consume one question per tier from these queues.
 * We pre-build TOTAL_CHECKPOINTS questions per tier so the run never
 * runs out, cycling back through the pool if needed.
 */
export function buildRunQueues(
  allQuestions: Question[],
  srsState: SRSState,
  currentRun: number,
  checkpoints: number,
): Record<QuestionTier, Question[]> {
  const byTier: Record<QuestionTier, Question[]> = {
    easy: allQuestions.filter((q) => q.tier === 'easy'),
    medium: allQuestions.filter((q) => q.tier === 'medium'),
    hard: allQuestions.filter((q) => q.tier === 'hard'),
  };

  const result = {} as Record<QuestionTier, Question[]>;

  for (const tier of ['easy', 'medium', 'hard'] as QuestionTier[]) {
    const pool = byTier[tier];
    if (pool.length === 0) {
      result[tier] = [];
      continue;
    }

    // If pool is large enough, pick without replacement.
    // If pool is smaller than checkpoints, cycle: pick all, then pick again.
    const queue: Question[] = [];
    while (queue.length < checkpoints) {
      const need = checkpoints - queue.length;
      const picked = pickWeighted(pool, srsState, currentRun, Math.min(need, pool.length));
      queue.push(...picked);
    }
    result[tier] = queue.slice(0, checkpoints);
  }

  return result;
}
