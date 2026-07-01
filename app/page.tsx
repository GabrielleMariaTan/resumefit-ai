'use client';

import { useState } from 'react';

// ── Response types (mirror the spec Section 3 output schema) ──────────────────

type EvidenceStrength = 'strong' | 'partial' | 'none';
type DefensibilityFlag = 'likely_defensible' | 'be_ready_to_elaborate';
type VerdictSummary = 'likely_to_advance' | 'likely_screened_out' | 'mixed';

interface TailoredBullet {
  id: string;
  rewrittenText: string;
  linkedRequirementIds: string[];
  sourceSpans: string[];
  defensibility: {
    flag: DefensibilityFlag;
    likelyFollowUpQuestion: string;
  };
}

interface Requirement {
  id: string;
  requirementText: string;
  evidenceStrength: EvidenceStrength;
  sourceSpans: string[];
}

interface TailorResult {
  requirements: Requirement[];
  tailoredResume: { bullets: TailoredBullet[] };
  overallVerdict: { summary: VerdictSummary; reasoning: string };
}

// ── Styling maps ──────────────────────────────────────────────────────────────

const VERDICT_CONFIG: Record<
  VerdictSummary,
  { wrapper: string; label: string; dot: string; heading: string; displayText: string }
> = {
  likely_to_advance: {
    wrapper: 'bg-emerald-50 border border-emerald-200',
    label: 'text-emerald-700',
    dot: 'bg-emerald-500',
    heading: 'text-emerald-900',
    displayText: 'Likely to Advance',
  },
  mixed: {
    wrapper: 'bg-amber-50 border border-amber-200',
    label: 'text-amber-700',
    dot: 'bg-amber-500',
    heading: 'text-amber-900',
    displayText: 'Mixed Fit',
  },
  likely_screened_out: {
    wrapper: 'bg-red-50 border border-red-200',
    label: 'text-red-700',
    dot: 'bg-red-500',
    heading: 'text-red-900',
    displayText: 'Likely Screened Out',
  },
};

const DEFENSIBILITY_CONFIG: Record<DefensibilityFlag, { badge: string; label: string }> = {
  likely_defensible: {
    badge: 'bg-green-100 text-green-800',
    label: 'Likely Defensible',
  },
  be_ready_to_elaborate: {
    badge: 'bg-amber-100 text-amber-800',
    label: 'Be Ready to Elaborate',
  },
};

const MIN_LENGTH = 100;

// ── Main component ────────────────────────────────────────────────────────────

export default function Home() {
  const [resumeText, setResumeText] = useState('');
  const [jobPostingText, setJobPostingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [expandedBullets, setExpandedBullets] = useState<Set<string>>(new Set());

  function toggleBullet(id: string) {
    setExpandedBullets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    setError(null);

    const trimmedResume = resumeText.trim();
    const trimmedPosting = jobPostingText.trim();

    if (!trimmedResume) {
      setError('Please paste your resume before continuing.');
      return;
    }
    if (trimmedResume.length < MIN_LENGTH) {
      setError(
        `Resume is too short — please paste the full text (at least ${MIN_LENGTH} characters).`,
      );
      return;
    }
    if (!trimmedPosting) {
      setError('Please paste the job posting before continuing.');
      return;
    }
    if (trimmedPosting.length < MIN_LENGTH) {
      setError(
        `Job posting is too short — please paste the full text (at least ${MIN_LENGTH} characters).`,
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobPostingText }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError((data as { error?: string }).error ?? 'Something went wrong. Please try again.');
        return;
      }

      setResult(data as TailorResult);
      setExpandedBullets(new Set());
    } catch {
      setError('Could not reach the server. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    setExpandedBullets(new Set());
  }

  // ── Results view ────────────────────────────────────────────────────────────

  if (result) {
    const verdict = VERDICT_CONFIG[result.overallVerdict.summary];
    const { bullets } = result.tailoredResume;

    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Page header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ResumeFit</h1>
              <p className="text-sm text-gray-500 mt-0.5">Evidence-grounded resume tailoring</p>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-2 mt-1 transition-colors"
            >
              ← Start over
            </button>
          </div>

          {/* Verdict banner */}
          <div className={`rounded-xl px-5 py-4 mb-8 ${verdict.wrapper}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${verdict.dot}`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${verdict.label}`}>
                Recruiter Verdict
              </span>
            </div>
            <p className={`text-lg font-semibold mb-1.5 ${verdict.heading}`}>
              {verdict.displayText}
            </p>
            <p className={`text-sm leading-relaxed ${verdict.label}`}>
              {result.overallVerdict.reasoning}
            </p>
          </div>

          {/* Tailored resume */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Tailored Resume</h2>

            {bullets.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 leading-relaxed">
                  No tailored bullets could be generated — the resume did not contain verifiable
                  evidence for any of the job requirements. Consider adding relevant experience to
                  your resume before re-running.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {bullets.map((bullet) => {
                  const def = DEFENSIBILITY_CONFIG[bullet.defensibility.flag];
                  const isExpanded = expandedBullets.has(bullet.id);

                  return (
                    <li key={bullet.id} className="bg-white border border-gray-200 rounded-xl p-5">
                      {/* Rewritten bullet text */}
                      <p className="text-sm text-gray-900 leading-relaxed mb-3">
                        {bullet.rewrittenText}
                      </p>

                      {/* Source span toggle */}
                      {bullet.sourceSpans.length > 0 && (
                        <div className="mb-3">
                          <button
                            onClick={() => toggleBullet(bullet.id)}
                            aria-expanded={isExpanded}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                            {isExpanded ? 'Hide source' : 'View source from your resume'}
                          </button>
                          {isExpanded && (
                            <div className="mt-2 pl-3 border-l-2 border-blue-100 space-y-1">
                              {bullet.sourceSpans.map((span, i) => (
                                <p key={i} className="text-xs text-gray-500 italic leading-relaxed">
                                  &ldquo;{span}&rdquo;
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Defensibility */}
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-fit text-xs font-medium px-2 py-0.5 rounded-full ${def.badge}`}
                        >
                          {def.label}
                        </span>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          <span className="font-medium text-gray-600">Likely follow-up: </span>
                          {bullet.defensibility.likelyFollowUpQuestion}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
    );
  }

  // ── Input form ──────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ResumeFit</h1>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            Tailors your resume to a job posting — only using evidence it can trace back to your
            real experience, and flags which claims you might struggle to defend in an interview.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Resume */}
          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-800 mb-1.5">
              Your resume
            </label>
            <textarea
              id="resume"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={10}
              placeholder="Paste your resume here as plain text…"
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">{resumeText.trim().length} / 6,000 characters</p>
          </div>

          {/* Job posting */}
          <div>
            <label htmlFor="posting" className="block text-sm font-medium text-gray-800 mb-1.5">
              Job posting
            </label>
            <textarea
              id="posting"
              value={jobPostingText}
              onChange={(e) => setJobPostingText(e.target.value)}
              rows={10}
              placeholder="Paste the full job posting here as plain text…"
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">
              {jobPostingText.trim().length} / 6,000 characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-medium text-sm rounded-lg px-4 py-2.5 transition-colors"
          >
            {isLoading ? 'Tailoring your resume…' : 'Tailor My Resume'}
          </button>

          {isLoading && (
            <p className="text-xs text-center text-gray-400">
              Running the AI pipeline — this typically takes 10–15 seconds.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
