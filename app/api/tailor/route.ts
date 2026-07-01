import { NextRequest, NextResponse } from 'next/server';
import { runPipeline } from '@/lib/ai/pipeline';

const MIN_LENGTH = 100;
const MAX_LENGTH = 6000;

export async function POST(request: NextRequest) {
  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
  }

  const { resumeText, jobPostingText } = body as Record<string, unknown>;

  // Validate resumeText
  const resumeValidation = validateTextField(resumeText, 'resumeText', 'resume');
  if (resumeValidation) return resumeValidation;

  // Validate jobPostingText
  const postingValidation = validateTextField(jobPostingText, 'jobPostingText', 'job posting');
  if (postingValidation) return postingValidation;

  // Run pipeline
  try {
    const result = await runPipeline({
      resumeText: (resumeText as string).trim(),
      jobPostingText: (jobPostingText as string).trim(),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/tailor] Pipeline error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while tailoring your resume. Please try again.' },
      { status: 500 },
    );
  }
}

function validateTextField(
  value: unknown,
  fieldName: string,
  label: string,
): NextResponse | null {
  if (typeof value !== 'string' || !value.trim()) {
    return NextResponse.json({ error: `${fieldName} is required.` }, { status: 400 });
  }

  const trimmed = value.trim();

  if (trimmed.length < MIN_LENGTH) {
    return NextResponse.json(
      {
        error: `Your ${label} is too short. Please paste the full text (at least ${MIN_LENGTH} characters).`,
      },
      { status: 400 },
    );
  }

  if (value.length > MAX_LENGTH) {
    return NextResponse.json(
      {
        error: `Your ${label} exceeds the ${MAX_LENGTH.toLocaleString()}-character limit. Please trim it before submitting.`,
      },
      { status: 400 },
    );
  }

  return null;
}
