# LangRush — Product Requirements Document (PRD)

> **Version:** v0.2 (draft — P3.2 reviewed; see §13 review log)
> **Derived from:** `chapter-01-ai-in-software-engineering/docs/project-brief.md`, `chapter-01-ai-in-software-engineering/docs/project-context.md`
> **Newer human decisions:** none supplied
> **Source precedence:** (1) newer human decisions → (2) approved project brief → (3) project context → (4) AI suggestions
>
> ⚠️ **Assumption discipline:** Every user story and functional requirement carries a **basis** tag. Only `[Confirmed]` items are safe to build on. `[Assumption]` / `[Proposed]` / `[Open]` items are provisional and must be confirmed by the human before P3.3 freezes them into a behavior contract. No assumption has been silently converted into a fact.

---

## 1. Purpose & Overview

LangRush is a real-time multiplayer educational web game that teaches Japanese by embedding multiple-choice **questions** into a competitive 2D race. At each **checkpoint** a **player** chooses a **path** (Easy/Medium/Hard); harder path = harder question = bigger reward + bigger penalty. It includes a **Solo Practice** mode with spaced repetition (SRS) and a **Party Mode** concept for 2–8 players. `[Confirmed as concept]`

This PRD specifies *what* the product must do at a requirements level. It is intentionally solution-light: no architecture, database schema, API design, or implementation.

## 2. Goals & Non-Goals

**Goals**
- Make Japanese vocabulary/grammar practice engaging and repeatable through gameplay. `[Assumption]` (D-002 problem statement is open)
- Deliver a playable core race loop with the three-path risk/reward mechanic. `[Confirmed structure]`
- Support spaced repetition in Solo Practice. `[Confirmed as concept]`

**Non-Goals (this document)**
- System architecture, networking design, DB schema, or code.
- Choosing a specific SRS algorithm. `[Open]`
- Runtime (live) AI question generation. `[Proposed exclusion]`

## 3. Primary User

- **Primary player:** University students studying Japanese for IT/business. `[Assumption — D-001]`
- **Secondary:** general Japanese learners. `[Assumption]`
- Terminology: **player** (not "user" in gameplay), **question** (never "card"), **vocabulary item**, **match**, **lobby**, **path**, **checkpoint**. `[Confirmed]`

## 4. MVP Scope

**In (proposed MVP):** registration/login, Solo Practice, 2D racing, three paths, vocabulary + image + sentence questions, basic SRS, Japanese dataset, progress tracking, player profile. `[Assumption — D-003 proposes Solo first]`

**Out / deferred (proposed):** sabotage items, Party Mode real-time multiplayer, public matchmaking, teacher/classroom dashboards, avatar customization, runtime AI generation. `[Proposed / Open]`

**Hard exclusions (carried forward for P3.3 auth scope):** password reset, email verification, SSO, social login, board-sharing. `[Confirmed exclusion]`

## 5. User Stories

| ID | User story | Basis |
|---|---|---|
| US-1 | As a player, I want to register an account so my learning progress is saved. | `[Assumption]` (auth method open) |
| US-2 | As a player, I want to log in so I can resume my progress and history. | `[Assumption]` |
| US-3 | As a player, I want to race on a 2D track and answer questions so practice feels like a game. | `[Confirmed structure]` |
| US-4 | As a player, at each checkpoint I want to choose Easy/Medium/Hard so I can trade risk for reward. | `[Confirmed structure; values proposed]` |
| US-5 | As a player, I want a correct answer to advance me and a wrong answer to penalize me. | `[Confirmed structure; values proposed]` |
| US-6 | As a player, I want frequently missed vocabulary items to reappear more often so I retain them. | `[Confirmed concept; algorithm open]` |
| US-7 | As a player, I want a learning-results summary after a race so I can see what I learned. | `[Assumption]` |
| US-8 | As a player, I want to track my progress and view my profile. | `[Assumption]` |
| US-9 | As a player, I want to create/join a match via room code and race others in real time. | `[Open — Party Mode]` |

### Acceptance Criteria (observable)

