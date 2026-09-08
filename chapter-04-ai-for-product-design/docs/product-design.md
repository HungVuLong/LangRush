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
