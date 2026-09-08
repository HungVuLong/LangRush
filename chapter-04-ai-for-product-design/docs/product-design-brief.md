# LangRush — Product Design Brief

> Sources: product-requirements.md v0.2, feature-specification.md, project-context.md
> Precedence: human interaction decisions → accepted design artifacts → selected concept → AI
> Scope: Solo MVP (Party Mode = POST-MVP per spec). Assumptions kept tagged.
> Selected visual direction: **C — Minimal Focus** (see product-design.md).

## 1. Design Goal
Make the accepted Solo journey (register → race → choose path → answer → feedback → results) feel fast, legible, and rewarding, so a player wants to keep practicing. `[Assumption — D-002]`

## 2. Primary Player & Context
University students studying Japanese for IT/business `[Assumption — D-001]`; short, repeat practice sessions on web (desktop + narrow/mobile viewport).

## 3. Design Principles
- Clarity over decoration; the question is always the focal point.
- Risk/reward must be legible: each path visibly signals its reward and penalty.
- Immediate, unambiguous feedback for correct vs. incorrect.
- Japanese + Latin text must remain readable at all sizes.

## 4. Accessibility & Interaction Rules (the "approved rules" the prototype must preserve)
- WCAG AA contrast minimum.
- Visible keyboard focus on every interactive element.
- Fully keyboard- AND touch-operable; answers selectable via A/B/C/D keys and tap.
- Respect `prefers-reduced-motion` (disable track animation / stun shake).
- Never convey meaning by color alone — pair color with icon/label (aligns with context §7 "no fixed-color label").
- Adequate touch target sizes; layout reflows for narrow view.

## 5. Screens in scope (MVP)
Login/Register · Home/Start · Solo Race view · Checkpoint Decision · Question modal · Feedback (stun / boost) · Results summary.

## 6. Out of scope
Party Lobby, competitor positions, real backend/multiplayer/SRS algorithm, avatar customization. `[POST-MVP / Open]`

## 7. Open design inputs
Exact device/viewport targets, UI language (VN/EN/JP), and race end condition (fixed vs endless) remain `[Open]`.
