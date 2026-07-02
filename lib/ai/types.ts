export interface ExtractedRequirement {
  id: string;
  requirementText: string;
}

export type EvidenceStrength = 'strong' | 'partial' | 'none';

export interface RequirementWithEvidence extends ExtractedRequirement {
  evidenceStrength: EvidenceStrength;
  sourceSpans: string[];
}

export interface TailoredBullet {
  id: string;
  rewrittenText: string;
  linkedRequirementIds: string[];
  sourceSpans: string[];
}

export type DefensibilityFlag = 'likely_defensible' | 'be_ready_to_elaborate';

export interface Defensibility {
  flag: DefensibilityFlag;
  likelyFollowUpQuestion: string;
  suggestedAnswer: string;
}

export interface TailoredBulletWithDefensibility extends TailoredBullet {
  defensibility: Defensibility;
}

export type VerdictSummary = 'likely_to_advance' | 'likely_screened_out' | 'mixed';

export interface OverallVerdict {
  summary: VerdictSummary;
  reasoning: string;
}
