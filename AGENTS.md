# LangRush Repository — Agent Guidance

This repository is a **learning resource** for AI-assisted software engineering, organized as a multi-chapter course. It is NOT a runnable codebase — there are no build, test, or lint commands.

## Key Document

**`SKILL.md`** — Contains the authoritative architecture guardrails and conventions for the LangRush game project (a real-time multiplayer language-learning racing game). All agent work related to the LangRush project design must follow these rules.

## Repository Structure

```
├── SKILL.md                           # Project conventions (source of truth)
├── README.md                          # Minimal (just "LangRush-FE")
├── chapter-01-ai-in-software-engineering/
│   └── docs/{project-brief,project-context}.md
├── chapter-03-ai-for-requirements-product-analysis/
│   └── docs/{product-requirements,feature-specification}.md
├── chapter-04-ai-for-product-design/
│   ├── docs/{product-design,product-design-brief}.md
│   └── design/concepts/concept-a-neon-circuit/  # Design concept with prototype
├── prototype/                         # Standalone HTML/JS/CSS prototype
└── postman/globals/workspace.globals.yaml  # Empty Postman globals
```

## Tech Stack (from SKILL.md)

- **Frontend**: React (Next.js/Vite) + Tailwind CSS
- **Game Engine**: Phaser.js (HTML5 Canvas), embedded in React
- **Mobile**: React Native + react-native-webview (shared Phaser canvas)
- **Real-time & Auth**: Firebase (Realtime Database for high-frequency state)
- **Backend**: Spring Boot (Java) + PostgreSQL
- **AI Pipeline**: Python scripts + OpenAI/Claude API (pre-generates content to PostgreSQL)
- **Deployment**: Dockerized backend/DB on Ubuntu VPS + Nginx; frontend on Vercel; mobile via Expo

## Critical Architecture Rules (from SKILL.md)

1. **Firebase Realtime Database** for high-frequency state (position, race progress, sabotage); Firestore only for low-frequency structured state
2. **PostgreSQL is the single source of truth** for persistent data (match history); Firebase is never permanent storage
3. **Never expose correct answers to client** before submission; all validation server-side in Spring Boot
4. **Spring Boot verifies Firebase Auth token** via Admin SDK on every request
5. **Game logic is shared** between web and mobile — never fork per platform
6. **AI content pipeline pre-generates** into PostgreSQL; runtime never calls OpenAI/Claude

## Agent Workflow

- Read `SKILL.md` first for any LangRush project design work
- Reference chapter docs for context on requirements, design decisions, or feature specs
- The `prototype/` and `chapter-04/design/concepts/` folders contain standalone HTML/JS prototypes — no build step needed
- No tests, linting, or CI exist in this repository