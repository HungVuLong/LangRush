# LangRush — Product Design Brief

> Version: v1.0 (P4.1) — supersedes the earlier improvised brief
> Sources: product-requirements.md v0.2, feature-specification.md · References: none supplied
> Precedence: human product decisions → PRD & feature spec → inspected references → AI
> Scope: Solo MVP (Party Mode = POST-MVP). This is the interaction contract, decided BEFORE visual style (explored in P4.2). Assumptions kept tagged.
> Terminology: Question · Path · Checkpoint · Match · Lobby.

## 1. User Struggle & Core Product Goal
- Struggle: effective Japanese practice (flashcards/drills) is boring, so learners don't repeat it enough. `[Assumption — D-002]`
- Goal: make repeated practice engaging through a fast race loop with legible risk/reward. Identity = learning system with a game layer. `[Assumption — D-008]`
- Primary player: university students studying Japanese for IT/business. `[Assumption — D-001]`

## 2. Session Entry (Login / Register)
- MVP entry = Login/Register only: labelled fields, inline validation, loading state, **simulated** auth in prototype, single generic error (no account/field enumeration). Session persists; logout ends it; protected screens require auth. (FR-1..FR-5, FR-31; US-1..US-3)
- **POST-MVP:** Party **Lobby** / room-code join — excluded from this contract per PRD §6.E. `[Open — D-004]`

## 3. Race Contract & Checkpoint Decision Flow
- Lifecycle (feature-spec §3): NOT_STARTED → IN_PROGRESS → AT_CHECKPOINT → (PATH_SELECTED → QUESTION_PRESENTED → ANSWER_RESOLVED) → … → FINISHED → RESULTS_REVIEWED (+ ABANDONED).
- Fixed checkpoint count, default 6. `[Open — FR-12]`
- At each **Checkpoint** the player selects one **Path**; each Path states its reward AND penalty explicitly, never by color alone.
- Path values `[Proposed — D-007]`: Easy +1 / stun 1s · Medium +2 / stun 2s · Hard +4 / −1 / stun 3.5s.

## 4. Question Modal & Multiple-Choice Evaluation States
- Centered modal, **Question** is the focal point; four options labelled A/B/C/D; single-select; submit disabled until a choice exists; operable by keyboard (A/B/C/D + Enter) and touch.
- Correct answer is never delivered to the client before submit. `[Assumption — FR-30]`
- Evaluation states: `idle → selected → submitted (locked) → resolved` (correct/incorrect shown via icon + label).

## 5. Feedback, Stuns, Recovery & Retry
- Correct → brief boost + advance by step value → continue.
- Incorrect → **stun** for the Path's duration; recovery = a countdown that re-enables "Continue" when it elapses; Hard also moves back 1. Reduced-motion: no shake, countdown still functional.
- Retry behavior `[Open — FR-14]`: default = penalty-then-continue (no re-answer of the same Question); a fresh run resets from Home.

## 6. Required UI States (per screen)
loading · empty · error · disabled · focus (visible) · keyboard · touch · narrow-view (mobile reflow) · reduced-motion. Race adds **stunned** + **finished**; auth adds **field-validation**. No screen may show an undefined/blank state.

## 7. Accessibility & Responsive Rules
WCAG AA contrast · visible focus on every control · never color-only (pair with icon/label) · adequate touch targets · single-column reflow on narrow view · respect `prefers-reduced-motion` · focus trap in modals · destructive actions (abandon/quit) require intentional confirmation.

## 8. Explicit Exclusions
password reset · email verification · SSO · social login · board-sharing · MCP · runtime (live) AI generation · real backend / multiplayer / WebSockets / database. Prototype boundary: **backend-free, state resets on reload**.

## 9. Open Decisions (carry-through)
D-001 player · D-002 problem · D-003 MVP mode · D-004 Party/Lobby · D-007 path values · D-008 identity · auth method · race end condition · question retry · SRS algorithm · UI language · viewport targets.

## 10. Review Gate
Approve this **interaction contract and behavior/recovery expectations** before visual style is finalized (P4.2 explores visual directions).
