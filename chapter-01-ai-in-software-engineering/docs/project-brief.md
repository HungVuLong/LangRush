# LangRush — Project Brief

> Status note: This brief was approved with several core decisions still unconfirmed. Items below are marked **Confirmed** (stated in the source concept) or **Assumption / Open** (default values pending human confirmation). Assumptions have not been silently converted into requirements.

## 1. Project Name

LangRush

## 2. Problem Hypothesis

Traditional Japanese vocabulary/grammar practice (flashcards, drills) is effective but boring, so learners don't repeat it enough. LangRush aims to make that repetition fun and competitive by embedding **question**-answering into a real-time 2D race. *(Assumption / Open — exact problem statement)*

## 3. Primary Player

**Assumption / Open:** University students studying Japanese for IT/business (inferred from the IT-Japanese + business-vocabulary content focus). Secondary: general Japanese learners.

## 4. Desired Outcome

**Assumption / Open:** Players practice Japanese more often and retain more vocabulary because the practice is enjoyable and socially competitive.

## 5. Core Product Concept

Language learning is delivered *through* gameplay: a **player** races on a 2D track; **risk/reward** is the core strategic lever (harder **path** = harder **question** = bigger reward + bigger penalty); **competition** (real-time or against the clock) drives repeat play. **Assumption / Open:** LangRush is a *language-learning system with a game layer* (not a racing game with learning bolted on).

## 6. Core Gameplay Loop

*(Confirmed structure; values Assumption)*

Join/Start → Race → Reach **checkpoint** → Choose **path** (Easy/Medium/Hard) → Answer **question** → Apply reward/penalty → Continue → Finish → Review learning results.

## 7. Game Modes

- **Solo Practice** *(Confirmed as concept)* — endless/time-attack, with SRS.
- **Party Mode** *(Confirmed as concept)* — 2–8 players, lobby + room code, real-time race.
- **Assumption / Open:** which mode is the MVP focus (proposed: **Solo Practice first**).

## 8. Learning Mechanics

*(Paths Confirmed as hypothesis; values Assumption)*

- Easy = vocabulary translation (multiple choice), advance 1, stun 1s
- Medium = image-based recognition (multiple choice), advance 2, stun 2s
- Hard = sentence translation (multiple choice, tricky distractors), advance 4, back 1 + stun 3.5s
- **SRS** in Solo — frequently missed **vocabulary items** reviewed more often *(Confirmed as concept; algorithm = Assumption / Open)*.

## 9. Multiplayer Scope

**Assumption / Open:** 2–8 players, host creates a **lobby**, others join by room code, match starts on host/ready, winner = first to finish. Disconnect / late-join / rematch / room-expiry behavior = **Open**.

## 10. Content Scope

*(Confirmed as intent)*

Japanese: IT Japanese, business vocabulary, structural grammar, Minna no Nihongo-related material.

## 11. MVP Scope

**Assumption / Open** (proposed minimal set): registration/login, Solo Practice, 2D racing, three **paths**, vocabulary + image + sentence questions, basic SRS, Japanese dataset, progress tracking.

## 12. Explicit Exclusions

**Assumption / Open** (proposed to defer): sabotage items, public matchmaking, teacher/classroom dashboards, avatar customization, runtime AI generation.

## 13. Constraints

**Assumption / Open:** project type (academic/portfolio/startup?), team size, timeframe, budget, target devices, concurrency, hosting — *all unspecified*. Tech stack (React/Phaser/Firebase/Spring Boot/PostgreSQL/Python + OpenAI/Claude) = **preferences only**, not decided in this phase.

## 14. Risks

- Educational quality of AI-generated Japanese.
- Game balance of the Hard path (too rewarding or too punishing).
- Multiplayer synchronization / inconsistent game states.
- Difficulty labels (Easy/Medium/Hard) not matching real difficulty.
- SRS boosting engagement without improving retention.
- Scope too large for a single MVP.
- High-quality content creation becoming a bottleneck.

## 15. AI Working Rules

**Assumption / Open:** AI used as an *internal content pipeline* (not runtime); all AI-generated questions require **human review** before becoming playable; AI content treated as *untrusted until validated*.

## 16. Success Signals

**Assumption / Open:** repeat play rate, races completed, answer accuracy, session length, SRS review completion, and (later) measurable retention improvement.

## 17. Decision Log

| ID | Decision | Status | Source |
|---|---|---|---|
| D-001 | Primary player | Assumption (Uni IT/business) | AI default |
| D-002 | Primary learning goal | Assumption | AI default |
| D-003 | MVP game mode | Assumption (Solo first) | AI default |
| D-004 | Party size | Proposed: 2–8 | Raw idea |
| D-005 | AI content generation | Proposed (internal pipeline + review) | Raw idea |
| D-006 | Sabotage items | Open (excluded from MVP, proposed) | Raw idea |
| D-007 | Path values (steps/stun) | Proposed | Raw idea |
| D-008 | Product identity (learn-vs-race) | Assumption (learning + game layer) | AI default |

## 18. Open Assumptions

All rows above marked **Assumption / Open** remain unresolved and must be confirmed. None have been silently converted into requirements.
