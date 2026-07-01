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
