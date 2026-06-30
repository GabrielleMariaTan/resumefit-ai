# CLAUDE.md

This file gives Claude Code (and any other AI agent, e.g. via `.cursorrules`) project-level context. Read this at the start of every session, before generating or modifying code.

---

## 1. Project Overview

**What this app does:** ResumeFit is an AI-powered web app that tailors a user's resume to a specific job posting — but only by rewriting bullets it can trace back to real evidence in the user's original resume, and it flags which rewritten claims the user might struggle to defend in an interview.

**Who it's for:** Career switchers — people moving into a field where their existing experience doesn't use the same vocabulary as the target job posting, and who are wary of generic AI resume tools producing claims they can't back up. Validated via an 11-respondent survey (`docs/01-validation-and-prd.md`).

**Core business logic the AI must understand before touching any code:**
> **Never let the AI pipeline fabricate experience.** A tailored resume bullet must never be generated unless it can be traced back to specific text in the user's original resume. This is not a soft guideline — it's the entire point of the product, and it should shape every implementation decision (prompt design, validation logic, error handling). When in doubt, fail safe: omit a bullet rather than risk fabricating one.

Full context documents:
- Problem/validation + PRD: `docs/01-validation-and-prd.md`
- Technical spec: `docs/02-spec.md`
- Architecture: `docs/03-architecture.md`

---

## 2. Architecture Summary

**Folder structure:**
```
app/                  # Next.js App Router pages + API routes
└── api/tailor/       # Single API route, thin — validation + pipeline call + JSON response
lib/
└── ai/               # AI pipeline modules + Anthropic client wrapper
    ├── client.ts     # Anthropic SDK singleton
    ├── types.ts      # Shared pipeline types
    └── stages/       # One file per pipeline stage
docs/                 # Planning docs (validation, PRD, spec, architecture)
```

**Key modules:** the AI pipeline is split into 5 discrete, sequential stages — not one mega-prompt:
1. Requirement Extraction (job posting → discrete requirement claims)
2. Evidence Matching (requirements + resume → evidenceStrength + sourceSpans per requirement)
3. Grounded Rewrite (only requirements with evidence → tailored bullets, each carrying a source-span citation)
4. Defensibility Reasoning (each bullet → likely follow-up question + defensibility flag)
5. Overall Verdict (all requirements → recruiter-style summary)

**Why split into stages:** this is a deliberate design decision, not incidental complexity. Splitting the pipeline makes each stage's output independently auditable and lets Stage 3 be code-enforced to simply never generate a bullet for an unsupported requirement, rather than relying on the model to "remember" not to fabricate. See `docs/03-architecture.md` Section 3 for the full justification — do not collapse this into a single prompt, even if it would be faster to build.

**Data flow:** client → `POST /api/tailor` → pipeline runs stages 1–5 sequentially (each stage = one or more Claude API calls) → structured JSON response → client renders verdict, tailored resume with expandable source-span links, and defensibility flags.

**Tech stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Anthropic Claude API (via `@anthropic-ai/sdk`), deployed on Vercel. No database, no auth in v1 — the app is stateless per-request.

---

## 3. Development Conventions

- TypeScript throughout, strict mode on.
- Pipeline stages live in `lib/ai/stages/` as discrete, independently testable functions — one file per stage.
- API route handlers in `app/api/` should be thin: validate input, call the pipeline, return JSON. Business logic belongs in `lib/`, not in route handlers.
- Prefer small, composable functions over large ones.
- Use environment variables for all secrets (`ANTHROPIC_API_KEY`). Never hardcode keys. Always keep `.env.example` in sync when adding new env vars.
- **Commit message format:** short, imperative, descriptive of the actual change (e.g. `"Add requirement extraction module (Stage 1)"`, `"Add evidence-matching unit tests"`) — not generic messages like `"update"` or `"fix stuff"`. Commit after each meaningful chunk of work, not all at once at the end; this project's grading rubric explicitly values a real, legible commit history.
- Branch naming / PR process: not required for this solo project — direct commits to `main` are fine.
- Linting/formatting: use the ESLint config already scaffolded by `create-next-app`; don't disable rules to silence warnings without understanding why they fired.

---

## 4. Critical Constraints

**Files the AI must never modify carelessly:**
- `docs/*.md` — these are planning/grading artifacts; only edit them when explicitly asked to update documentation, not as a side effect of a code change.
- `.env.example` and `.gitignore` — only modify intentionally, and never remove `.env*` patterns from `.gitignore` (the `!.env.example` exception is intentional — that file is safe to commit).

**APIs with usage costs:**
- The Anthropic Claude API is metered/billed. Avoid unnecessary repeated calls during development (e.g. don't loop API calls in a test that runs on every save). Use a cheap/fast model (`claude-haiku-4-5-20251001`) for simpler stages like extraction; reserve stronger models only where the spec's acceptance criteria genuinely require deeper reasoning (e.g. defensibility judgment).

**Security-sensitive areas:**
- `ANTHROPIC_API_KEY` must only ever be read via `process.env.ANTHROPIC_API_KEY` on the server side. It must never appear as a literal string in any committed file, never be sent to the client/browser, and never be logged.
- No user data (resumes, job postings) is persisted server-side — every request is stateless. Do not add a database or logging of submitted content without explicit instruction.

**Environment-specific rules:**
- Local development reads secrets from `.env.local` (gitignored). Production (Vercel) reads secrets from Vercel's Environment Variables dashboard — never from a committed file.

**Scope discipline (this is a graded, time-boxed assignment):**
Do NOT proactively add: file upload (PDF/DOCX parsing), authentication/accounts, a database, cover letter generation, multi-resume comparison, or any other feature beyond what's in `docs/02-spec.md`. If asked to "improve" the app, prefer fixing/polishing what's in scope over adding new features, and flag scope creep if you notice it happening.

**Testing requirement:**
At least 3 unit tests are required, covering: (1) requirement extraction produces a structured list, (2) evidence matching never returns a source span absent from the input resume, (3) rewrite generation never produces a bullet for a requirement with no evidence. These map directly to the no-fabrication constraint — treat them as the most important tests in the project, not boilerplate. Run tests with `npm test`.

**When unsure:** ask before making structural decisions (changing the pipeline architecture, adding new dependencies, changing the data flow) — but feel free to make routine implementation choices (variable names, component structure, minor styling) independently.
