'use client';

import { useState } from 'react';

// ── Response types ────────────────────────────────────────────────────────────

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

// ── Design tokens ─────────────────────────────────────────────────────────────

const SILK = 'cubic-bezier(0.16, 1, 0.3, 1)';
const CARD_SHADOW = '0 2px 16px rgba(13, 115, 119, 0.08)';

// ── Styling maps ──────────────────────────────────────────────────────────────

const VERDICT_CONFIG: Record<
  VerdictSummary,
  { borderColor: string; bg: string; labelColor: string; headingColor: string; displayText: string }
> = {
  likely_to_advance: {
    borderColor: '#059669',
    bg: '#f0fdf4',
    labelColor: '#059669',
    headingColor: '#064e3b',
    displayText: 'Likely to Advance',
  },
  mixed: {
    borderColor: '#d97706',
    bg: '#fffbeb',
    labelColor: '#d97706',
    headingColor: '#78350f',
    displayText: 'Mixed Fit',
  },
  likely_screened_out: {
    borderColor: '#dc2626',
    bg: '#fef2f2',
    labelColor: '#dc2626',
    headingColor: '#7f1d1d',
    displayText: 'Likely Screened Out',
  },
};

const DEFENSIBILITY_CONFIG: Record<DefensibilityFlag, { bg: string; color: string; label: string }> = {
  likely_defensible: {
    bg: '#d1fae5',
    color: '#065f46',
    label: 'Likely Defensible',
  },
  be_ready_to_elaborate: {
    bg: '#fef3c7',
    color: '#92400e',
    label: 'Be Ready to Elaborate',
  },
};

const MIN_LENGTH = 100;

