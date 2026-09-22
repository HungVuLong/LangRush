/* Concept A — Neon Circuit — mock data.
   All in-memory. Resets on browser reload. No storage, no network, no backend.
   Japanese question content reused from prototype/mock-data.js, restructured for this concept. */
(function () {
  'use strict';

  // Namespaced under NEON to avoid any cross-concept coupling.
  const NEON = {};

  NEON.CHECKPOINTS = 6;

  // Path tiers. reward/penalty stated explicitly (icon + text pairs live in the UI layer).
  NEON.PATHS = {
    easy:   { key: 'easy',   label: 'Easy',   step: 1, stunMs: 1000, back: 0, type: 'vocab' },
    medium: { key: 'medium', label: 'Medium', step: 2, stunMs: 2000, back: 0, type: 'image' },
    hard:   { key: 'hard',   label: 'Hard',   step: 4, stunMs: 3500, back: 1, type: 'sentence' }
  };

  // Question banks per path. `answer` = index into `choices`.
  NEON.BANK = {
    easy: [
      { id: 'e1', vocab: 'ねこ',   ask: 'Translate the word 「ねこ」', choices: ['Dog', 'Cat', 'Bird', 'Fish'],   answer: 1 },
      { id: 'e2', vocab: 'みず',   ask: 'Translate the word 「みず」', choices: ['Fire', 'Water', 'Wind', 'Earth'], answer: 1 },
      { id: 'e3', vocab: 'ほん',   ask: 'Translate the word 「ほん」', choices: ['Pen', 'Desk', 'Book', 'Chair'],  answer: 2 },
      { id: 'e4', vocab: 'でんわ', ask: 'Translate the word 「でんわ」', choices: ['Phone', 'Computer', 'Camera', 'Radio'], answer: 0 }
    ],
    medium: [
      { id: 'm1', vocab: 'りんご', ask: 'Identify the word for this image', glyph: '🍎', choices: ['みかん', 'りんご', 'ぶどう', 'いちご'], answer: 1 },
      { id: 'm2', vocab: 'いぬ',   ask: 'Identify the word for this image', glyph: '🐶', choices: ['ねこ', 'とり', 'いぬ', 'うま'], answer: 2 },
      { id: 'm3', vocab: 'くるま', ask: 'Identify the word for this image', glyph: '🚗', choices: ['くるま', 'ふね', 'ひこうき', 'じてんしゃ'], answer: 0 },
      { id: 'm4', vocab: 'コーヒー', ask: 'Identify the word for this image', glyph: '☕', choices: ['みず', 'おちゃ', 'コーヒー', 'ジュース'], answer: 2 }
    ],
    hard: [
      { id: 'h1', vocab: '会議は三時に始まります', ask: 'Translate: 「会議は三時に始まります。」', choices: ['The meeting ends at three.', 'The meeting starts at three.', 'The meeting is at a hotel.', 'There is no meeting today.'], answer: 1 },
      { id: 'h2', vocab: 'このコードを確認してください', ask: 'Translate: 「このコードを確認してください。」', choices: ['Please write this code.', 'Please delete this code.', 'Please check this code.', 'Please run this code.'], answer: 2 },
      { id: 'h3', vocab: '明日までに送ります', ask: 'Translate: 「明日までに送ります。」', choices: ['I will send it by tomorrow.', 'I sent it yesterday.', 'I will call tomorrow.', 'I cannot send it.'], answer: 0 }
    ]
  };

  // In-memory account store (resets on reload).
  NEON.accounts = Object.create(null);

  window.NEON = NEON;
})();
