# Spec: ResumeFit Core AI Feature

## Overview
This spec defines the input/output contract and acceptance criteria for ResumeFit's core AI pipeline: evidence-grounded resume tailoring with traceability and interview-defensibility flags.

---

## 1. Inputs

| Input | Type | Required | Notes |
|---|---|---|---|
| `resumeText` | string (plain text) | Yes | Pasted by user. No file upload in v1. |
| `jobPostingText` | string (plain text) | Yes | Pasted by user. No URL fetching in v1. |

**Validation rules:**
- Both fields must be non-empty.
- Minimum length: ~100 characters each (reject obviously incomplete pastes with a clear UI message, not a silent failure).
- Maximum length: cap at a reasonable token budget (e.g. ~6,000 characters each) to control API cost; show a friendly error if exceeded, don't truncate silently.

---

## 2. Output Structure

The AI pipeline returns a single structured JSON object with four parts:

```json
{
  "requirements": [
    {
      "id": "req_1",
      "requirementText": "3+ years managing a team",
      "evidenceStrength": "strong | partial | none",
      "sourceSpans": ["exact or paraphrased span(s) from resumeText that justify this"]
    }
  ],
  "tailoredResume": {
    "bullets": [
      {
        "id": "bullet_1",
        "rewrittenText": "Led a team of 6 across two product launches...",
        "linkedRequirementIds": ["req_1"],
        "sourceSpans": ["original resume text this was grounded in"],
        "defensibility": {
          "flag": "likely_defensible | be_ready_to_elaborate",
          "likelyFollowUpQuestion": "Can you walk me through how you structured that team?"
        }
      }
    ]
  },
  "overallVerdict": {
    "summary": "likely_to_advance | likely_screened_out | mixed",
    "reasoning": "2-4 sentence recruiter-style explanation"
  }
}
```

**Critical constraint:** A bullet may only appear in `tailoredResume.bullets` if it has at least one non-empty `sourceSpans` entry traceable to the original resume text. If no evidence exists for a requirement, it is recorded in `requirements` with `evidenceStrength: "none"` and is *not* used to generate a bullet.

---

## 3. Processing Pipeline (Acceptance Criteria Per Stage)

### Stage 1 — Requirement Extraction
- **Input:** `jobPostingText`
- **Output:** list of discrete requirement claims (`requirements[].requirementText`)
- **Acceptance criteria:**
  - Each requirement is a single, atomic claim (not a run-on of multiple requirements)
  - Requirements are extracted only from the posting — no inferred/invented requirements
  - At least 80% of testers (manual review) agree the extracted list reasonably reflects the posting's actual asks

### Stage 2 — Evidence Matching
- **Input:** `requirements[]`, `resumeText`
- **Output:** `evidenceStrength` + `sourceSpans` per requirement
- **Acceptance criteria:**
  - Every `evidenceStrength: strong` or `partial` requirement has at least one non-empty `sourceSpans` entry
  - `sourceSpans` text must be verifiably present (or a close paraphrase) in the original `resumeText` — no fabricated source spans
  - Matching must work across vocabulary differences (e.g. "managed a classroom of 30 students" → evidence for "team leadership"), not just literal keyword overlap

### Stage 3 — Grounded Rewrite Generation
- **Input:** requirements with `evidenceStrength: strong/partial`, their `sourceSpans`
- **Output:** `tailoredResume.bullets[]`
- **Acceptance criteria:**
  - **Hard constraint:** no bullet is generated for a requirement with `evidenceStrength: none`
  - Every generated bullet includes non-empty `sourceSpans`
  - Rewritten bullets use the target field's vocabulary while staying factually consistent with the source span (no invented numbers, titles, or scope not present in the original)

### Stage 4 — Defensibility Reasoning
- **Input:** each generated bullet + its `sourceSpans`
- **Output:** `defensibility.flag` + `likelyFollowUpQuestion`
- **Acceptance criteria:**
  - `flag` is one of exactly two values: `likely_defensible` or `be_ready_to_elaborate`
  - `likelyFollowUpQuestion` is phrased as a realistic recruiter/interviewer question, not generic ("Tell me more") boilerplate
  - Bullets that closely mirror their source span generally trend toward `likely_defensible`; bullets that involved more reframing/translation trend toward `be_ready_to_elaborate`

### Stage 5 — Overall Verdict
- **Input:** all requirements + their evidence strength
- **Output:** `overallVerdict`
- **Acceptance criteria:**
  - Verdict reasoning references specific requirements (not generic praise/criticism)
  - Verdict is framed as a recruiter's likely read, not a numeric score

---

## 4. UI Requirements (high-level, expanded in architecture doc)

- Two-pane input: resume textarea + job posting textarea
- One-click "Tailor My Resume" action
- Results view showing:
  - Original resume (for reference)
  - Tailored resume with each bullet visually linked/expandable to its source span
  - Defensibility flag + follow-up question shown per bullet (e.g. as a hover/expand)
  - Overall verdict displayed prominently at the top of results

---

## 5. Out of Scope (v1)
Confirmed from PRD — explicitly excluded:
- File upload (PDF/DOCX) — text paste only
- Resume formatting/export to PDF
- Cover letter generation
- Accounts/login, saved history
- Multi-posting comparison

---

## 6. Testing Notes
Minimum 3 unit tests should cover:
1. Requirement extraction returns a non-empty, reasonably-structured list for a sample job posting
2. Evidence matching never returns a `sourceSpans` entry that isn't present (or substantially present) in the input resume text
3. Rewrite generation never produces a bullet for a requirement marked `evidenceStrength: none`

These three map directly to the "no fabrication" hard constraint, which is the riskiest and most important behavior to verify.
