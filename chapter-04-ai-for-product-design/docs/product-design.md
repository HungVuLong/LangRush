# LangRush — Product Design: Visual Direction "Minimal Focus"

> Sources: product-design-brief.md, product-requirements.md v0.2, feature-specification.md, project-context.md
> Precedence: human interaction decisions → accepted design artifacts → selected concept → AI
> Scope: Solo MVP. Party Mode = POST-MVP. Assumptions kept tagged.

## 1. Concept
**Minimal Focus** — a calm, monochrome interface with a single accent, minimal motion, and the active **question** as the visual focal point. The game exists to serve learning; chrome recedes so the player reads, decides, and answers quickly. Chosen for maximum readability, AA contrast, reduced-motion friendliness, and a dependency-free build.

## 2. Design Tokens

### Color
- Neutral surfaces + high-contrast text; a single accent for primary action / focus.
- Semantic states are **never color-only** — each is paired with an icon + label:
  - Correct → check icon ✓ + "Correct"
  - Incorrect → cross icon ✗ + "Wrong"
  - Stunned → timer icon ⏱ + countdown label
- Suggested tokens (final hex `[Open]`, must pass AA):
  - `--surface` (near-white / near-black in dark), `--text` (max contrast), `--muted` (secondary text), `--accent` (one hue), `--divider`.
- Support light and dark via `prefers-color-scheme`; both must meet AA.

### Typography
- System UI stack for Latin; ensure a Japanese-capable fallback (e.g., system JP fonts) so **question** text renders cleanly.
- Large, few sizes: display / title / body / caption. Body ≥ 16px; question text noticeably larger.

### Spacing & Layout
- 8px spacing scale; generous whitespace; single centered column.
- Content max-width for readability; full reflow to a single column on narrow view.

### Motion
- Minimal by default. Track progress moves by discrete steps rather than flashy animation.
- All non-essential motion (track glide, stun shake) disabled under `prefers-reduced-motion`.

## 3. Core Components
- **Labelled input** (auth): visible label, inline validation message, visible focus ring.
- **Button**: primary (accent) / secondary (outline); large touch target; keyboard focusable.
- **Path card** (Easy / Medium / Hard): shows reward and penalty explicitly via text + icons, not color:
  - Easy → "▲ +1 · ⏱ 1s"
  - Medium → "▲ +2 · ⏱ 2s"
  - Hard → "▲ +4 · ↩ −1 · ⏱ 3.5s"  `[Proposed — D-007]`
- **Question modal**: centered; prompt on top; four options labelled **A / B / C / D**; selectable by tap or A/B/C/D keys; single-select; submit disabled until a choice is made.
- **Track**: simple horizontal lane with a token for the player position and checkpoint ticks. (Competitor tokens are POST-MVP.)
- **Feedback**: correct → brief advance + ✓; incorrect → ✗ + stun overlay with ⏱ countdown (and, for Hard, a −1 step indicator).
- **Results summary**: attempted / correct / incorrect counts + vocabulary items touched.

## 4. Screen Notes (MVP)
- **Login / Register**: single centered card, labelled fields, inline validation, loading state on submit, generic auth error (no field/account enumeration).
- **Home / Start**: minimal; one primary action → "Start Solo Practice".
- **Race view**: track + player token + current position/step; "next checkpoint" indicator.
- **Checkpoint decision**: three path cards (see above); keyboard-selectable; clear which is focused.
- **Question modal**: focal question; A/B/C/D; submit; result feedback.
- **Feedback**: boost (advance) or stun (dim + countdown), reduced-motion aware.
- **Results**: summary then return Home.

## 5. Required UI States (per screen)
Every screen defines **loading · empty · success · failure/error**; race adds **stunned** and **finished**; auth adds **field-validation**. (Matches feature-spec §9.)

## 6. Accessibility Mapping
Implements brief §4: AA contrast, visible focus, keyboard + touch (A/B/C/D), `prefers-reduced-motion`, icon+label for all states, adequate targets, narrow-view reflow.

## 7. Scope & Open Items
- In scope: the seven MVP screens (brief §5).
- POST-MVP: Party Lobby, competitor tokens, real multiplayer.
- Open: final color hex, UI language, race end condition, exact viewport targets. `[Open]`

## 8. P4.5 Review — Accepted Corrections

> Applied to prototype files after human approval. All corrections are minimal — no scope change, no visual redesign.

### P1 Corrections (applied)

