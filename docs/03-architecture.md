# Architecture Notes: ResumeFit

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS | Fast to scaffold, good Vercel integration, supports server actions for clean API calls |
| AI / LLM | Anthropic Claude API, via Vercel AI SDK | Strong instruction-following for structured/grounded generation; Vercel AI SDK simplifies streaming + tool-call style structured output |
| Hosting | Vercel | Native Next.js support, trivial CI/CD via GitHub integration, generous free tier |
| CI/CD | GitHub Actions | Runs tests on every push before Vercel deploy proceeds |
| Database | None for v1 | No persistence needed — stateless single-session tool (see PRD out-of-scope) |
| Auth | None for v1 | No login required for the assignment demo |

---

## 2. High-Level System Diagram

```
┌──────────────────────────────────────────────────────────┐
│                        Browser (Client)                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Next.js UI                                         │  │
│  │  - Resume textarea + Job posting textarea           │  │
│  │  - "Tailor My Resume" button                        │  │
│  │  - Results view (tailored resume + traceability)    │  │
│  └───────────────────────┬──────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────┘
                            │ POST /api/tailor
                            ▼
┌──────────────────────────────────────────────────────────┐
│              Next.js API Route (Server, Vercel)            │
│                                                            │
│   1. Validate input (length, non-empty)                   │
│   2. Run AI Pipeline (sequential, see below)               │
│   3. Return structured JSON to client                      │
└───────────────────────────┬────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────┐
│                 AI Pipeline (server-side module)           │
│                                                            │
│  Stage 1: Requirement Extraction Module                    │
│      jobPostingText → requirements[]                       │
│                  │                                          │
│  Stage 2: Evidence Matching Module                          │
│      requirements[] + resumeText → evidenceStrength,        │
│                                      sourceSpans            │
│                  │                                          │
│  Stage 3: Grounded Rewrite Module                           │
│      (only strong/partial evidence) → tailoredResume.bullets│
│                  │                                          │
│  Stage 4: Defensibility Reasoning Module                    │
│      each bullet + sourceSpans → flag, followUpQuestion     │
│                  │                                          │
│  Stage 5: Overall Verdict Module                            │
│      all requirements → overallVerdict                      │
│                                                              │
│  Each stage = one (or more) calls to Claude via Anthropic   │
│  API, with stage-specific system prompts and JSON-only      │
│  output instructions (see Section 4)                        │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Why a Multi-Stage Pipeline (Not One Big Prompt)

This is the most important architectural decision in the project, so it's worth justifying explicitly:

A single "rewrite this resume for this job" prompt is fast to build but cannot guarantee groundedness — the model can freely blend invention with real content, and there's no way to verify after the fact which parts were fabricated.

By splitting into discrete stages with explicit intermediate outputs (`requirements[]`, `evidenceStrength`, `sourceSpans`), we get:
1. **Auditability** — every stage's output can be inspected and validated independently (this is also what the unit tests in spec.md check)
2. **A natural enforcement point** — Stage 3 can be code-enforced to simply skip generating a bullet for any requirement without evidence, rather than relying on the model to "remember" not to fabricate
3. **Traceability for the UI** — since `sourceSpans` are captured as a discrete intermediate value, the frontend can directly render the link between a tailored bullet and its original resume text, which is the product's core differentiator

This is more API calls (and slightly higher latency/cost) than a single-prompt approach, but it's the only way to make the "no fabrication" hard constraint actually enforceable rather than just requested.

---

## 4. AI Module Design Details

### Module: Requirement Extraction
- **Prompt strategy:** system prompt instructs Claude to act as a structured parser, output JSON only, one atomic requirement per item, no inference beyond what's stated in the posting
- **Output validation (code-level):** reject/retry if response isn't valid JSON matching the expected schema

### Module: Evidence Matching
- **Prompt strategy:** for each requirement, ask Claude to evaluate the resume text and either (a) quote/paraphrase a specific span that serves as evidence, or (b) explicitly return `none`
- **Key instruction:** explicitly tell the model "you must be able to point to specific text in the resume — do not infer skills not stated or implied by the resume content"
- **Output validation (code level):** a lightweight string-similarity check (e.g. confirming `sourceSpans` text has meaningful token overlap with `resumeText`) as a guard rail against the model inventing a source span; flag for manual review if similarity is too low

### Module: Grounded Rewrite
- **Prompt strategy:** Claude only receives requirements that passed evidence matching (strong/partial), plus their source spans — the model literally cannot generate a bullet for unsupported requirements because it's never given them
- **Key instruction:** rewrite using target-industry vocabulary, but stay factually bounded by the source span (no new numbers, scope, or titles)

### Module: Defensibility Reasoning
- **Prompt strategy:** given a rewritten bullet + its source span, ask Claude to imagine a recruiter follow-up question and assess, based on the gap between original phrasing and rewritten phrasing, whether the candidate would likely find it easy or hard to elaborate on
- **Heuristic-assisted:** the size of the gap between `sourceSpans` and `rewrittenText` (more reframing = more "be ready to elaborate") can be used as a soft additional signal alongside the model's own judgment

### Module: Overall Verdict
- **Prompt strategy:** summarize across all requirements (not just the ones with evidence) into a single recruiter-style verdict and 2-4 sentence reasoning

---

## 5. Data Flow Summary

```
User pastes resume + job posting
        │
        ▼
Client-side validation (non-empty, length)
        │
        ▼
POST /api/tailor  (Next.js API route)
        │
        ▼
Server-side pipeline (Stages 1→5, sequential, each a Claude API call)
        │
        ▼
Structured JSON response
        │
        ▼
Client renders: verdict banner, tailored resume with expandable
source-span links, defensibility flags per bullet
```

---

## 6. Error Handling & Edge Cases
- **Malformed AI JSON output:** retry once with a stricter "JSON only" reminder; if it still fails, surface a friendly error to the user rather than a raw stack trace
- **No requirements with evidence found at all:** still return a valid response with an honest `overallVerdict` (e.g. "likely_screened_out") rather than failing silently
- **Job posting too vague/short to extract requirements:** surface a clear UI message asking the user to paste the full posting

---

## 7. Security & Secrets
- `ANTHROPIC_API_KEY` stored as a Vercel environment variable, never committed to the repo (see `.env.example`)
- No user data persisted server-side — each request is stateless
- Input length caps (see spec.md) double as a basic cost/abuse safeguard
