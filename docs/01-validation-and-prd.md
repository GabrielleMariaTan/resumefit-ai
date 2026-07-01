# Phase 1 — Validate and Define
## Project: ResumeFit — Evidence-Grounded Resume Tailoring for Career Switchers
*"ResumeFit rewrites your resume to match any job posting — but only using evidence it can point to in your real experience, and it tells you whether you could actually defend each claim in an interview."*

---

## Why Now

Two trends are converging right now that make this the right moment for ResumeFit specifically, rather than a generic resume tool.

AI resume tools have become mainstream almost overnight, but trust hasn't caught up. As shown in the market evidence below, recruiters are increasingly reporting that AI-polished resumes are harder to verify, slower to screen, and create a "resume illusion" — a gap between what's written and what a candidate can actually defend. A 2025 industry survey found nearly one in five recruiters would reject a candidate specifically for AI-generated application content. This distrust problem barely existed a few years ago; it's a direct byproduct of how fast AI writing tools have been adopted, which makes a defensibility-first tool timely in a way it wouldn't have been even in 2023.

Career switching itself has also become more common and more necessary, as automation, layoffs, and industry restructuring push more people to look outside their original field — exactly the population our survey data confirms is being underserved by tools built for same-field job hunting. The convergence of more people switching fields and less trust in AI-assisted applications is precisely the gap ResumeFit is built to close, and it's a gap that's widening, not stabilizing.

---

## Step 1: The Specific User

The target user is career switchers — people moving from one field into a new one where their existing experience doesn't map 1:1 onto the job posting's language, and who are wary of generic AI resume tools producing claims they can't back up.

Concrete personas represented in this research include a public school teacher applying to corporate L&D / instructional design roles, a call center or BPO agent applying to customer success or account management roles, a retail or operations manager applying to project coordinator roles, and corporate professionals moving into technology or design fields.

Generic resume tailoring tools assume the user already speaks the target industry's language and just needs polish. Career switchers don't have that — their real blocker is translation, not vocabulary. And when they do use AI tools to "tailor" their resume, they're often left uneasy: did it just write something they can't actually back up in an interview?

---

## Step 2: Problem Interviews (User Evidence)

Twenty-two responses were collected via a short survey distributed to career shifters (June 29–July 1, 2026). Respondents spanned a real mix of transitions: engineering → design, teaching → ed-psych, market research → psychology, manufacturing (lateral), HR → education, art → finance, finance → marketing, corporate → tech, education → applied math academia, architecture → fashion design, mental health → social work-adjacent, tourism → IT, engineering → data analyst, NGO → events/creatives, psychology → HR, telecom → power plant, and several intra-industry lateral moves.

Respondents were asked five questions: the hardest part of applying outside their field; whether they'd been rejected or ignored without knowing why; whether they'd used AI to tailor their resume and whether it felt accurate; whether anything on their resume, AI-written or not, was hard to explain in an interview; and whether an honest "would a recruiter advance you, and why" tool would be useful.

### Key findings

The "translation" problem is real and consistent. The dominant theme across responses wasn't lack of skill, but lack of legible evidence of skill. Respondents described the hardest part as "skill overlap and skills needed for transfer," "convincing employers that corporate experience is transferable... despite limited direct background," and being "rejected for interviews due to lack of experience but cannot gain experience without being given a chance" — a direct articulation of the translation gap this product addresses, not a generic "I need more skills" complaint.

Rejection without explanation is close to universal. Twelve of twenty-two respondents said yes to having been rejected or ignored without knowing why; most of the rest said "not yet" or implied uncertainty rather than a clear no. This validates the demand for a tool that explains why a recruiter would or wouldn't advance someone, not just a pass/fail score.

AI resume tools are already widely used, but trust is inconsistent — the strongest validation for the traceability and defensibility angle. Several respondents specifically flagged accuracy problems with AI-generated content. One respondent said AI "would inflate my skills and add unnecessary keywords to my project background" — direct evidence of the fabrication risk the grounded-rewrite feature is designed to prevent. Another noted AI's word choice "may be exaggerated" and that something "more personal still feels better." A third said outright that "some parts of my resume were worded better than I could explain them during the interview" — close to a verbatim restatement of the exact defensibility problem the product is built around.

Interview defensibility gaps are common, independent of AI use. Several respondents confirmed they'd had resume content, AI-written or not, they couldn't fully explain when asked about it directly — validating that the defensibility-check feature has value even for non-AI-assisted resumes.

Demand for an honest recruiter-style verdict is strong. Nearly every respondent who answered the final question said yes, this would be useful — citing reasons like wanting to "understand my weaknesses and improve my application before submitting," wanting reassurance, and wanting help knowing what to work on. One respondent was skeptical specifically for their niche field (education/psychology), a useful caveat suggesting the tool's value may vary by how standardized a field's hiring language is.

### Representative quotes (paraphrased, anonymized by role)

> "[The hardest part is] convincing employers that my corporate experience is transferable to a technology role despite my limited direct tech background." — Corporate → Technology respondent

