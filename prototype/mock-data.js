/* LangRush prototype — mock data. All in-memory; resets on browser reload. No storage, no network. */
window.LR = window.LR || {};

LR.config = {
  checkpoints: 6,
  maxSteps: 24, // 6 checkpoints * max 4 steps — used only to scale the track token
  paths: {
    easy:   { id: 'easy',   label: 'Easy',   step: 1, stun: 1000, back: 0, icon: '\u25B2 +1 \u00B7 \u23F1 1s' },
    medium: { id: 'medium', label: 'Medium', step: 2, stun: 2000, back: 0, icon: '\u25B2 +2 \u00B7 \u23F1 2s' },
    hard:   { id: 'hard',   label: 'Hard',   step: 4, stun: 3500, back: 1, icon: '\u25B2 +4 \u00B7 \u21A9 \u22121 \u00B7 \u23F1 3.5s' }
  }
};

/* Question bank. correct = index into options.
   Easy = vocabulary translation, Medium = image (emoji placeholder) recognition, Hard = sentence translation. */
LR.questions = {
  easy: [
    { id: 'e1', vocab: '\u306D\u3053',   prompt: 'Translate the word: \u300C\u306D\u3053\u300D',   options: ['Dog', 'Cat', 'Bird', 'Fish'],          correct: 1 },
    { id: 'e2', vocab: '\u307F\u305A',   prompt: 'Translate the word: \u300C\u307F\u305A\u300D',   options: ['Fire', 'Water', 'Wind', 'Earth'],        correct: 1 },
    { id: 'e3', vocab: '\u307B\u3093',   prompt: 'Translate the word: \u300C\u307B\u3093\u300D',   options: ['Pen', 'Desk', 'Book', 'Chair'],          correct: 2 },
    { id: 'e4', vocab: '\u3067\u3093\u308F', prompt: 'Translate the word: \u300C\u3067\u3093\u308F\u300D', options: ['Phone', 'Computer', 'Camera', 'Radio'], correct: 0 }
  ],
  medium: [
    { id: 'm1', vocab: '\u308A\u3093\u3054', prompt: 'Identify the word for this image:', image: '\uD83C\uDF4E', options: ['\u307F\u304B\u3093', '\u308A\u3093\u3054', '\u3076\u3069\u3046', '\u3044\u3061\u3054'], correct: 1 },
    { id: 'm2', vocab: '\u3044\u306C',       prompt: 'Identify the word for this image:', image: '\uD83D\uDC36', options: ['\u306D\u3053', '\u3068\u308A', '\u3044\u306C', '\u3046\u307E'],       correct: 2 },
    { id: 'm3', vocab: '\u304F\u308B\u307E', prompt: 'Identify the word for this image:', image: '\uD83D\uDE97', options: ['\u304F\u308B\u307E', '\u3075\u306D', '\u3072\u3053\u3046\u304D', '\u3058\u3066\u3093\u3057\u3083'], correct: 0 },
    { id: 'm4', vocab: '\u30B3\u30FC\u30D2\u30FC', prompt: 'Identify the word for this image:', image: '\u2615', options: ['\u307F\u305A', '\u304A\u3061\u3083', '\u30B3\u30FC\u30D2\u30FC', '\u30B8\u30E5\u30FC\u30B9'], correct: 2 }
  ],
  hard: [
    { id: 'h1', vocab: '\u4F1A\u8B70\u306F\u4E09\u6642\u306B\u59CB\u307E\u308A\u307E\u3059', prompt: 'Translate: \u300C\u4F1A\u8B70\u306F\u4E09\u6642\u306B\u59CB\u307E\u308A\u307E\u3059\u3002\u300D', options: ['The meeting ends at three.', 'The meeting starts at three.', 'The meeting is at a hotel.', 'There is no meeting today.'], correct: 1 },
    { id: 'h2', vocab: '\u3053\u306E\u30B3\u30FC\u30C9\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044', prompt: 'Translate: \u300C\u3053\u306E\u30B3\u30FC\u30C9\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u300D', options: ['Please write this code.', 'Please delete this code.', 'Please check this code.', 'Please run this code.'], correct: 2 },
    { id: 'h3', vocab: '\u660E\u65E5\u307E\u3067\u306B\u9001\u308A\u307E\u3059', prompt: 'Translate: \u300C\u660E\u65E5\u307E\u3067\u306B\u9001\u308A\u307E\u3059\u3002\u300D', options: ['I will send it by tomorrow.', 'I sent it yesterday.', 'I will call tomorrow.', 'I cannot send it.'], correct: 0 }
  ]
};

/* In-memory account store (resets on reload). */
LR.accounts = Object.create(null);
