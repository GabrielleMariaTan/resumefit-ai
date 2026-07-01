import { extractRequirements } from './stages/extract-requirements';
import { matchEvidence } from './stages/match-evidence';
import { generateRewrite } from './stages/generate-rewrite';
import { assessDefensibility } from './stages/assess-defensibility';
import { generateVerdict } from './stages/generate-verdict';
import type { RequirementWithEvidence, TailoredBulletWithDefensibility, OverallVerdict } from './types';

export interface PipelineInput {
  resumeText: string;
  jobPostingText: string;
}

export interface PipelineOutput {
  requirements: RequirementWithEvidence[];
  tailoredResume: {
    bullets: TailoredBulletWithDefensibility[];
  };
  overallVerdict: OverallVerdict;
}

export async function runPipeline(input: PipelineInput): Promise<PipelineOutput> {
  // Stage 1 — extract discrete requirement claims from the job posting
  const extracted = await extractRequirements(input.jobPostingText);

  // Stage 2 — match each requirement against the resume; assign evidenceStrength + sourceSpans
  const requirements = await matchEvidence(extracted, input.resumeText);

  // Stage 3 — generate grounded rewrites; only supported requirements reach this stage
  const rawBullets = await generateRewrite(requirements);

  // Stage 4 — assess interview defensibility for each rewritten bullet
  const bullets = await assessDefensibility(rawBullets);

  // Stage 5 — produce an overall recruiter-style verdict across all requirements
  const overallVerdict = await generateVerdict(requirements);

  return {
    requirements,
    tailoredResume: { bullets },
    overallVerdict,
  };
}
