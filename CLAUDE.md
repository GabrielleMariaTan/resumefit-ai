# CLAUDE.md

This file gives Claude Code (and any other AI coding assistant) context on the ResumeFit project. Read this before generating or modifying code.

## Project Summary
ResumeFit is an AI-powered web app that tailors a user's resume to a specific job posting — but only by rewriting bullets it can trace back to real evidence in the user's original resume, and it flags which rewritten claims the user might struggle to defend in an interview.

Full context:
- Problem/validation: `docs/01-validation-and-prd.md`
- Technical spec: `docs/02-spec.md`
- Architecture: `docs/03-architecture.md`

## The One Rule That Matters Most
**Never let the AI pipeline fabricate experience.** A tailored resume bullet must never be generated unless it can be traced back to specific text in the user's original resume. This is not a soft guideline — it's the entire point of the product, and it should shape every implementation decision (prompt design, validation logic, error handling). When in doubt, fail safe: omit a bullet rather than risk fabricating one.

## Tech Stack
- Next.js 14 (App Router), TypeScript
- Tailwind CSS for styling
- Vercel AI SDK + Anthropic Claude API for the AI layer
- Deployed on Vercel
- No database, no auth, in v1 — keep it stateless

## Code Conventions
- TypeScript throughout, strict mode on
- Keep the AI pipeline (`/lib/ai-pipeline/` or similar) as discrete, independently testable functions per stage (extraction → evidence matching → rewrite → defensibility → verdict) — do not collapse this into a single mega-prompt. See `docs/03-architecture.md` Section 3 for why this matters.
- API route handlers in `/app/api/` should be thin — validation + calling the pipeline + returning JSON. Business logic belongs in `/lib/`.
- Prefer small, composable functions over large ones.
- Use environment variables for all secrets (`ANTHROPIC_API_KEY`). Never hardcode keys. Always check `.env.example` is kept in sync when adding new env vars.

## Scope Discipline
This is a graded, time-boxed assignment. Please do NOT proactively add:
- File upload (PDF/DOCX parsing)
- Authentication/accounts
- A database
- Cover letter generation
- Multi-resume comparison

If asked to "improve" the app, prefer fixing/polishing what's in scope over adding new features. Flag scope creep if you notice me drifting toward it.

## Testing Expectations
At least 3 unit tests covering:
1. Requirement extraction produces a structured list
2. Evidence matching never returns a source span absent from the input resume
3. Rewrite generation never produces a bullet for a requirement with no evidence

These map directly to the no-fabrication constraint — treat them as the most important tests in the project, not boilerplate.

## Commit Style
Make small, meaningful commits as features are completed (e.g. "Add requirement extraction module," "Add evidence-matching unit tests") rather than one giant commit. This project's grading rubric explicitly values a real commit history.

## When Unsure
Ask before making structural decisions (changing the pipeline architecture, adding new dependencies, changing the data flow) — but feel free to make routine implementation choices (variable names, component structure, minor styling) independently.
