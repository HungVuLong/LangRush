# Product Requirements Document — LangRush

**Version:** 0.1 (Draft)
**Status:** MVP Planning
**Owner:** Long (Solo Developer)

---

## 1. Overview

LangRush is a real-time multiplayer educational game (Web & Mobile) that merges gamified language learning (flashcards) with a competitive racing mechanic built on risk-vs-reward decision-making. Players race along a 2D track, choosing between question paths of increasing difficulty and reward at every checkpoint.

The MVP content focus is IT Japanese, business vocabulary, and structural grammar (based on the Minna no Nihongo curriculum), positioning the product both as a personal study tool and as a demonstrable full-stack + real-time + AI-integration portfolio project.

## 2. Problem Statement

Traditional flashcard/SRS apps (Anki, Quizlet) are effective for retention but low on engagement — they rarely create urgency or social competition, both of which are proven motivators for sustained study habits. Existing language-learning games (Duolingo) gamify progress but lack a genuine skill-based competitive layer where a player's *decision-making under time pressure* affects outcomes.

LangRush targets the gap: **spaced-repetition-backed vocabulary learning wrapped in a real competitive racing loop**, playable solo or with friends.

## 3. Goals & Success Metrics

| Goal | Metric (MVP-appropriate) |
|---|---|
| Prove the core loop is fun and replayable | Average session length ≥ 5 minutes in solo mode playtesting |
| Validate real-time multiplayer architecture | 2–4 player race with position updates perceived as "no noticeable lag" by testers |
| Demonstrate learning effectiveness | Missed-word recall rate improves across repeated SRS sessions (tracked via review history) |
| Ship a portfolio-ready, working demo | Public demo URL + at least 1 complete game mode fully playable, deployed and stable |

## 4. Target Users

- **Primary:** Vietnamese learners preparing for Japanese-language IT/business roles (self-directed study, exam prep alongside JLPT/business Japanese).
- **Secondary:** Friend group / small party players looking for a casual competitive study game (ties into the "VietNoya" personalized theming — custom avatars, in-jokes, team references).

## 5. Core Features (MVP Scope)

### 5.1 Racing Track & Checkpoint Mechanic
At each checkpoint, the player chooses one of three paths:

| Path | Format | Reward | Penalty on wrong answer |
|---|---|---|---|
| Easy | Vocabulary translation (multiple choice) | Advance 1 step | Stunned 1s |
| Medium | Image-based vocabulary guess (multiple choice) | Advance 2 steps | Stunned 2s |
| Hard | Full-sentence translation, contextual distractors | Advance 4 steps (shortcut) | Move back 1 step + Stunned 3.5s |

### 5.2 Solo Practice Mode
- Endless run / time-attack format.
- Integrated Spaced Repetition System (SRS): words the player frequently misses re-appear at increasing priority in subsequent runs.
- No real-time dependency — fully playable offline-capable on the client once questions are cached.

### 5.3 Party Mode
- 2–8 players join a lobby via a Room Code.
- Real-time race with synchronized checkpoints and positions.
- Interactive sabotage items (player-targeted effects during the race).

### 5.4 Content
- Pre-generated question bank (IT Japanese, business vocabulary, Minna no Nihongo grammar structures) produced offline via an AI content pipeline, not generated at runtime.

## 6. Non-Functional Requirements

- **Latency:** Real-time position/state updates in Party Mode must feel responsive for a checkpoint-based (not continuous-physics) race — target perceptible lag under ~300ms for state propagation.
- **Fairness / Anti-cheat:** The client must never receive the correct answer before the player submits a response; all answer validation happens server-side.
- **Data integrity:** PostgreSQL is the single source of truth for persistent data (profiles, match history, flashcard datasets). Firebase real-time state is ephemeral and must be synced to PostgreSQL at match end, not treated as permanent storage.
- **Cross-platform code reuse:** Game logic (Phaser scenes, checkpoint/path logic, scoring) must be shared between the web build and the React Native WebView wrapper — not forked per platform.
- **Deployability:** Backend and DB must run in Docker on a Linux/Ubuntu VPS behind Nginx; frontend on Vercel; mobile app built via Expo.

## 7. Technical Architecture (Summary)

| Layer | Technology |
|---|---|
| Frontend (Web) | React (Next.js/Vite) + Tailwind CSS |
| Game Engine | Phaser.js (HTML5 Canvas), embedded in React |
| Mobile | React Native + react-native-webview |
| Real-time Sync & Auth | Firebase (Realtime Database for high-frequency state, Firestore for low-frequency room metadata) |
| Backend API & DB | Spring Boot (Java) + PostgreSQL |
| AI Content Pipeline | Python + OpenAI/Claude API, batch pre-generation into DB |
| Deployment | Docker + Nginx on Ubuntu VPS (backend/DB); Vercel (frontend); Expo (mobile) |

**Key architectural rule (see `langrush-dev` skill for full detail):** Firebase Realtime Database handles high-frequency game state; PostgreSQL is authoritative for all persistent data; match-end results must be explicitly synced from Firebase into PostgreSQL via the Spring Boot API.

## 8. Out of Scope for MVP

- Ranked/competitive ELO ladder system
- In-app purchases / monetization
- Full content coverage beyond the IT Japanese / business vocabulary / Minna no Nihongo dataset
- Native (non-WebView) mobile rendering of the Phaser canvas
- Voice chat or text chat within Party Mode
- Tournament / spectator mode

## 9. Phased Roadmap

| Phase | Scope | Exit Criteria |
|---|---|---|
| **Phase 1** | Solo Practice mode, web only, no real-time dependency | Full game loop + SRS playable end-to-end |
| **Phase 2** | Party Mode, 2 players, Firebase RTDB sync, no sabotage | Two clients race in real time with correct checkpoint sync |
| **Phase 3** | Scale to 2–8 players, add sabotage items with conflict resolution | Stable 8-player lobby, sabotage resolves deterministically |
| **Phase 4** | React Native + Expo mobile wrapper | Mobile build feature-parity with web |
| **Phase 5** | Full AI-generated content dataset at scale | Complete IT Japanese / business vocabulary corpus in production DB |

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Dual-backend (Firebase + PostgreSQL) data drift | Explicit match-end sync trigger (Cloud Function → Spring Boot API), documented as an architecture guardrail |
| Firestore misuse for high-frequency updates causing cost/latency issues | Enforce Realtime Database for position/state data; Firestore reserved for low-frequency metadata only |
| WebView bridge latency on mobile affecting competitive feel | Documented known limitation; revisit only if playtesting shows it's a real problem |
| Scope too large for solo development | Phased roadmap (Section 9) ensures a playable demo exists at every stage |
| Answer/content leakage enabling client-side cheating | Server-side answer validation only; current-question-only payloads |
| Sabotage race conditions in Party Mode | First-write-wins conflict resolution at the Firebase Realtime Database layer |

## 11. Open Questions

- Firebase Auth token verification in Spring Boot: confirmed via Firebase Admin SDK — implementation not yet started.
- Sabotage item list and effects: not yet finalized (types, duration, targeting rules).
- Content review process for AI-generated tricky-distractor sentences: manual QA pass needed before Phase 5 dataset goes live.
- Analytics/telemetry: not yet decided whether to add event tracking for session length / SRS effectiveness metrics referenced in Section 3.

---

*This PRD should be revisited after Phase 1 playtesting to validate core-loop assumptions before committing further scope.*
