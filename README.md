# ResumeFit

**Evidence-grounded resume tailoring for career switchers.**

> ResumeFit rewrites your resume to match any job posting — but only using evidence it can point to in your real experience, and it tells you whether you could actually defend each claim in an interview.

🔗 **Live App:** [ResumeFit on Vercel](https://resumefit-ai-nine.vercel.app)
🎥 **Demo Video (2 min):** [link-to-demo](#) *(add once recorded)*
📄 **Full Project Docs:** [`/docs`](./docs)

---

## Table of Contents
- [Problem](#problem)
- [Solution](#solution)
- [What Makes This Different](#what-makes-this-different)
- [Core AI Capability](#core-ai-capability)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Project Documentation](#project-documentation)
- [Roadmap / v2 Ideas](#roadmap--v2-ideas)
- [Reflection](#reflection)
- [Author](#author)

---

## Problem

Career switchers applying for roles outside their current field struggle to communicate that their existing experience is relevant, because job postings use industry-specific language that doesn't match how their experience was described in their previous field.

When they turn to generic AI tools to help tailor their resume, the rewritten content is often disconnected from what they can actually prove or defend — producing resumes that read well on paper but leave the candidate exposed if a recruiter or interviewer probes further.

This problem was validated through direct interviews with career switchers — see the [full validation report](./docs/01-validation-and-prd.md) for evidence and methodology.

## Solution

ResumeFit takes a resume and a job posting as input and:

1. Extracts the job posting's actual requirements as discrete, evaluable claims
2. Checks the original resume for real evidence of each requirement — even when the resume uses completely different vocabulary
3. Generates a tailored resume rewrite, but **only** writes a bullet when it can trace that claim back to specific evidence in the original resume
4. Flags each rewritten bullet with a likely recruiter follow-up question and a defensibility read — helping the user know what they'd need to be ready to elaborate on
5. Suggested interview answer per bullet — AI-generated response grounded in the same resume evidence, collapsible, framed as a starting point to personalise

## What Makes This Different

| | Generic AI resume tools | ResumeFit |
|---|---|---|
| Rewrites freely to sound impressive | ✅ | ❌ (by design) |
| Tailors to keywords in the posting | ✅ | ✅ |
| Shows where each claim came from | ❌ | ✅ Traceable to source resume content |
| Warns you what you might struggle to defend in an interview | ❌ | ✅ Defensibility flag per bullet |
| Risk of fabricating experience | Higher | Constrained by design — no evidence, no rewrite |

## Core AI Capability

ResumeFit's AI layer performs a multi-step pipeline rather than a single prompt:

1. **Requirement extraction** — parses the job posting into discrete requirement claims
2. **Evidence matching** — parses the resume and scores each requirement (strong / partial / none evidence), even across differing vocabulary or industries
3. **Grounded generation** — rewrites resume bullets only where evidence exists, with each output explicitly linked to its source sentence(s)
4. **Defensibility reasoning** — generates a likely interviewer follow-up question and a confidence flag for each rewritten bullet

This is intentionally a *grounded* generation pipeline rather than free-form rewriting, to avoid the model inventing qualifications the user doesn't have.

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 14 + Tailwind CSS |
| AI / LLM | Vercel AI SDK + Claude |
| Database | Supabase *(if used — remove if not needed for v1)* |
| Auth | None for v1 *(no login required for demo)* |
| Deployment | Vercel |
| CI/CD | GitHub Actions |

*(Update this table once your actual stack is finalized in Phase 2.)*

## Architecture

```
User Input (resume + job posting, plain text)
        │
        ▼
┌─────────────────────┐
│  Requirement         │   Extracts discrete claims from
│  Extraction Module   │   the job posting
└─────────┬────────────┘
          ▼
┌─────────────────────┐
│  Evidence Matching   │   Scores resume against each
│  Module              │   requirement (strong/partial/none)
└─────────┬────────────┘
          ▼
┌─────────────────────┐
│  Grounded Rewrite    │   Generates tailored bullets,
│  Module              │   only from evidence-backed claims
└─────────┬────────────┘
          ▼
┌─────────────────────┐
│  Defensibility       │   Flags likely follow-up questions
│  Module              │   + confidence per bullet
└─────────┬────────────┘
          ▼
   Web UI: original resume | tailored resume | evidence trace
```

Full architecture notes and data flow are documented in [`/docs/03-architecture.md`](./docs/03-architecture.md).

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- An Anthropic or OpenAI API key (for the AI layer)

### Installation

```bash
git clone https://github.com/GabrielleMariaTan/resumefit-ai.git
cd resumefit-ai
npm install
```

### Run locally

```bash
npm run dev
```

App will be available at `http://localhost:3000`

## Environment Variables

Create a `.env.local` file in the project root (never commit this file — see `.gitignore`):

```
ANTHROPIC_API_KEY=your_key_here
```

A `.env.example` file is included in the repo showing required variables without real values.

## Running Tests

```bash
npm test
```

Minimum of 3 unit tests covering the requirement extraction, evidence matching, and rewrite generation logic.

## Project Structure

```
resumefit-ai/
├── README.md
├── docs/
│   ├── 01-validation-and-prd.md
│   ├── 02-spec.md
│   ├── 03-architecture.md
│   └── 04-reflection.md
├── CLAUDE.md
├── .env.example
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/ (or app/)
├── tests/
└── package.json
```

## Deployment

This app is deployed on **Vercel**, connected directly to this GitHub repository. Every push to `main` triggers a GitHub Actions workflow that runs tests before deployment proceeds.

Live URL: *(add once deployed)*

## Project Documentation

All planning and process documentation lives in [`/docs`](./docs):

- [Idea Validation Report + PRD](./docs/01-validation-and-prd.md) — all 7 validation steps, user evidence, and the 1-page PRD
- [Spec](./docs/02-spec.md) — inputs, outputs, and acceptance criteria
- [Architecture Notes](./docs/03-architecture.md) — system design and AI module breakdown
- [Reflection](./docs/04-reflection.md) — learnings, challenges, and v2 ideas

## Roadmap / v2 Ideas

- Multi-posting calibration (tailor against several similar job postings at once, not just one)
- Downloadable/exportable formatted resume (PDF)
- Support for uploading resume files directly (PDF/DOCX) instead of pasting text
- Account/login support to save past tailored resumes

See the open GitHub Issues tab for the specific v2 improvement logged for this assignment.

## Reflection

A full 1-page reflection on what was built, what was learned, and what would be improved is available at [`/docs/04-reflection.md`](./docs/04-reflection.md).

## Design

UI visual language inspired by the [Clearwave template](https://templatemo.com/tm-622-clearwave) by Templatemo, free for personal and commercial use. Color palette, typography (DM Sans), spacing tokens, and easing curves adapted into a Next.js + Tailwind implementation.

## Author

Built by Gabrielle Maria Tan as part of the AIM Week 4 Graded Assignment — *Build and Deploy an AI-Powered Web Application*.