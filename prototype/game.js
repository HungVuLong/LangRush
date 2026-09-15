/* LangRush — Phaser Game Scene. Solo Practice Mode. */
(function () {
  'use strict';

  const GAME_WIDTH = 640;
  const GAME_HEIGHT = 300;
  const TOTAL_CHECKPOINTS = 6;
  const MAX_STEPS = 24;

  const PATHS = {
    easy: { id: 'easy', label: 'Easy', step: 1, stun: 1000, back: 0, color: 0x4caf50 },
    medium: { id: 'medium', label: 'Medium', step: 2, stun: 2000, back: 0, color: 0xff9800 },
    hard: { id: 'hard', label: 'Hard', step: 4, stun: 3500, back: 1, color: 0xf44336 }
  };

  class RaceScene extends Phaser.Scene {
    constructor() {
      super('RaceScene');
      this.checkpoint = 0;
      this.position = 0;
      this.correct = 0;
      this.incorrect = 0;
      this.vocab = [];
      this.currentQuestion = null;
      this.currentPath = null;
      this.playerToken = null;
      this.checkpointMarkers = [];
      this.trackGraphics = null;
      this.isStunned = false;
      this.stunTimer = null;
      this.onCheckpointReached = null;
      this.onQuestionAnswered = null;
      this.onRaceFinished = null;
      this.srsData = this.loadSRS();
    }

    loadSRS() {
      try {
        const stored = localStorage.getItem('langrush_srs');
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    }

    saveSRS() {
      try {
        localStorage.setItem('langrush_srs', JSON.stringify(this.srsData));
      } catch (e) {
        console.warn('Failed to save SRS data:', e);
      }
    }

    getSRSWeight(vocab) {
      const data = this.srsData[vocab];
      if (!data) return 1;
      const now = Date.now();
      const elapsed = now - data.lastReview;
      const interval = data.interval || 1;
      if (elapsed >= interval) {
        return Math.min(10, data.easeFactor || 2.5);
      }
      return 0.5;
    }

    updateSRS(vocab, correct) {
      const now = Date.now();
      let data = this.srsData[vocab] || { interval: 1, easeFactor: 2.5, lastReview: now, reviews: 0 };

      if (correct) {
        data.reviews++;
        if (data.reviews === 1) data.interval = 1 * 24 * 60 * 60 * 1000;
        else if (data.reviews === 2) data.interval = 6 * 24 * 60 * 60 * 1000;
        else data.interval = Math.round(data.interval * data.easeFactor);
        data.easeFactor = Math.max(1.3, data.easeFactor + 0.1);
      } else {
        data.reviews = 0;
        data.interval = 1 * 24 * 60 * 60 * 1000;
        data.easeFactor = Math.max(1.3, data.easeFactor - 0.2);
      }
      data.lastReview = now;
      this.srsData[vocab] = data;
      this.saveSRS();
    }

    preload() {
      this.load.image('token', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIzMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+8J+OiDwvdGV4dD48L3N2Zz4=');
      this.load.image('flag', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIzMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+8J+PuDwvdGV4dD48L3N2Zz4=');
    }

    create() {
      this.createTrack();
      this.createCheckpointMarkers();
      this.createPlayerToken();
      this.createFlag();
      this.updateUI();
    }

    createTrack() {
      this.trackGraphics = this.add.graphics();
      this.drawTrack();
    }

    drawTrack() {
      const g = this.trackGraphics;
      g.clear();

      const trackY = GAME_HEIGHT / 2;
      const trackLeft = 40;
      const trackRight = GAME_WIDTH - 40;
      const trackWidth = trackRight - trackLeft;

      g.lineStyle(4, 0x333842);
      g.beginPath();
      g.moveTo(trackLeft, trackY);
      g.lineTo(trackRight, trackY);
      g.strokePath();

      g.lineStyle(2, 0x2b5bd7, 0.6);
      for (let i = 1; i <= TOTAL_CHECKPOINTS; i++) {
        const x = trackLeft + (trackWidth * i / (TOTAL_CHECKPOINTS + 1));
        g.beginPath();
        g.moveTo(x, trackY - 10);
        g.lineTo(x, trackY + 10);
        g.strokePath();
      }
    }

    createCheckpointMarkers() {
      const trackY = GAME_HEIGHT / 2;
      const trackLeft = 40;
      const trackRight = GAME_WIDTH - 40;
      const trackWidth = trackRight - trackLeft;

      for (let i = 1; i <= TOTAL_CHECKPOINTS; i++) {
        const x = trackLeft + (trackWidth * i / (TOTAL_CHECKPOINTS + 1));
        const marker = this.add.circle(x, trackY, 8, 0x2b5bd7, 0.6);
        marker.setStrokeStyle(2, 0x2b5bd7);
        const label = this.add.text(x, trackY - 25, `CP${i}`, {
          fontSize: '12px',
          color: '#2b5bd7',
          fontFamily: 'system-ui'
        }).setOrigin(0.5);
        this.checkpointMarkers.push({ marker, label, x, checkpoint: i });
      }
    }

    createPlayerToken() {
      const trackY = GAME_HEIGHT / 2;
      const trackLeft = 40;
      this.playerToken = this.add.image(trackLeft, trackY, 'token').setScale(0.5);
      this.playerToken.setDepth(10);
    }

    createFlag() {
      const trackY = GAME_HEIGHT / 2;
      const trackRight = GAME_WIDTH - 40;
      this.add.image(trackRight, trackY, 'flag').setScale(0.5);
    }

    updateTokenPosition() {
      if (!this.playerToken) return;
      const trackY = GAME_HEIGHT / 2;
      const trackLeft = 40;
      const trackRight = GAME_WIDTH - 40;
      const trackWidth = trackRight - trackLeft;
      const pct = Math.max(0, Math.min(1, this.position / MAX_STEPS));
      const x = trackLeft + trackWidth * pct;
      this.tweens.add({
        targets: this.playerToken,
        x: x,
        duration: 400,
        ease: 'Cubic.easeOut'
      });
    }

    updateCheckpointMarkers() {
      this.checkpointMarkers.forEach((cp, i) => {
        if (i < this.checkpoint) {
          cp.marker.setFillStyle(0x1f7a4d, 1);
          cp.label.setColor('#1f7a4d');
        } else if (i === this.checkpoint) {
          cp.marker.setFillStyle(0xff9800, 1);
          cp.label.setColor('#ff9800');
        } else {
          cp.marker.setFillStyle(0x2b5bd7, 0.6);
          cp.label.setColor('#2b5bd7');
        }
      });
    }

    updateUI() {
      if (this.onCheckpointReached) {
        this.onCheckpointReached({
          checkpoint: this.checkpoint + 1,
          total: TOTAL_CHECKPOINTS,
          position: this.position,
          correct: this.correct,
          incorrect: this.incorrect
        });
      }
    }

    approachCheckpoint() {
      if (this.checkpoint >= TOTAL_CHECKPOINTS) return;
      if (this.onCheckpointReached) {
        this.onCheckpointReached({
          checkpoint: this.checkpoint + 1,
          total: TOTAL_CHECKPOINTS,
          position: this.position,
          correct: this.correct,
          incorrect: this.incorrect,
          showChoice: true
        });
      }
    }

    choosePath(pathId) {
      this.currentPath = PATHS[pathId];
      const pool = window.LR?.questions?.[pathId] || [];
      if (!pool.length) return;

      const weightedPool = pool.map(q => ({
        question: q,
        weight: this.getSRSWeight(q.vocab)
      }));

      const totalWeight = weightedPool.reduce((sum, w) => sum + w.weight, 0);
      let random = Math.random() * totalWeight;
      let selected = weightedPool[0];
      for (const w of weightedPool) {
        random -= w.weight;
        if (random <= 0) { selected = w; break; }
      }

      this.currentQuestion = selected.question;
      if (this.onQuestionAnswered) {
        this.onQuestionAnswered({
          path: this.currentPath,
          question: this.currentQuestion,
          showQuestion: true
        });
      }
    }

    submitAnswer(selectedIndex) {
      if (!this.currentQuestion || this.isStunned) return;

      const correct = selectedIndex === this.currentQuestion.correct;
      this.vocab.push(this.currentQuestion.vocab);
      this.updateSRS(this.currentQuestion.vocab, correct);

      if (correct) {
        this.correct++;
        this.position += this.currentPath.step;
        this.updateTokenPosition();
        this.updateCheckpointMarkers();
      } else {
        this.incorrect++;
        if (this.currentPath.back) {
          this.position = Math.max(0, this.position - this.currentPath.back);
          this.updateTokenPosition();
        }
        this.triggerStun(this.currentPath.stun);
      }

      this.updateUI();

      if (this.onQuestionAnswered) {
        this.onQuestionAnswered({
          correct,
          path: this.currentPath,
          question: this.currentQuestion,
          selectedIndex,
          showFeedback: true
        });
      }

      this.currentQuestion = null;
    }

    triggerStun(ms) {
      this.isStunned = true;
      if (this.stunTimer) this.stunTimer.remove();
      this.stunTimer = this.time.delayedCall(ms, () => {
        this.isStunned = false;
        if (this.onQuestionAnswered) {
          this.onQuestionAnswered({ stunEnded: true });
        }
      });
    }

    continueRace() {
      this.checkpoint++;
      this.updateCheckpointMarkers();

      if (this.checkpoint >= TOTAL_CHECKPOINTS) {
        this.finishRace();
      } else {
        this.updateUI();
      }
    }

    finishRace() {
      if (this.onRaceFinished) {
        this.onRaceFinished({
          correct: this.correct,
          incorrect: this.incorrect,
          position: this.position,
          vocab: this.vocab
        });
      }
    }

    resetRace() {
      this.checkpoint = 0;
      this.position = 0;
      this.correct = 0;
      this.incorrect = 0;
      this.vocab = [];
      this.currentQuestion = null;
      this.currentPath = null;
      this.isStunned = false;
      if (this.stunTimer) this.stunTimer.remove();
      if (this.playerToken) {
        this.playerToken.x = 40;
      }
      this.updateCheckpointMarkers();
      this.updateUI();
    }
  }

  window.LR = window.LR || {};
  window.LR.Game = {
    RaceScene,
    PATHS,
    TOTAL_CHECKPOINTS,
    MAX_STEPS
  };
})();