> AI "would inflate my skills and add unnecessary keywords to my project background." — Engineering → Design respondent

> "Some parts of my resume were worded better than I could explain them during the interview." — Architecture → Fashion Design respondent

> "Some of the wording sounded too advanced, so I had to explain it in simpler terms." — Tourism → IT respondent

> An honest recruiter-style tool "would help me understand my weaknesses and improve my application before submitting it." — Corporate → Technology respondent

Full anonymized survey responses are available in `docs/raw-survey-responses.csv`.

---

## Step 3: The Problem (Problem Evidence)

Career switchers applying for roles outside their current field struggle to communicate that their existing experience is relevant, because hiring processes and job postings use industry-specific language that doesn't match how their experience was earned or described in their previous field. Survey evidence confirms this isn't a vocabulary issue alone: twelve of twenty-two respondents reported being rejected or ignored without explanation, and several specifically described AI resume tools inflating or exaggerating their experience in ways they couldn't actually defend when asked about it directly. This results in candidates either submitting resumes they don't fully trust, or being screened out despite having real, relevant transferable experience.

This problem is grounded in the Step 2 survey data above, supported by general ATS and career-switch friction statistics and AI-resume trust statistics below. A concrete example: the Architecture → Fashion Design respondent's quote that some resume content was "worded better than I could explain it during the interview" is a direct, specific instance of the exact problem this product solves.

---

## Step 4: Market Demand (Market Evidence)

Real, sourced evidence supports both halves of the problem: translation difficulty, and distrust of AI-generated resume content.

### A. Evidence of the career-switch translation problem (Philippine context)

On r/phcareers, a delayed graduate with no formal work experience but real organizational responsibilities described wanting to move into an Executive Assistant role, but found that job postings for that role consistently demanded years of experience she didn't have — illustrating exactly the gap between real transferable responsibility and how job postings phrase formal "experience." ([r/phcareers via Photon Reddit](https://photon-reddit.com/r/phcareers))

