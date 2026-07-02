# Reflection: Building ResumeFit
## Week 4 Graded Assignment — Build and Deploy an AI-Powered Web Application

---

## What I Built

ResumeFit is an AI-powered web application that tailors a user's resume to a specific job posting — but unlike generic AI resume tools, it only rewrites bullets it can trace back to real evidence in the user's original resume. Each rewritten bullet shows where it came from, flags whether the user could defend it in an interview, and generates a suggested answer to the likely recruiter follow-up question. The app is built on Next.js 14, uses the Anthropic Claude API through a five-stage sequential AI pipeline, and is deployed live on Vercel.

The core technical insight was that a single "rewrite this resume" prompt cannot enforce the no-fabrication constraint — only a multi-stage pipeline where each stage's output is independently validated can. Stage 1 extracts job requirements as discrete claims. Stage 2 matches each requirement against the resume and captures source spans. Stage 3 generates rewritten bullets only for requirements with evidence. Stage 4 adds defensibility reasoning and suggested interview answers. Stage 5 produces an overall recruiter-style verdict. This architecture was deliberately more complex than a single prompt, but it's what makes the product's core promise — "we only rewrite what we can prove" — actually enforceable in code rather than just hoped for from the model.

---

## What I Learned

The most important thing I learned is the difference between prompting an AI to behave a certain way versus enforcing that behavior in code. Early testing showed that even with explicit instructions not to fabricate, the model would sometimes produce source spans with low similarity to the original resume text. The fix wasn't a better prompt — it was a `tokenOverlap` function that checked the fraction of content words in any source span against the actual resume text, and demoted evidence strength to "none" if the overlap fell below 0.5. That code-level guardrail is what makes the traceability feature trustworthy, not just the prompt.

I also learned that building an AI-powered product is as much about trust design as it is about AI capability. The survey data from 22 career switchers showed that people weren't just frustrated by translation difficulty — they were specifically worried about AI resume tools producing things they couldn't stand behind. Every design decision in ResumeFit (the "View source from your resume" toggle, the defensibility badge, the "use this as a starting point" disclaimer on suggested answers) was directly shaped by that validated user concern. Good product thinking came before good engineering.

Finally, I learned how much scaffolding matters when building with AI coding tools. Writing `CLAUDE.md` and `docs/02-spec.md` before generating a single line of application code meant that Claude Code had explicit constraints to work within — especially the no-fabrication rule — rather than generating plausible-looking but unconstrained code. The planning documents weren't just assignment deliverables; they were the system prompt for the AI that built the system.

---

## Challenges

The biggest technical challenge was getting the multi-stage pipeline to return consistent, parseable JSON. Even with explicit "return JSON only, no markdown" instructions, the model would intermittently wrap responses in code fences. The fix was a `stripFences()` function applied before every `JSON.parse()` call across all five stages — a small change with a large reliability impact.

The OneDrive/Git interaction on Windows caused persistent commit friction, with `rmdir` permission errors after every push. This was a workflow annoyance rather than a real problem, but it slowed down the commit cadence early in the project.

Scope discipline was harder than expected. The temptation to add cover letter generation, PDF upload, and user accounts was real — all of them are natural extensions of what ResumeFit does. Keeping the `docs/02-spec.md` out-of-scope list visible and referring back to it when Claude Code started drifting toward feature additions helped maintain focus on shipping a working v1 over building a half-finished v2.

---

## What I Would Improve

The most valuable v2 improvement would be PDF and DOCX file upload support (logged as GitHub Issue #1), which removes the friction of manually copying resume text. Several survey respondents described this as a barrier, and it would make the tool significantly more accessible to non-technical users.

Beyond that, I would invest more time in prompt engineering for the suggested interview answer feature — the current answers are grounded and honest but sometimes read as more cautious than necessary. A second pass focused on tone (confident but truthful, not hedged) would make the suggested answers more immediately useful to users who are nervous about interviews.

I would also add basic analytics (even just page view and submission counts via Vercel Analytics) to understand how people actually use the tool — whether they read every bullet carefully or just look at the verdict, how often they expand the source span toggle, and whether the suggested answers are actually read or ignored.

---

*Built by Gabrielle Maria Tan as part of the AIM Week 4 Graded Assignment.*
*Live app: https://resumefit-ai-nine.vercel.app*
*Repository: https://github.com/GabrielleMariaTan/resumefit-ai*