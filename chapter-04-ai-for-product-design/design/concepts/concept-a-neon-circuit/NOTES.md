# Concept A — Neon Circuit

Dark arcade / cyberpunk visual direction for the LangRush Solo journey. Coded UI concept for P4.2.

## 1. Rationale
- The race loop is framed as an **arcade circuit**: a HUD header, a neon "lane" with glowing checkpoint nodes, and a magenta token that travels the track. This leans into the "game layer on top of a learning system" identity (brief §1) and makes risk/reward feel kinetic.
- Monospace/pixel type + neon glows signal speed and stakes, which reinforces the fast-loop engagement goal.
- Neon accents are deliberately paired with a very dark base (`#06070f`) and light text (`#eaf6ff`) so text keeps **WCAG AA** contrast; neon is used for borders/glows/large headings, not for small body copy on saturated backgrounds.

## 2. Interaction risks
- **Neon-on-dark legibility**: bright saturated neon as text color can fail AA. Mitigation: body copy uses light near-white ink; neon is reserved for large headings, icons, and non-text framing.
- **Glitch/scanline motion** can be nauseating or distracting. Mitigation: scanlines and the stun "glitch" animation are fully disabled under `prefers-reduced-motion` (a static magenta inset tint communicates the stun instead).
- **Color-only meaning**: correct/wrong could read as "green/red only." Mitigation: every state pairs color with an icon (✓ / ✗ / ▲ / ⏱ / ↩) and a text label.
- **Keyboard shortcuts collision** (A–D for answers, E/M/H for paths): shortcuts are scoped to the relevant modal only, and answer keys are ignored once the answer is submitted (locked).

## 3. Review notes
- Auth uses a single generic failure message for both login and register-duplicate; no field/account enumeration.
- Submit is disabled until a selection exists; options lock on submit; the correct answer is never marked before submit.
- Focus is trapped inside both modals (Path + Question); Tab cycles within, Escape from the Path modal returns to the race.
- Touch targets (buttons, inputs, options, paths) are ≥44px min-height.
- Verify neon heading contrast if colors are retuned; keep body text near-white.

## 4. How this preserves the shared contract
- **Auth**: Login/Register tabs, labelled fields, inline validation (username ≥3, password ≥6), loading spinner, simulated `setTimeout` auth, in-memory `NEON.accounts`, single generic error, success → Home.
- **Home**: Start Solo Practice + Log out.
- **Race**: fixed 6 checkpoints, visible lane/token position, status line (checkpoint N of 6, position, ✓/✗ counts), Quit with `window.confirm`.
- **Checkpoint**: Path modal (Easy/Medium/Hard) with explicit reward + penalty (icon+text), keys E/M/H.
- **Path values**: Easy +1 / stun 1000ms / back 0 · Medium +2 / stun 2000ms / back 0 · Hard +4 / stun 3500ms / back 1.
- **Question**: focal question, options A/B/C/D single-select, Submit disabled until selection, mouse/touch + A/B/C/D keys, Enter submits, answer not revealed pre-submit. Easy = vocab, Medium = emoji-glyph image, Hard = sentence.
- **Feedback**: correct → boost + advance + Continue; wrong → stun countdown that re-enables Continue when elapsed (Hard also −1). Penalty-then-continue; no re-ask; fresh run resets from Home.
- **End**: Results with correct/wrong counts, total steps, vocabulary touched, Play again / Home.

## 5. Scope & reduced-motion
- **Scope = Solo only.** Login/Register + Solo Practice only. Party **Lobby** / room-code is **POST-MVP** and is only referenced as text on the auth screen; it is not built.
- **Reduced motion**: `prefers-reduced-motion: reduce` removes scanlines, screen fades, spinner rotation, token transition, and the stun glitch animation. Countdowns and all state transitions remain fully functional — the stun still elapses and re-enables Continue; only decorative motion is removed.
- **Backend-free**: no fetch/XHR/WebSockets/storage. All state is in memory and resets on browser reload.
