# LangRush — Feature Specification

> Version: v0.1 (draft, P3.3)
> Sources: product-requirements.md v0.1 (chapter-03-.../docs/), project-context.md (chapter-01-.../docs/)
> Newer human-approved decisions: NONE supplied
> Precedence: (1) newer decisions → (2) accepted PRD → (3) project context → (4) AI
> Basis tags [Confirmed]/[Assumption]/[Proposed]/[Open] carried from the PRD. Solution-light except where a decision fixes behavior.
> Explicit exclusions: password reset, email verification, SSO, social login, MCP, unsupported enhancements.

## 1. Feature Boundaries

In scope (MVP, Solo-first `[Assumption — D-003]`): account + protected access; Solo Practice race loop; checkpoints & three paths; multiple-choice questions; SRS; post-race results; profile/progress.

Out of scope: Party Mode real-time multiplayer, sabotage, matchmaking, teacher dashboards, avatar customization, runtime AI generation. `[Open/Proposed]`

## 2. Core Business Rules

- **BR-1** A player acts only on their own data; cross-player access is refused without leaking existence. `[Assumption]` (FR-4)
- **BR-2** A path's question type is fixed: Easy = vocab translation, Medium = image recognition, Hard = sentence translation. `[Confirmed hypothesis]` (FR-9)
- **BR-3** A correct answer advances by the path step value; an incorrect answer applies the path penalty. `[Proposed — D-007]` (FR-10, FR-11)
- **BR-4** The correct answer is never delivered to the client before the player submits. `[Assumption]` (FR-30)
- **BR-5** A question resolves exactly once per checkpoint visit; re-submission is rejected. Retry policy: `[Open]` (FR-14)
- **BR-6** SRS: an incorrectly answered vocabulary item resurfaces more often; a mastered one less often. `[Confirmed concept; algo Open]` (FR-16, FR-17)
- **BR-7** AI-generated questions are playable only after human review. `[Proposed — D-005]` (FR-21, FR-23)

## 3. Primary Game Lifecycle (Solo race)

States: `NOT_STARTED → IN_PROGRESS → AT_CHECKPOINT → (PATH_SELECTED → QUESTION_PRESENTED → ANSWER_RESOLVED) → IN_PROGRESS → … → FINISHED → RESULTS_REVIEWED`; plus `ABANDONED`. `[Confirmed structure; end condition Open — FR-12]`

Authoritative game state (position, checkpoint index, outcomes) is the source of truth; the client renders **direct movement** and reconciles to this state as the **status-control fallback**. `[AI interpretation — confirm]`

## 4. Registration / Login & Protected Access (FR-1–FR-5, US-1–US-3)

**Main flow — Register:** open form → enter credentials → validate → create account → start authenticated session → land on Start. `[method Open — FR-1]`

**Main flow — Login:** enter credentials → validate → session created → saved data restored.

**Main flow — Logout:** end session → protected routes redirect to login.

**Alternative flows:** identifier already in use → generic rejection, remain on form; session expires → next protected action redirects to login.

**Error flows:** invalid credentials → single generic "invalid credentials" message (no enumeration) `[Confirmed — FR-5]`; server/network error → generic error + retry, no data mutation.

**Input validation:** required non-empty fields; basic format + minimum length; exact rules `[Open]`; never reveal which field/account caused failure.

**Persistent states:** account/identity + session persist; on valid session, data restored identically after reload (FR-3, FR-29). `[Assumption]`

**UI states:** empty form · field-level validation · loading (submitting) · success (redirect) · failure (generic error banner).

**Authorization:** unauthenticated access to protected resources refused; player A cannot read/modify player B's data; failures return forbidden/not-found without detail (BR-1).

## 5. Race → Checkpoint → Path → Question (FR-6–FR-14, US-4–US-7)

**Main flow:** start race → advance on 2D track → reach checkpoint → choose one of Easy/Medium/Hard → multiple-choice question presented → select one option → submit → correct: advance by step value; incorrect: apply penalty (stun; Hard also back 1) → continue → repeat until end condition → results.

**Alternative flows:** endless/time-attack variant `[Open — FR-6/FR-12]`; time-limited question with no selection → treated per (retry/timeout policy) `[Open — FR-14]`; player abandons → `ABANDONED` (see §7 confirmation).

**Error flows:** question content fails to load → loading→error UI, retry, race paused at checkpoint; answer submission fails → optimistic direct movement is rolled back and reconciled to authoritative state (status-control fallback).

**Input validation:** exactly one option selectable; submit disabled until a selection exists; no submit after `ANSWER_RESOLVED`.

**Persistent states:** in-progress race state (position, checkpoint index, per-question outcome, elapsed) persists; on reload the player resumes at the authoritative state, not restarted (FR-3, FR-29). `[Assumption]`

**UI states:** loading (race init / question fetch) · empty (no playable questions available) · path-selection · question · success (correct feedback + advance) · failure (wrong feedback + penalty) · stunned (countdown) · finished · results.

## 6. Spaced Repetition (FR-15–FR-18, US-8)

Per-player mastery tracked per vocabulary item; missed items weighted to reappear sooner, mastered items later; state persists across sessions (observable: same schedule after logout/login). Algorithm unspecified. `[Confirmed concept; Open algo]`

## 7. Destructive Actions (intentional confirmation required)

- Abandoning an in-progress race (discards race progress) → explicit confirm step. `[Assumption]`
- Resetting progress / deleting profile if offered → explicit confirm step, and generic success/failure feedback. `[Assumption]`

No destructive action proceeds on a single incidental click.

## 8. Persistent Data States (must survive reload & logout — FR-3, FR-29)

Account/identity · active session · in-progress race state · race history · SRS state · profile/progress. Question content + answer key persist server-side; answer key withheld pre-submission (FR-30, BR-4).

## 9. Required UI States (catalogue)

Every screen defines: **loading**, **empty**, **success**, **failure/error**. Race adds **stunned** and **finished**; auth adds **field-validation**. No screen may present a blank/undefined state.

## 10. Authorization Rules

- Protected features require a valid session (FR-4).
- Ownership check on every player-scoped read/write (BR-1).
- Errors never enumerate accounts or resource existence (FR-5).

## 11. Assumptions & Explicit Exclusions

Open/assumed: D-001..D-008; auth method (FR-1); race end condition (FR-12); question retry/timeout (FR-14); SRS algorithm (FR-17); Party Mode entirely (FR-19, FR-24–27); "direct movement / status-control fallback" interpretation (§3).

Excluded: password reset, email verification, SSO, social login, MCP, unsupported enhancements.

## 12. Traceability

| Feature area | FR | US |
|---|---|---|
| Register/Login/Access | FR-1..FR-5, FR-29, FR-30 | US-1, US-2, US-3 |
| Race loop | FR-6..FR-14 | US-3, US-4, US-5, US-7 |
| Reward/penalty | FR-10, FR-11 | US-5 |
| SRS | FR-15..FR-18 | US-6 |
| Content integrity | FR-19..FR-21, FR-30 | — |
| Profile/progress | FR-28, FR-3 | US-8 |
| Party (deferred) | FR-24..FR-27 | US-9 |