- **P1-A1 — Auth tab ARIA:** Added `aria-controls="auth-panel"` to both tab buttons; wrapped form content in `<div id="auth-panel" role="tabpanel" aria-labelledby="auth-title">`. Resolves WCAG 4.1.2 failure (screen reader cannot navigate from tab to panel).
- **P1-Q1 — Invalid `role="radio"` on `<button>`:** Removed `role="radio"` and `aria-checked` from answer option buttons; replaced with `aria-pressed`. Removed `role="radiogroup"` from the `<ul>`. Resolves ARIA role conflict (button + radio) that caused inconsistent screen reader announcements.
- **P1-Q2 — Stun countdown silent to AT:** Added `announce('Stun ended. Continue available.')` at the `clearInterval` branch in `startStun()`. Screen reader users now hear a single notification when Continue re-enables, without noisy per-tick updates.
- **P1-R1 — Track missing checkpoint ticks:** Added 6 static `.track-tick` divs at evenly spaced positions (18 % / 34 % / 50 % / 66 % / 82 % / 98 %) inside the track. Added `.track-tick` CSS rule (accent-coloured, 2 × 14 px, `aria-hidden` via parent). Track now shows structure as specified in design §3.

### P2 Corrections (applied)

- **P2-R2 — Race score ✓/✗ not labelled for AT:** Split `#race-score` into two child spans (`#race-score-correct`, `#race-score-wrong`) each with a dynamic `aria-label` ("Correct: N" / "Wrong: N"). `renderRace()` updates both `textContent` and `aria-label` on each render. Resolves WCAG 1.1.1 / 1.4.1.
- **P2-C1 — Path card buttons missing accessible name for stun:** Added explicit `aria-label` to each path card button spelling out reward, back penalty, and stun duration in plain text (e.g. "Easy path: advance 1 step, stun 1 second. Vocabulary question."). Visible text unchanged.
- **P2-FK1 — `show()` focuses non-focusable `h1`:** Added `tabindex="-1"` to all four screen `h1` elements (`auth-title`, `home-title`, `race-title`, `results-title`). `show()` can now reliably move focus to the heading on screen transition, repositioning screen reader users.
- **P2-NV1 — Modal dialog clips on narrow viewports:** Added `@media (max-width:400px)` rule reducing modal outer padding to 8 px, dialog inner padding to 14 px, and stacking path cards (`flex-direction:column`) to prevent name/meta collision at 320 px width.

## 9. P4.5 Review — Deferred Risks & Not-Run Checks

> Source: P4.5 static prototype review (index.html · styles.css · app.js · mock-data.js).
> Prototype corrections (P1/P2 defects) are tracked separately and require human approval before being applied.
> This section records only deferred risks and checks that could not be run from static analysis.

### Deferred Risks (accepted, pending live test)

- **P3-C2 — Cancel shortcut undiscoverable:** The Escape key closes the checkpoint modal (implemented) but no visible hint is shown next to the Cancel button. Deferred; low user impact given the E/M/H shortcut pattern is already established.
- **P3-H1 — Home screen null guard:** `show('home')` without a logged-in user would throw. Not reachable via the UI; deferred as a defensive-code improvement.
- **P3-RS1 — Results missing "attempted" count:** Design §3 specifies attempted / correct / incorrect. The prototype shows correct / wrong / steps only. Deferred; correct and wrong together imply attempted. Accepted risk for prototype phase.
- **P2-Q3 — Question modal has no visible heading:** The modal heading (`<h2>`) is visually hidden (`.sr-only`); the path label acts as the visual title but is styled as muted secondary text. Accepted risk: the question prompt is the focal point per design §1. Revisit if user testing shows orientation confusion.

### Not-Run Checks (require live browser / device)

- **NR-1 — Dark mode contrast ratios:** CSS tokens for `prefers-color-scheme: dark` are defined but contrast ratios are unverified. Specific risk: `--ok: #7ee0a8` and `--bad: #ff9d9d` on `--surface: #15171b` must pass WCAG AA (4.5:1 text, 3:1 UI). **Action:** verify with browser DevTools colour picker or a contrast checker before shipping.
- **NR-2 — Touch target size on real device:** All interactive elements have `min-height: 44px; min-width: 44px`. Actual tap target size depends on device pixel ratio and browser chrome. **Action:** test on iOS Safari and Android Chrome at 1× and 2× DPR.
- **NR-3 — Japanese font rendering:** Font stack includes `Hiragino Kaku Gothic ProN`, `Noto Sans JP`, `Meiryo`. Rendering quality and line-height adequacy for hiragana/kanji question text must be verified on Windows, macOS, and Android. **Action:** open prototype with real question text on each OS.
- **NR-4 — Screen reader end-to-end flow:** ARIA structure reviewed statically. The full flow (login → race → checkpoint → question → stun → continue → results) requires a live test with NVDA (Windows), JAWS, or VoiceOver (macOS/iOS). **Action:** run before treating prototype as accepted reference.
- **NR-5 — Reduced-motion OS toggle mid-session:** The `reduceMotion` flag is read once at page load via `matchMedia`. If the user changes the OS setting during a session the flag is stale and animations may re-appear. **Action:** verify with OS accessibility toggle; consider adding a `matchMedia.addEventListener('change', …)` listener if this is a real concern.
- **NR-6 — Enter-key submission on auth form:** The form uses `novalidate` with a `submit` event listener. Enter on a focused input should trigger submit without double-firing. **Action:** confirm in Chrome, Firefox, and Safari; check for focus loss after simulated-auth timeout.