// ── Shared layout wrappers ────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '48px 24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: CARD_SHADOW }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SiteHeader({ onReset }: { onReset?: () => void }) {
  return (
    <header
      style={{
        background: 'linear-gradient(135deg, rgba(232,247,246,0.85) 0%, rgba(245,255,254,0.85) 60%, rgba(255,255,255,0.85) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #d0ecea',
      }}
    >
      <div
        className="rf-header-inner"
        style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '28px 32px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 className="rf-wordmark" style={{ fontWeight: 700, fontSize: '2.25rem', margin: 0, lineHeight: 1.15 }}>
            <span style={{ color: '#0d7377' }}>Resume</span>
            <span style={{ color: '#1a2e2e' }}>Fit</span>
          </h1>
          <p
            className="rf-subtitle"
            style={{
              fontSize: '1.05rem',
              color: '#4a6b6b',
              margin: '6px auto 0',
              lineHeight: 1.5,
              maxWidth: '600px',
            }}
          >
            Tailor your resume to any job using only your real experience — plus expert insights on how well you can defend every claim in an interview.
          </p>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="rf-link rf-start-over"
            style={{
              position: 'absolute',
              right: '32px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.875rem',
              color: '#4a6b6b',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 0',
              fontFamily: 'inherit',
              transition: `color 280ms ${SILK}`,
              whiteSpace: 'nowrap',
            }}
          >
            ← Start over
          </button>
        )}
      </div>
    </header>
  );
}

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
      <div style={{ backgroundColor: '#f0faf8', minHeight: '100vh' }}>
        <SiteHeader />
        <PageShell>
        <main className="rf-page-content" style={{ padding: '48px 32px' }}>

          {/* Verdict banner */}
          <div
            className="rf-verdict-banner animate-slide-up"
            style={{
              borderLeft: `4px solid ${verdict.borderColor}`,
              backgroundColor: verdict.bg,
              borderRadius: '12px',
              padding: '24px 28px',
              marginBottom: '36px',
              animationDelay: '0ms',
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: verdict.labelColor,
                marginBottom: '8px',
              }}
            >
              Recruiter Verdict
            </span>
            <h2
              className="rf-verdict-title"
              style={{
                fontWeight: 700,
                fontSize: '1.6rem',
                color: verdict.headingColor,
                margin: '0 0 10px 0',
                lineHeight: 1.3,
              }}
            >
              {verdict.displayText}
            </h2>
            <p className="rf-verdict-reasoning" style={{ fontSize: '0.95rem', color: '#4a6b6b', lineHeight: 1.7, margin: 0 }}>
              {result.overallVerdict.reasoning}
            </p>
          </div>

          {/* Tailored resume */}
          <section>
            <h3
              className="animate-slide-up"
              style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#1a2e2e',
                margin: '0 0 16px 0',
                animationDelay: '80ms',
              }}
            >
              Tailored Resume
            </h3>

            {bullets.length === 0 ? (
              <div
                className="animate-slide-up"
                style={{
                  border: '1px solid #d0ecea',
                  borderRadius: '12px',
                  padding: '28px 32px',
                  boxShadow: CARD_SHADOW,
                  animationDelay: '160ms',
                }}
              >
                <p style={{ fontSize: '0.9rem', color: '#4a6b6b', lineHeight: 1.7, margin: 0 }}>
                  No tailored bullets could be generated — the resume did not contain verifiable
                  evidence for any of the job requirements. Consider adding relevant experience to
                  your resume before re-running.
                </p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bullets.map((bullet, index) => {
                  const def = DEFENSIBILITY_CONFIG[bullet.defensibility.flag];
                  const isExpanded = expandedBullets.has(bullet.id);

                  return (
                    <li
                      key={bullet.id}
                      className="rf-bullet-card animate-slide-up"
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        boxShadow: CARD_SHADOW,
                        borderLeft: '3px solid #32c8cc',
                        padding: '28px 32px',
                        animationDelay: `${(index + 2) * 80}ms`,
                      }}
                    >
                      {/* Rewritten text */}
                      <p
                        className="rf-bullet-text"
                        style={{
                          fontSize: '1rem',
                          fontWeight: 500,
                          color: '#1a2e2e',
                          lineHeight: 1.6,
                          margin: '0 0 16px 0',
                        }}
                      >
                        {bullet.rewrittenText}
                      </p>

                      {/* Source span toggle */}
                      {bullet.sourceSpans.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          <button
                            onClick={() => toggleBullet(bullet.id)}
                            aria-expanded={isExpanded}
                            className="rf-toggle"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              color: '#0d7377',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              fontFamily: 'inherit',
                              transition: `color 280ms ${SILK}`,
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '0.65rem',
                                transition: `transform 280ms ${SILK}`,
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              }}
                            >
                              ▼
                            </span>
                            {isExpanded ? 'Hide source' : 'View source from your resume'}
                          </button>

                          {isExpanded && (
                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {bullet.sourceSpans.map((span, i) => (
                                <p
                                  key={i}
                                  style={{
                                    fontSize: '0.9rem',
                                    fontStyle: 'italic',
                                    color: '#4a6b6b',
                                    lineHeight: 1.6,
                                    margin: 0,
                                    borderLeft: '3px solid #d0ecea',
                                    backgroundColor: '#f0faf8',
                                    padding: '8px 12px',
                                    borderRadius: '0 6px 6px 0',
                                  }}
                                >
                                  &ldquo;{span}&rdquo;
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Defensibility badge + follow-up */}
                      <div>
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: def.bg,
                            color: def.color,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            marginBottom: '6px',
                          }}
                        >
                          {def.label}
                        </span>
                        <p style={{ fontSize: '0.85rem', color: '#4a6b6b', lineHeight: 1.6, margin: 0 }}>
                          <span style={{ fontWeight: 500, color: '#1a2e2e' }}>Likely follow-up: </span>
                          <span style={{ fontStyle: 'italic' }}>
                            {bullet.defensibility.likelyFollowUpQuestion}
                          </span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Start over */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', marginBottom: '48px' }}>
            <button onClick={handleReset} className="rf-start-over-btn">
              ← Start over
            </button>
          </div>
        </main>
        </PageShell>
      </div>
    );
  }

  // ── Input form ──────────────────────────────────────────────────────────────

  const textareaStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    border: '1.5px solid #d0ecea',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '0.925rem',
    color: '#1a2e2e',
    backgroundColor: '#ffffff',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: 1.6,
    height: '300px',
    transition: `border-color 280ms ${SILK}, box-shadow 280ms ${SILK}`,
  };

  const stepLabelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#0d7377',
    margin: 0,
  };

  const stepCircle: React.CSSProperties = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0d7377',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const inputCard: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1.5px solid #d0ecea',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: CARD_SHADOW,
  };

  return (
    <div style={{ backgroundColor: '#f0faf8', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />

      <main className="rf-page-content" style={{ flex: 1, padding: '48px 24px' }}>

        {/* Two-column input cards */}
        <div
          className="rf-input-grid"
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
          }}
        >
          {/* Card 1 — Resume */}
          <div style={inputCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={stepCircle}>1</div>
              <label htmlFor="resume" style={stepLabelStyle}>
                Step 1: Your Resume
              </label>
            </div>
            <textarea
              id="resume"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume here as plain text…"
              disabled={isLoading}
              className="rf-input rf-textarea"
              style={textareaStyle}
            />
            <p style={{ fontSize: '0.75rem', color: '#4a6b6b', marginTop: '5px', marginBottom: 0 }}>
              {resumeText.trim().length} / 6,000 characters
            </p>
          </div>

          {/* Card 2 — Job posting */}
          <div style={inputCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={stepCircle}>2</div>
              <label htmlFor="posting" style={stepLabelStyle}>
                Step 2: Your Target Job Posting
              </label>
            </div>
            <textarea
              id="posting"
              value={jobPostingText}
              onChange={(e) => setJobPostingText(e.target.value)}
              placeholder="Paste the full job posting here as plain text…"
              disabled={isLoading}
              className="rf-input rf-textarea"
              style={textareaStyle}
            />
            <p style={{ fontSize: '0.75rem', color: '#4a6b6b', marginTop: '5px', marginBottom: 0 }}>
              {jobPostingText.trim().length} / 6,000 characters
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              maxWidth: '900px',
              margin: '16px auto 0',
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '0.875rem',
              color: '#dc2626',
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {/* Submit */}
        <div style={{ maxWidth: '900px', margin: '28px auto 0' }}>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="rf-btn-primary"
            style={{
              width: '100%',
              backgroundColor: '#0d7377',
              color: '#ffffff',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: '0.9rem',
              padding: '14px 32px',
              borderRadius: '8px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: `background-color 280ms ${SILK}, transform 280ms ${SILK}`,
              opacity: isLoading ? 0.65 : 1,
              letterSpacing: '0.01em',
            }}
          >
            {isLoading ? 'Tailoring your resume…' : 'Tailor My Resume'}
          </button>
          {isLoading && (
            <p style={{ fontSize: '0.8rem', color: '#4a6b6b', textAlign: 'center', marginTop: '12px', marginBottom: 0 }}>
              Running the AI pipeline — this typically takes 10–15 seconds.
            </p>
          )}
        </div>

        {/* Why ResumeFit Matters */}
        <div style={{ maxWidth: '900px', margin: '56px auto 0' }}>
          <h2
            style={{
              fontWeight: 700,
              fontSize: '1.5rem',
              color: '#1a2e2e',
              textAlign: 'center',
              margin: '0 0 24px 0',
            }}
          >
            Why ResumeFit Matters
          </h2>
          <div
            className="rf-why-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}
          >
            {(
              [
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d7377" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ),
                  title: 'Authentic Match',
                  description:
                    'Only rewrites bullets backed by real evidence from your resume — nothing fabricated.',
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d7377" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  ),
                  title: 'Interview Ready',
                  description:
                    'Flags which rewritten claims you may struggle to defend, with likely recruiter follow-up questions.',
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d7377" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  ),
                  title: 'Your Words First',
                  description:
                    "Your experience stays yours. We translate it into the target field's language — we never invent it.",
                },
              ] as { icon: React.ReactNode; title: string; description: string }[]
            ).map(({ icon, title, description }) => (
              <div key={title} style={inputCard}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#e8f7f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {icon}
                </div>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1a2e2e', margin: '12px 0 0 0' }}>
                  {title}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#4a6b6b', lineHeight: 1.6, margin: '6px 0 0 0' }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="rf-footer"
        style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid #d0ecea',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '48px',
        }}
      >
        <span style={{ fontSize: '0.85rem', color: '#4a6b6b' }}>© 2026 ResumeFit</span>
        <span style={{ fontSize: '0.85rem', color: '#4a6b6b' }}>Tailor your resume with confidence.</span>
      </footer>
    </div>
  );
}
