# Phase 1 — Validate and Define
## Project: ResumeFit — Evidence-Grounded Resume Tailoring for Career Switchers
*"ResumeFit rewrites your resume to match any job posting — but only using evidence it can point to in your real experience, and it tells you whether you could actually defend each claim in an interview."*

---

## Why Now

Two trends are converging right now that make this the right moment for ResumeFit specifically, rather than a generic resume tool:

1. **AI resume tools have become mainstream almost overnight, but trust hasn't caught up.** As shown in Step 4's market evidence, recruiters are increasingly reporting that AI-polished resumes are harder to verify, slower to screen, and create a "resume illusion" — a gap between what's written and what a candidate can actually defend. A 2025 industry survey found nearly one in five recruiters would reject a candidate specifically for AI-generated application content. This distrust problem barely existed three years ago; it's a direct byproduct of how fast AI writing tools have been adopted, which makes a *defensibility-first* tool timely in a way it wouldn't have been even in 2023.
2. **Career switching itself has become more common and more necessary**, as automation, layoffs, and industry restructuring push more people to look outside their original field — exactly the population our own survey data (Step 2) confirms is being underserved by tools built for same-field job hunting. The convergence of "more people switching fields" and "less trust in AI-assisted applications" is precisely the gap ResumeFit is built to close, and it's a gap that's widening, not stabilizing — making this a better moment to build this than either one year ago or one year from now once a trust-focused competitor likely fills the space.

---

## Step 1: Identify the Specific User

**Target user:** Career switchers — people moving from one field into a new one where their existing experience doesn't map 1:1 onto the job posting's language, and who are wary of generic AI resume tools producing claims they can't back up.