A separate r/phcareers thread described a candidate with eight years of IT experience struggling specifically with how to verbally translate hands-on technical troubleshooting work into the structured, spoken explanation style expected in interviews — a clear case of real skill that doesn't map cleanly into the new context's expected language. ([r/phcareers via Photon Reddit](https://photon-reddit.com/r/phcareers))

### B. Evidence of AI-resume distrust and the "resume illusion"

A Robert Half survey of 2,000 U.S. hiring managers found that a majority of HR leaders say reviewing AI-generated applications has slowed their hiring process, with a notable share reporting delays of multiple weeks — and a separate stat from the same survey found most hiring managers say AI-enhanced resumes make candidate skills harder to verify. ([The Interview Guys](https://blog.theinterviewguys.com/why-ai-resumes-are-backfiring-in-2026/))

Industry coverage describes a "resume illusion" — a growing gap between what an AI-polished resume claims and what the candidate can actually demonstrate once behavioral interview questions probe for specifics — with the resume passing initial screening but the candidate struggling in the actual conversation. ([The Interview Guys](https://blog.theinterviewguys.com/why-ai-resumes-are-backfiring-in-2026/))

A hiring-side write-up described reviewing hundreds of applications and finding that AI-generated resumes get callbacks but then go silent at the next stage, attributed directly to candidates being unable to speak fluently to their own AI-written bullet points when asked follow-up questions. ([Leon Consulting](https://leonstaff.com/blogs/why-ai-generated-resumes-fail-interviews/))

A 2025 industry survey found nearly one in five recruiters said they would reject a candidate specifically for submitting an AI-generated resume or cover letter, confirming this isn't a fringe concern. ([AiApply](https://aiapply.co/blog/can-employers-tell-if-you-use-ai-for-a-cover-letter))

### Why this strengthens the differentiator

The market problem isn't just that AI resumes look generic — it's that recruiters increasingly can't trust what's on the page, and candidates get caught off guard when asked to defend it. That is exactly the gap the traceability and defensibility-check feature is designed to close.

---

## Step 5: The Differentiating Angle

Unlike AI resume tailoring tools that rewrite freely to sound impressive, ResumeFit only rewrites what it can justify: every claim in the tailored resume is traceable back to specific evidence in the user's original resume, and each rewritten bullet is flagged with whether the user could realistically defend it if a recruiter probed further in an interview.

This rests on four supporting pillars. First, grounded rewriting, not free generation: the AI extracts the job posting's requirements as discrete claims, checks the original resume for real evidence of each, and only writes a tailored bullet when it can point to the specific source sentence(s) that justify it — no evidence, no rewrite. Second, traceability as a trust feature: the output shows each rewritten bullet linked back to the original resume content it came from, so the user can verify nothing was invented. Third, an interview-defensibility check: for each rewritten bullet, the tool flags a likely recruiter follow-up question and a confidence read on whether the user could comfortably answer it, turning "looks good on paper" into "survives the actual conversation." Fourth, the product is built for translation, not embellishment — focused specifically on reframing real but differently-worded experience into the target industry's language, not adding skills the user doesn't have.

---

## Step 6: Competitive Scan

| Tool | What it does well | Where it falls short for this user |
|---|---|---|
| Jobscan | Keyword/ATS match scoring | No rewriting, no traceability, no translation logic for switchers |
| Teal | Resume builder + AI rewrite suggestions | Rewrites for polish/keywords, no evidence-grounding or interview-defensibility check |
| Rezi | ATS-optimized resume writing | Optimizes wording, can over-embellish, no link back to source evidence |
| ChatGPT (generic prompt) | Flexible, can rewrite anything | No structured extraction of requirements, no traceability, prone to fabricating plausible-sounding claims |

No existing tool combines resume tailoring with a verifiable trace back to the user's real experience, or warns the user which rewritten claims they might struggle to defend in an interview. The market addresses "does this look good," not "can I actually back this up."

---

## Step 7: Success Criteria and Scope for v1

The v1 product accepts a pasted resume and a pasted job posting as plain text, extracts the job posting's requirements as discrete, evaluable claims, and for each requirement assesses resume evidence — generating a rewritten bullet only when evidence exists, with a visible link back to the original resume text it's grounded in. Each rewritten bullet is flagged with a likely recruiter follow-up question and a simple defensibility read. The output is a full tailored resume draft, not just sample bullets, displayed in a usable web UI alongside the original resume and the evidence links.

v1 explicitly does not invent or imply experience the user doesn't have, under any circumstance — this is a hard constraint, not a nice-to-have. It also does not include full resume formatting or design templates, cover letter generation, job board integration or job search, or multi-resume comparison, tracking, or accounts.

Success is measured by running real resume and posting pairs from survey respondents willing to share a sample resume, and confirming that every rewritten claim can be traced to real source content, and that the defensibility flags align with what a real respondent says they could or couldn't actually elaborate on in an interview.

---
---

# 1-Page PRD: ResumeFit — Evidence-Grounded Resume Tailoring

**Product name:** ResumeFit (working title)

**Problem statement**
Career switchers struggle to communicate that their existing experience is relevant to a new field, because job postings use industry-specific language their resumes don't mirror. When they use AI tools to tailor their resume, the rewritten content often drifts from what they can actually prove — producing resumes that read well but leave the candidate unable to defend their own claims in an interview, or hesitant to submit the resume at all.

**Target user**
Career switchers moving into adjacent or unrelated fields (e.g. teacher → instructional design, BPO/corporate → tech, engineering → design, architecture → fashion design). Validated through a survey of 22 real career-shifters across varied industry transitions (June–July 2026), who described both the translation difficulty and discomfort with AI-generated resume content they couldn't fully stand behind — see Step 2 above for full findings.

**Differentiating angle**
Unlike AI resume tailoring tools that rewrite freely, ResumeFit only rewrites what it can justify: every tailored bullet is traceable back to specific evidence in the original resume, and is flagged with whether the user could realistically defend it under interview questioning.

**Core AI capability**
The pipeline parses the job posting into a list of discrete requirement claims and parses the resume into a list of experience statements. For each requirement, it assesses evidence strength in the original resume — strong, partial, or none — even across vocabulary differences. It then generates a tailored resume rewrite, producing a bullet only where evidence exists; each rewritten bullet carries a citation back to its source sentence(s) in the original resume. Finally, for each rewritten bullet, it generates a likely recruiter follow-up question and a defensibility flag of either likely defensible or be ready to elaborate.

**Key features (v1 scope)**
Paste-in resume and job posting as plain text; a full tailored resume draft, not just sample bullets; visible traceability where each rewritten bullet links back to the original resume content it's grounded in; an interview-defensibility flag and likely follow-up question per rewritten bullet; and a usable web UI showing the original resume, tailored resume, and evidence trace side by side.

**Out of scope for v1**
Inventing experience the user doesn't have is a hard constraint that is never relaxed. Also excluded: resume formatting and templates, cover letters, job board integration, multi-resume tracking, accounts or login, and payment processing.

**Success criteria**
Every rewritten claim in test cases traces to real, identifiable content in the original resume, with zero fabricated claims. Defensibility flags align with what real respondents say they could or couldn't elaborate on. The app is deployed to a live URL, testable in incognito. At least one respondent confirms the traceability and defensibility feature made them trust the output more than a generic AI rewrite.

**Risks and open questions**
The core technical risk is ensuring the LLM strictly grounds rewrites in source evidence and doesn't fabricate, which needs explicit prompting guardrails and spot-checking rather than trust in the model alone. The defensibility flag is itself an AI judgment, not a guarantee, so it needs careful wording so it reads as a helpful prompt rather than a false promise. There is also a tone risk: traceability and defensibility framing could feel like homework rather than help if the UI isn't designed carefully, which is worth testing directly with users. Finally, keeping scope tight — resisting the urge to add a resume builder, cover letters, or templates — is the main discipline challenge for the build phase.