- **US-1 Register:** valid new credentials create an account and start an authenticated session; a duplicate identifier is rejected with a generic message (no existence leak); the new player's data namespace exists and is empty.
- **US-2 Login/out:** valid credentials restore the player's saved data; invalid credentials return a single generic "invalid credentials" error; logout ends the session and blocks protected routes.
- **US-3 Race + answer:** the player can start a race, visibly advance along the 2D track, and be presented a question to answer.
- **US-4 Choose path:** at a checkpoint the player is offered Easy/Medium/Hard, and selecting one presents that path's question type.
- **US-5 Reward/penalty:** a correct answer advances the player by the path's step value; a wrong answer applies the path's penalty (stun; Hard also moves back 1).
- **US-6 SRS:** an item answered incorrectly reappears more often in later sessions; a consistently correct item appears less often; the schedule is unchanged after logout/login.
- **US-7 Results:** after a race the player sees attempted/correct/incorrect counts and the vocabulary items touched.
- **US-8 Profile/progress:** the player can view aggregate progress tied to their own account only.
- **US-9 Party (POST-MVP):** deferred; acceptance criteria to be defined when Party Mode is approved for a build.

## 6. Functional Requirements

### A. Account & Protected Access
- **FR-1** — A person can register a player account. Auth method (email+password vs. other) is undecided. `[Open]` *(US-1)*
- **FR-2** — A registered player can authenticate (log in) and log out. `[Assumption]` *(US-2)*
- **FR-3** — A player's learning data (progress, SRS state, history, profile) is associated with their authenticated identity. (Durability is governed by FR-29.) `[Assumption]` *(US-1, US-8)*
- **FR-4** — Protected features require an authenticated session; a player may read or modify only their own data. Unauthenticated or cross-player access is refused (forbidden/not-found) and MUST NOT reveal whether the target resource exists. `[Assumption]` *(US-3)*
- **FR-5** — The following are explicitly out of scope: password reset, email verification, SSO, social login. `[Confirmed exclusion]`
- **FR-31** — Registration and login inputs are validated before submission is accepted (required fields present, basic format, minimum length); invalid input yields field-level feedback and never reveals which account/field caused an authentication failure. Exact thresholds `[Open]`. `[Assumption]` *(US-1, US-2)*
- **FR-32** — Any operation that fails due to a network/server error fails safely with no partial data mutation and can be retried; the player is shown a generic, recoverable error state. `[Assumption]`

### B. Core Race Loop (Solo Practice — proposed MVP core)
- **FR-6** — A player can start a Solo Practice session. Endless vs. time-attack selection is undecided. `[Open]` *(US-3)*
- **FR-7** — During a race the player moves along a 2D track and reaches sequential checkpoints. `[Confirmed structure]` *(US-3)*
- **FR-8** — At each checkpoint the player must choose exactly one path: Easy, Medium, or Hard. Whether all three are always available is undecided. `[Confirmed structure / Open]` *(US-4)*
- **FR-9** — Each path presents a multiple-choice question of its type: Easy = vocabulary translation; Medium = image-based recognition; Hard = sentence translation with contextually tricky distractors. `[Confirmed as hypothesis]` *(US-4)*
- **FR-10** — On a correct answer the player advances by the path's step value. Proposed values: Easy +1, Medium +2, Hard +4. `[Proposed — D-007]` *(US-5)*
- **FR-11** — On an incorrect answer the path's penalty applies. Proposed: Easy stun 1s, Medium stun 2s, Hard stun 3.5s + move back 1 step. `[Proposed — D-007]` *(US-5)*
- **FR-12** — The race ends by its end condition (fixed checkpoint count vs. endless/time-attack). `[Open]` *(US-3)*
- **FR-13** — After a race the player is shown a learning-results summary (questions attempted, correct/incorrect, vocabulary touched). Exact contents undecided. `[Assumption]` *(US-7)*
- **FR-14** — Whether a player can retry a question after answering incorrectly is undecided. `[Open]`

### C. Spaced Repetition (SRS — Solo)
- **FR-15** — The system tracks per-player mastery/performance for each vocabulary item. `[Confirmed concept]` *(US-6)*
- **FR-16** — Frequently missed vocabulary items are surfaced/reviewed more often; correctly answered items appear less often. `[Confirmed concept]` *(US-6)*
- **FR-17** — The specific SRS scheduling algorithm is not selected here. `[Open]`
- **FR-18** — SRS state persists across sessions. `[Assumption]`
- **FR-19** — Whether SRS applies in Party Mode is undecided. `[Open]`

### D. Content & Question Integrity
- **FR-20** — Questions are drawn from a Japanese content dataset spanning IT Japanese, business vocabulary, structural grammar, and Minna no Nihongo-related material. `[Confirmed as intent]`
- **FR-21** — Every question has exactly one correct answer and plausible distractors; Hard questions use contextually tricky distractors. `[Confirmed as hypothesis]`
- **FR-22** — AI may be used to generate question batches as an **internal content pipeline**, not at runtime. `[Proposed — D-005]`
- **FR-23** — AI-generated questions must pass human review before becoming playable; AI content is treated as untrusted until validated. `[Proposed — D-005]`