**Concrete example personas (pick 1-2 to interview, don't try to serve all of them):**
- A public school teacher applying to corporate L&D / instructional design roles
- A call center / BPO agent applying to customer success or account management roles
- A retail/ops manager applying to project coordinator roles
- A nurse applying to health-tech customer support or clinical ops roles

**Why this group specifically:** Generic resume tailoring tools assume the user already speaks the target industry's language and just needs polish. Career switchers don't have that — their real blocker is *translation*, not vocabulary. And when they do use AI tools to "tailor" their resume, they're often left uneasy: did it just write something I can't actually back up in an interview?

**Action item:** Write down 3 names of real people you know (or can reach through LinkedIn/FB groups/AIM alumni network) who fit one persona. You need to actually talk to 3-5 of them for Step 2.

---


## Step 2: Conduct Problem Interviews (User Evidence)

**Status: ✅ Completed** — 11 responses collected via a short survey distributed to career shifters (Google Form / quick survey, June 29–30, 2026). Respondents spanned a real mix of transitions: engineering → design, teaching → ed-psych, market research → psychology, manufacturing (lateral), HR → education, art → finance, finance → marketing, corporate → tech, education → applied math academia, architecture → fashion design, and mental health → social work-adjacent.

**Method note:** Respondents were asked five questions: (1) hardest part of applying outside their field, (2) whether they'd been rejected/ignored without knowing why, (3) whether they'd used AI to tailor their resume and whether it felt accurate, (4) whether anything on their resume (AI-written or not) was hard to explain in an interview, (5) whether an honest "would a recruiter advance you, and why" tool would be useful.

### Key findings

**1. The "translation" problem is real and consistent.** The dominant theme across responses wasn't lack of skill, but lack of legible evidence of skill. Respondents described the hardest part as "skill overlap and skills needed for transfer," "convincing employers that corporate experience is transferable... despite limited direct background," and being "rejected for interviews due to lack of experience but cannot gain experience without being given a chance" — a direct articulation of the translation gap this product addresses, not a generic "I need more skills" complaint.

**2. Rejection without explanation is close to universal.** 8 of 11 respondents said yes to having been rejected or ignored without knowing why; most of the rest said "not yet" or implied uncertainty rather than a clear no. This validates the demand for a tool that explains *why* a recruiter would or wouldn't advance someone, not just a pass/fail score.

**3. AI resume tools are already widely used, but trust is inconsistent — and this is the strongest validation for the traceability/defensibility angle.** Several respondents specifically flagged accuracy problems with AI-generated content:
- One respondent said AI "would inflate my skills and add unnecessary keywords to my project background" — direct evidence of the fabrication risk the grounded-rewrite feature is designed to prevent.
- Another noted AI's word choice "may be exaggerated" and that something "more personal still feels better."
- A third said outright that "some parts of my resume were worded better than I could explain them during the interview" — this is close to a verbatim restatement of the exact defensibility problem the product is built around.

**4. Interview defensibility gaps are common, independent of AI use.** Several respondents confirmed they'd had resume content (AI-written or not) they couldn't fully explain when asked about it directly — validating that the defensibility-check feature has value even for non-AI-assisted resumes.

**5. Demand for an honest recruiter-style verdict is strong.** Nearly every respondent who answered the final question said yes, this would be useful — citing reasons like wanting to "understand my weaknesses and improve my application before submitting," wanting reassurance, and wanting help knowing what to work on. One respondent was skeptical specifically for their niche field (education/psychology), which is a useful caveat: the tool's value may vary by how standardized a field's hiring language is.

### Representative quotes (paraphrased, anonymized by role)

> "[The hardest part is] convincing employers that my corporate experience is transferable to a technology role despite my limited direct tech background." — Corporate → Technology respondent

> AI "would inflate my skills and add unnecessary keywords to my project background." — Engineering → Design respondent

> "Some parts of my resume were worded better than I could explain them during the interview." — Architecture → Fashion Design respondent

> An honest recruiter-style tool "would help me understand my weaknesses and improve my application before submitting it." — Corporate → Technology respondent

### Raw data
Full anonymized survey responses are available in `docs/raw-survey-responses.csv` for reference.

---

## Step 3: Document the Problem (Problem Evidence)

**Status: ✅ Completed**, based on survey evidence from Step 2.

**Problem statement:**
> Career switchers applying for roles outside their current field struggle to communicate that their existing experience is relevant, because hiring processes and job postings use industry-specific language that doesn't match how their experience was earned or described in their previous field. Survey evidence confirms this isn't a vocabulary issue alone: 8 of 11 respondents reported being rejected or ignored without explanation, and several specifically described AI resume tools inflating or exaggerating their experience in ways they couldn't actually defend when asked about it directly. This results in candidates either submitting resumes they don't fully trust, or being screened out despite having real, relevant transferable experience.

**Supporting evidence:**
- Primary: Step 2 survey data (11 respondents, see above)
- Secondary: general ATS/career-switch friction statistics and AI-resume trust statistics (see Step 4)
- Concrete example: the Architecture → Fashion Design respondent's quote that some resume content was "worded better than I could explain it during the interview" is a direct, specific instance of the exact problem this product solves — worth featuring prominently in your final report or demo.

---

## Step 4: Validate Market Demand (Market Evidence)

You don't need a huge market study — just enough evidence this isn't a problem of one. Below is real, sourced evidence gathered for both halves of the problem (translation difficulty, and distrust of AI-generated resume content). All sources are paraphrased per citation rules — follow the links to read full context, and add your own screenshots for your actual submission.

### A. Evidence of the career-switch "translation" problem (Philippine context)

- On r/phcareers, a delayed graduate with no formal work experience but real organizational responsibilities described wanting to move into an Executive Assistant role, but found that job postings for that role consistently demanded years of experience she didn't have — illustrating exactly the gap between *real* transferable responsibility and how job postings phrase formal "experience." ([r/phcareers via Photon Reddit](https://photon-reddit.com/r/phcareers))
- A separate r/phcareers thread described a candidate with 8 years of IT experience struggling specifically with how to *verbally translate* their hands-on technical troubleshooting work into the structured, spoken explanation style expected in interviews — a clear case of real skill that doesn't map cleanly into the new context's expected language. ([r/phcareers via Photon Reddit](https://photon-reddit.com/r/phcareers))

### B. Evidence of AI-resume distrust / the "resume illusion" (general market, supports your defensibility angle directly)

- A Robert Half survey of 2,000 U.S. hiring managers found that a majority of HR leaders say reviewing AI-generated applications has slowed their hiring process, with a notable share reporting delays of multiple weeks — and a separate stat from the same survey found most hiring managers say AI-enhanced resumes make candidate skills harder to verify. ([The Interview Guys](https://blog.theinterviewguys.com/why-ai-resumes-are-backfiring-in-2026/))
- Industry coverage describes a "resume illusion" — a growing gap between what an AI-polished resume claims and what the candidate can actually demonstrate once behavioral interview questions probe for specifics — with the resume passing initial screening but the candidate struggling in the actual conversation. ([The Interview Guys](https://blog.theinterviewguys.com/why-ai-resumes-are-backfiring-in-2026/))
- A hiring-side write-up described reviewing hundreds of applications and finding that AI-generated resumes get callbacks but then go silent at the next stage — attributed directly to candidates being unable to speak fluently to their own AI-written bullet points when asked follow-up questions. ([Leon Consulting](https://leonstaff.com/blogs/why-ai-generated-resumes-fail-interviews/))
- A 2025 industry survey found nearly one in five recruiters said they would reject a candidate specifically for submitting an AI-generated resume or cover letter — confirming this isn't a fringe concern. ([AiApply](https://aiapply.co/blog/can-employers-tell-if-you-use-ai-for-a-cover-letter))

### C. Why this strengthens your differentiator
Part B is especially useful evidence for your pitch: the market problem isn't just "AI resumes look generic," it's that **recruiters increasingly can't trust what's on the page, and candidates get caught off guard when asked to defend it** — which is exactly the gap your traceability + defensibility-check feature is designed to close.

**Action item for your actual submission:** Take screenshots of the r/phcareers threads above (or find 1-2 fresh ones from your own search), and pair them with at least one quote/stat from section B in your final report.

---

## Step 5: Define the Differentiating Angle

**Differentiator statement:**
> Unlike AI resume tailoring tools that rewrite freely to sound impressive, ResumeFit only rewrites what it can justify: every claim in the tailored resume is traceable back to specific evidence in the user's original resume, and each rewritten bullet is flagged with whether the user could realistically defend it if a recruiter probed further in an interview.

**Supporting pillars:**
1. **Grounded rewriting, not free generation** — the AI extracts the job posting's requirements as discrete claims, checks the original resume for real evidence of each, and only writes a tailored bullet when it can point to the specific source sentence(s) that justify it. No evidence, no rewrite.
2. **Traceability as a trust feature** — the output shows each rewritten bullet linked back to the original resume content it came from, so the user can verify nothing was invented.
3. **Interview-defensibility check** — for each rewritten bullet, the tool flags a likely recruiter follow-up question and a confidence read on whether the user could comfortably answer it, turning "looks good on paper" into "survives the actual conversation."
4. **Built for translation, not embellishment** — focused specifically on reframing real but differently-worded experience into the target industry's language, not adding skills the user doesn't have.

---

## Step 6: Competitive Scan

| Tool | What it does well | Where it falls short for this user |
|---|---|---|
| Jobscan | Keyword/ATS match scoring | No rewriting, no traceability, no translation logic for switchers |
| Teal | Resume builder + AI rewrite suggestions | Rewrites for polish/keywords, no evidence-grounding or interview-defensibility check |
| Rezi | ATS-optimized resume writing | Optimizes wording, can over-embellish, no link back to source evidence |
| ChatGPT (generic prompt) | Flexible, can rewrite anything | No structured extraction of requirements, no traceability, prone to fabricating plausible-sounding claims |

**Conclusion to write in your PRD:** No existing tool combines resume tailoring with a verifiable trace back to the user's real experience, or warns the user which rewritten claims they might struggle to defend in an interview. The market addresses "does this look good" — not "can I actually back this up."

---

## Step 7: Define Success Criteria & Scope for v1

**v1 must do:**
- Accept a pasted resume (text) and a pasted job posting (text)
- Extract job posting requirements as discrete, evaluable claims
- For each requirement, assess resume evidence and only generate a rewritten bullet when evidence exists — with a visible link/citation back to the original resume text it's grounded in
- Flag each rewritten bullet with a likely recruiter follow-up question and a simple defensibility read (e.g. "likely defensible" / "be ready to elaborate")
- Output a full tailored resume draft (not just sample bullets) alongside the traceability and defensibility annotations
- Usable web UI showing original resume, tailored resume, and the evidence links side by side

**v1 explicitly will NOT do (write this down — it protects your scope):**
- Invent or imply experience the user doesn't have, under any circumstance — this is a hard constraint, not just a nice-to-have
- Full resume formatting/design templates
- Cover letter generation
- Job board integration or job search
- Multi-resume comparison, tracking, or accounts/login for v1

**Success metric for your demo:** Run 2-3 real resume/posting pairs (ideally from survey respondents who are willing to share a sample resume) and confirm: (1) every rewritten claim can be traced to real source content, (2) the defensibility flags align with what a real respondent says they could/couldn't actually elaborate on in an interview.

---

---

# 1-Page PRD: ResumeFit — Evidence-Grounded Resume Tailoring

**Product name:** ResumeFit (working title)

**Problem statement**
Career switchers struggle to communicate that their existing experience is relevant to a new field, because job postings use industry-specific language their resumes don't mirror. When they use AI tools to tailor their resume, the rewritten content often drifts from what they can actually prove — producing resumes that read well but leave the candidate unable to defend their own claims in an interview, or hesitant to submit the resume at all.

**Target user**
Career switchers moving into adjacent or unrelated fields (e.g. teacher → instructional design, BPO/corporate → tech, engineering → design, architecture → fashion design). Validated through a survey of 11 real career-shifters across varied industry transitions (June 2026), who described both the translation difficulty and discomfort with AI-generated resume content they couldn't fully stand behind — see [`01-validation-and-prd.md`](#step-2-conduct-problem-interviews-user-evidence) for full findings.

**Differentiating angle**
Unlike AI resume tailoring tools that rewrite freely, ResumeFit only rewrites what it can justify: every tailored bullet is traceable back to specific evidence in the original resume, and is flagged with whether the user could realistically defend it under interview questioning.

**Core AI capability**
1. Parse job posting → list of discrete requirement claims
2. Parse resume → list of experience statements
3. For each requirement, assess evidence strength in the original resume (strong / partial / none), even across vocabulary differences
4. Generate a tailored resume rewrite, but only produce a bullet where evidence exists — each rewritten bullet carries a citation/link back to its source sentence(s) in the original resume
5. For each rewritten bullet, generate a likely recruiter follow-up question and a defensibility flag (likely defensible / be ready to elaborate)

**Key features (v1 scope)**
- Paste-in resume + job posting (plain text input)
- Full tailored resume draft, not just sample bullets
- Visible traceability: each rewritten bullet links back to the original resume content it's grounded in
- Interview-defensibility flag + likely follow-up question per rewritten bullet
- Usable web UI showing original, tailored, and evidence trace side by side

**Out of scope for v1**
Inventing experience the user doesn't have (hard constraint), resume formatting/templates, cover letters, job board integration, multi-resume tracking, accounts/login, payment processing.

**Success criteria**
- Every rewritten claim in test cases traces to real, identifiable content in the original resume — zero fabricated claims
- Defensibility flags align with what real interviewees say they could/couldn't elaborate on
- Deployed to a live URL, testable in incognito
- At least one interviewee says the traceability/defensibility feature made them trust the output more than a generic AI rewrite

**Risks / open questions**
- Core technical risk: ensuring the LLM strictly grounds rewrites in source evidence and doesn't fabricate — needs explicit prompting guardrails and spot-checking, not just trust in the model
- Defensibility flag is itself an AI judgment, not a guarantee — needs careful wording so it reads as a helpful prompt, not a false promise
- Tone risk: traceability/defensibility framing could feel like "homework" rather than help if the UI isn't designed carefully — worth user-testing the wording
- Keeping scope tight (resist adding resume builder/cover letter/template features) will be the main discipline challenge

---

*Next step: Phase 2 — turn this PRD into architecture notes and spec.md, including how the grounding/citation mechanism will actually be implemented (e.g. structured extraction + evidence-matching prompts before generation).*
