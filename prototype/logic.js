window.LR = window.LR || {};

(function () {
  'use strict';

  const TOTAL_CHECKPOINTS = 6;
  const MAX_STEPS = 24;

  const PATHS = {
    easy: { id: 'easy', label: 'Easy', step: 1, stun: 1000, back: 0, color: 0x4caf50 },
    medium: { id: 'medium', label: 'Medium', step: 2, stun: 2000, back: 0, color: 0xff9800 },
    hard: { id: 'hard', label: 'Hard', step: 4, stun: 3500, back: 1, color: 0xf44336 }
  };

  class SRSManager {
    constructor() {
      this.data = this.load();
    }

    load() {
      try {
        const stored = localStorage.getItem('langrush_srs');
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    }

    save() {
      try {
        localStorage.setItem('langrush_srs', JSON.stringify(this.data));
      } catch (e) {
        console.warn('Failed to save SRS data:', e);
      }
    }

    getWeight(vocab) {
      const entry = this.data[vocab];
      if (!entry) return 10; // high priority for unseen words
      const now = Date.now();
      const elapsed = now - entry.lastReview;
      const interval = entry.interval || 1;
      
      // If elapsed time is greater than interval, high weight
      if (elapsed >= interval) {
        return Math.min(10, entry.easeFactor || 2.5);
      }
      return 0.5; // recently seen and not due
    }

    update(vocab, correct) {
      const now = Date.now();
      let entry = this.data[vocab] || { interval: 1, easeFactor: 2.5, lastReview: now, reviews: 0 };

      if (correct) {
        entry.reviews++;
        if (entry.reviews === 1) entry.interval = 1 * 24 * 60 * 60 * 1000;
        else if (entry.reviews === 2) entry.interval = 6 * 24 * 60 * 60 * 1000;
        else entry.interval = Math.round(entry.interval * entry.easeFactor);
        entry.easeFactor = Math.max(1.3, entry.easeFactor + 0.1);
      } else {
        entry.reviews = 0;
        entry.interval = 1 * 24 * 60 * 60 * 1000;
        entry.easeFactor = Math.max(1.3, entry.easeFactor - 0.2);
      }
      entry.lastReview = now;
      this.data[vocab] = entry;
      this.save();
    }
  }

  class LangRushLogic {
    constructor(dataset) {
      this.dataset = dataset || {};
      this.srs = new SRSManager();
      this.reset();
    }

    reset() {
      this.checkpoint = 0;
      this.position = 0;
      this.correct = 0;
      this.incorrect = 0;
      this.vocab = [];
      this.currentQuestion = null;
      this.currentPath = null;
    }

    isFinished() {
      return this.checkpoint >= TOTAL_CHECKPOINTS;
    }

    choosePath(pathId) {
      this.currentPath = PATHS[pathId];
      const pool = this.dataset[pathId] || [];
      if (!pool.length) return null;

      const weightedPool = pool.map(q => ({
        question: q,
        weight: this.srs.getWeight(q.vocab)
      }));

      const totalWeight = weightedPool.reduce((sum, w) => sum + w.weight, 0);
      let random = Math.random() * totalWeight;
      let selected = weightedPool[0];
      for (const w of weightedPool) {
        random -= w.weight;
        if (random <= 0) { selected = w; break; }
      }

      this.currentQuestion = selected.question;
      return {
        path: this.currentPath,
        question: this.currentQuestion
      };
    }

    submitAnswer(selectedIndex) {
      if (!this.currentQuestion) return null;

      const isCorrect = selectedIndex === this.currentQuestion.correct;
      this.vocab.push(this.currentQuestion.vocab);
      this.srs.update(this.currentQuestion.vocab, isCorrect);

      if (isCorrect) {
        this.correct++;
        this.position += this.currentPath.step;
      } else {
        this.incorrect++;
        if (this.currentPath.back) {
          this.position = Math.max(0, this.position - this.currentPath.back);
        }
      }

      const result = {
        correct: isCorrect,
        path: this.currentPath,
        question: this.currentQuestion,
        selectedIndex,
        position: this.position,
        totalCorrect: this.correct,
        totalIncorrect: this.incorrect
      };

      this.currentQuestion = null;
      return result;
    }

    advanceCheckpoint() {
      this.checkpoint++;
    }

    getState() {
      return {
        checkpoint: this.checkpoint,
        totalCheckpoints: TOTAL_CHECKPOINTS,
        position: this.position,
        maxSteps: MAX_STEPS,
        correct: this.correct,
        incorrect: this.incorrect,
        vocab: this.vocab,
        isFinished: this.isFinished()
      };
    }
  }

  window.LR.Logic = {
    LangRushLogic,
    PATHS,
    TOTAL_CHECKPOINTS,
    MAX_STEPS
  };
})();
