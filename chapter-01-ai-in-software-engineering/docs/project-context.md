# LangRush — Project Context (portable)

> Purpose: self-contained context for a fresh AI session. Derived strictly from the approved project-brief.md. No newer human decisions supplied. Assumptions are preserved as-is and NOT treated as facts.

## 1. Product Summary & Boundary

**Is:** A real-time multiplayer educational *web* game that teaches Japanese by embedding multiple-choice **questions** into a competitive 2D race. At each **checkpoint** a **player** picks a **path** (Easy/Medium/Hard); harder path = harder question = bigger reward + bigger penalty. Includes a Solo Practice mode with spaced repetition (SRS) and a Party mode (concept).

**Is NOT (this phase):** Not a pure racing game with learning bolted on (working stance = *learning system with a game layer*, still an assumption). Not a requirements/architecture/DB/API/UI spec — those belong to later phases and must not be produced here.

## 2. Registration / Login Journey

**Not defined.** "Registration/login" appears only as a *proposed* MVP feature (Assumption / Open). No entry flow, auth method, providers, or onboarding steps are specified in the source. Do NOT invent one — see Unresolved Questions.

## 3. Approved Decisions

Only items explicitly established in the inputs. (The brief was approved *as the canonical document*; the concept-level facts below are the "Confirmed" items within it.)

- LangRush is a real-time multiplayer educational web game combining language learning + 2D racing + risk/reward + competition. *(Confirmed as concept)*
- Two modes exist as concepts: **Solo Practice** (with SRS) and **Party Mode** (2–8 players, lobby + room code, real-time race). *(Confirmed as concepts)*
- Core gameplay loop *structure*: Join/Start → Race → Checkpoint → Choose Path → Answer Question → Reward/Penalty → Continue → Finish → Review. *(Confirmed structure; numeric values are NOT confirmed)*
- Three **paths** (Easy/Medium/Hard), all **question**s multiple choice. *(Confirmed as hypothesis; step/stun values unconfirmed)*
- SRS in Solo: frequently missed **vocabulary items** are reviewed more often. *(Confirmed as concept; algorithm unconfirmed)*
- Content domain intent: Japanese — IT Japanese, business vocabulary, structural grammar, Minna no Nihongo. *(Confirmed as intent)*

## 4. Unresolved Questions (Open / Assumption — do NOT close silently)

- **D-001 Primary player** — Assumption: university students studying Japanese for IT/business.
- **D-002 Primary learning goal** — Assumption.
- **D-003 MVP game mode** — Assumption: Solo Practice first.
- **D-004 Party size** — Proposed: 2–8.
- **D-005 AI content generation** — Proposed: internal pipeline + mandatory human review.
- **D-006 Sabotage items** — Open (proposed excluded from MVP).
- **D-007 Path values (steps/stun)** — Proposed (E:+1/1s, M:+2/2s, H:+4/back1/3.5s).
- **D-008 Product identity (learn-vs-race)** — Assumption: learning system with a game layer.
- Registration/login flow — undefined (see §2).
- Multiplayer details (host behavior, disconnect, late-join, rematch, room expiry) — Open.
- Constraints (project type, team size, timeframe, budget, devices, concurrency, hosting) — unspecified. Tech stack = preference only, not decided.
- Success metrics — proposed, not confirmed.

## 5. Vocabulary (use these terms)

- **player** — a participant (use instead of "user" in gameplay).
- **question** — an in-game learning prompt (never call it a "card").
- **vocabulary item** — a single learning unit.
- **match** — one multiplayer race.
- **lobby** — the pre-match multiplayer room.
- **path** — an Easy / Medium / Hard choice.
- **checkpoint** — a decision point on the track.

## 6. Excluded Scope

- **Hard exclusion:** MCP (Model Context Protocol) and any unsupported product enhancements — out of scope entirely.
- **Proposed deferrals (Assumption / Open, not yet confirmed):** sabotage items, public matchmaking, teacher/classroom dashboards, avatar customization, runtime (live) AI content generation.
- **Phase boundary:** no requirements, user stories, DB schema, API/architecture, or implementation in this context doc.

## 7. Source Hierarchy & Rules

1. **Precedence:** (1) newer human decisions → (2) approved project brief → (3) AI suggestions.
2. Do **not** invent requirements, game mechanics, or system architecture.
3. Preserve open decisions/assumptions exactly; never silently convert an assumption into a fact.
4. On conflict or missing info: surface it and ask the human — do not resolve silently.
5. Terminology: never use "card" (use "question"); do not use fixed-color labels.
6. Keep this document compact and portable.
