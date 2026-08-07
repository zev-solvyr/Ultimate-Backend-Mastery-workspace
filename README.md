# Ultimate Java Dev

Premium enterprise Java learning platform built with **Next.js 15**, **React**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Framer Motion**.

## Features

- **22-Level Roadmap** — Structured JSON with 44 topics covering Java fundamentals through production observability
- **Rich Topic Pages** — Overview, internal workings, code examples, interview prep, exercises, and personal notes
- **3 Enterprise Projects** — CommerceX, FinFlow, and Platform Engineering with full architecture specs
- **Skill → Project Mapping** — See where every topic is implemented in real projects
- **Project Build Order** — Milestone sequence mirroring real engineering team workflows
- **Gamified Dashboard** — XP, streaks, achievements, activity heatmap, company readiness scores

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data Structure

All roadmap and project data lives in `src/data/` as structured JSON:

| File | Description |
|------|-------------|
| `roadmap.json` | 22 levels, 44 topics with full metadata |
| `projects.json` | 3 enterprise projects with architecture |
| `skill-mapping.json` | Topic → project implementation mapping |
| `build-order.json` | 17-step milestone build sequence |

Regenerate data: `node scripts/generate-data.mjs`

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui components
- Framer Motion animations
- LocalStorage progress persistence
