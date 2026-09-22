/* LangRush — Phaser Game Scene. Solo Practice Mode. */
(function () {
  'use strict';

  const GAME_WIDTH = 640;
  const GAME_HEIGHT = 300;

  class RaceScene extends Phaser.Scene {
    constructor() {
      super('RaceScene');
      this.checkpointMarkers = [];
      this.trackGraphics = null;
      this.playerToken = null;
      this.isStunned = false;
      this.stunTimer = null;
      
      // Callbacks
      this.onCheckpointReached = null;
      this.onQuestionAnswered = null;
      this.onRaceFinished = null;
    }

    // Set the logic module from outside (app.js)
    setLogic(logicInstance) {
      this.logic = logicInstance;
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
      const TOTAL_CHECKPOINTS = window.LR.Logic.TOTAL_CHECKPOINTS;

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
      const TOTAL_CHECKPOINTS = window.LR.Logic.TOTAL_CHECKPOINTS;

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
      if (!this.playerToken || !this.logic) return;
      const state = this.logic.getState();
      
      const trackY = GAME_HEIGHT / 2;
      const trackLeft = 40;
      const trackRight = GAME_WIDTH - 40;
      const trackWidth = trackRight - trackLeft;
      
      const pct = Math.max(0, Math.min(1, state.position / state.maxSteps));
      const x = trackLeft + trackWidth * pct;
      this.tweens.add({
        targets: this.playerToken,
        x: x,
        duration: 400,
        ease: 'Cubic.easeOut'
      });
    }

    updateCheckpointMarkers() {
      if (!this.logic) return;
      const state = this.logic.getState();
      
      this.checkpointMarkers.forEach((cp, i) => {
        if (i < state.checkpoint) {
          cp.marker.setFillStyle(0x1f7a4d, 1);
          cp.label.setColor('#1f7a4d');
        } else if (i === state.checkpoint) {
          cp.marker.setFillStyle(0xff9800, 1);
          cp.label.setColor('#ff9800');
        } else {
          cp.marker.setFillStyle(0x2b5bd7, 0.6);
          cp.label.setColor('#2b5bd7');
        }
      });
    }

    updateUI() {
      if (!this.logic) return;
      const state = this.logic.getState();
      if (this.onCheckpointReached) {
        this.onCheckpointReached(state);
      }
    }

    approachCheckpoint() {
      if (!this.logic) return;
      if (this.logic.isFinished()) return;
      
      const state = this.logic.getState();
      if (this.onCheckpointReached) {
        this.onCheckpointReached({
          ...state,
          showChoice: true
        });
      }
    }

    choosePath(pathId) {
      if (!this.logic) return;
      const choice = this.logic.choosePath(pathId);
      if (!choice) return;

      if (this.onQuestionAnswered) {
        this.onQuestionAnswered({
          path: choice.path,
          question: choice.question,
          showQuestion: true
        });
      }
    }

    submitAnswer(selectedIndex) {
      if (!this.logic || this.isStunned) return;

      const result = this.logic.submitAnswer(selectedIndex);
      if (!result) return;

      this.updateTokenPosition();
      
      if (result.correct) {
        this.updateCheckpointMarkers();
      } else {
        this.triggerStun(result.path.stun);
      }

      this.updateUI();

      if (this.onQuestionAnswered) {
        this.onQuestionAnswered({
          ...result,
          showFeedback: true
        });
      }
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
      if (!this.logic) return;
      this.logic.advanceCheckpoint();
      this.updateCheckpointMarkers();

      const state = this.logic.getState();
      if (state.isFinished) {
        this.finishRace();
      } else {
        this.updateUI();
      }
    }

    finishRace() {
      if (!this.logic) return;
      if (this.onRaceFinished) {
        this.onRaceFinished(this.logic.getState());
      }
    }

    resetRace() {
      if (this.logic) {
        this.logic.reset();
      }
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
    RaceScene
  };
})();