### E. Party Mode — POST-MVP (NOT part of the current feature spec) `[Open — D-004]`
- **FR-24** — A player can create a lobby and others can join it via a room code; 2–8 players per match. `[Proposed — D-004 / Open]` *(US-9)*
- **FR-25** — Matches run a real-time synchronized race; first to finish wins. `[Open]`
- **FR-26** — Host behavior, ready/start rules, disconnect handling, late-join, rematch, and room expiry are all undecided. `[Open]`
- **FR-27** — Sabotage items are not confirmed for MVP; if included, their number, effects, acquisition, and defense are undecided. `[Open — D-006]`

### F. Profile & Progress
- **FR-28** — A player has a profile and can view aggregate progress (e.g., vocabulary mastered, races completed). Exact fields undecided. `[Assumption]` *(US-8)*

## 7. Data & Persistence (requirements-level, solution-light)
- **FR-29** — All player data associated in FR-3 (identity link, progress, SRS state, question history, profile) persists durably and is restored identically after logout, session expiry, and page reload. `[Assumption]`
- **FR-30** — Question content and its correct answer/distractors are persisted; no correct answer is exposed to the client before the player answers. `[Assumption]`

## 8. Non-Functional Requirements (light)
- Web-based; runs in a modern browser. `[Confirmed as intent]`
- Target devices, concurrency, latency budgets, and hosting are unspecified. `[Open]`
- Tech stack (React/Phaser/Firebase/Spring Boot/PostgreSQL/Python) is a preference only, not a requirement. `[Open]`

## 9. Success Metrics (proposed)
- Repeat play rate, races completed, answer accuracy, session length, SRS review completion, and (later) measurable retention improvement. `[Assumption]`

## 10. Risks
- AI-generated Japanese may be incorrect/unnatural (content quality).
- Hard path may be unbalanced (too rewarding/punishing).
- Multiplayer synchronization / inconsistent game states.
- Difficulty labels may not match real difficulty.
- SRS may boost engagement without improving retention.
- Combined scope (learning + real-time multiplayer + racing + SRS + AI pipeline) may be too large for one MVP.
- High-quality content creation may become a bottleneck.

## 11. Traceability

| User story | Functional requirements | Related decision |
|---|---|---|
| US-1 | FR-1, FR-3 | — |
| US-2 | FR-2 | — |
| US-3 | FR-6, FR-7, FR-12 | — |
| US-4 | FR-8, FR-9 | D-007 |
| US-5 | FR-10, FR-11 | D-007 |
| US-6 | FR-15, FR-16, FR-17 | — |
| US-7 | FR-13 | — |
| US-8 | FR-28, FR-3 | — |
| US-9 | FR-24, FR-25, FR-26 | D-004, D-006 |

## 12. Open Questions (must resolve before P3.3 freezes behavior)
- **D-001** Primary player — assumed Uni IT/business.
- **D-002** Primary problem — assumed.
- **D-003** MVP mode — assumed Solo first.
- **D-004** Party size / whether Party Mode is in MVP — proposed 2–8.
- **D-005** AI content generation model (pipeline + review) — proposed.
- **D-006** Sabotage items — open.
- **D-007** Path step/stun values — proposed.
- **D-008** Product identity (learning system vs. racing game) — assumed learning-system-with-game-layer.
- Auth method (FR-1), race end condition (FR-12), question retry (FR-14), SRS algorithm (FR-17), SRS in Party Mode (FR-19), Party Mode details (FR-26).

## 13. P3.2 Review Log

**Applied (confirmed-issue + structural corrections):**
- **F1** — observable Acceptance Criteria added to §5 (US-1…US-9).
- **F3** — FR-4 rewritten with an observable "no existence leak" authorization rule.
- **F4** — FR-31 added (registration/login input validation).
- **F5** — FR-32 added (safe, non-mutating, retryable error recovery).
- **F8** — Party Mode (FR-24…FR-27) moved under an explicit POST-MVP heading (§6.E).
- **F10** — FR-3 (identity association) and FR-29 (durability) de-duplicated.

**Still OPEN — awaiting human decision (NOT applied):**
- **F2** — D-008 product identity & D-003 MVP mode remain unconfirmed assumptions.
- **F6** — D-001 primary player & D-002 primary problem remain unconfirmed assumptions.
- **F7** — no single confirmed primary success signal / target (§9).
- **F9** — FR-30 (answer key withheld pre-answer) is an AI-derived requirement; accept or drop.
