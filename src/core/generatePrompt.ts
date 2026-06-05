/**
 * Generate ChatGPT-compatible Markdown prompt for ATS resume optimization
 */

import { JobScoreResult } from './scoreJob';

export interface GeneratePromptOptions {
  context?: string;
  threshold?: number;
}

/**
 * Generate a markdown prompt for ChatGPT
 */
export async function generatePrompt(
  jobTitle: string,
  jobUrl: string,
  scoreResult: JobScoreResult,
  jobDescription?: string,
  options?: GeneratePromptOptions
): Promise<string | null> {
  // Don't generate if score is too low
  const threshold = options?.threshold || 50;
  if (scoreResult.score < threshold) {
    return null;
  }

  const candidateFacts = await loadCandidateFacts();

  const prompt = `# ATS Resume Optimization Prompt

## Job Context
- **Position**: ${jobTitle}
- **URL**: ${jobUrl}
- **Match Score**: ${scoreResult.score}%
- **Summary**: ${scoreResult.summary}

## Job Requirements Analysis

### Matched Skills (✓)
${scoreResult.matchedRequired.map((s) => `- ${s}`).join('\n')}

### Missing Required Skills (✗)
${scoreResult.missingRequired.length > 0 ? scoreResult.missingRequired.map((s) => `- ${s}`).join('\n') : '- None identified'}

### Bonus/Preferred Skills Added (⭐)
${scoreResult.matchedBonus.length > 0 ? scoreResult.matchedBonus.map((s) => `- ${s}`).join('\n') : '- None identified'}

## ⚠️ Red Flags Detected
${scoreResult.redFlags.length > 0 ? scoreResult.redFlags.map((f) => `- ${f}`).join('\n') : '- None'}

## Candidate Background
${candidateFacts.relevantFacts.map((f) => `- ${f}`).join('\n')}

## Task: Rewrite Resume for ATS

Please help me optimize my resume for this specific position. Following these rules:

1. **Be Honest**: Only include skills and experiences I actually have
2. **Use Keywords**: Incorporate the matched skills naturally throughout
3. **Address Gaps**: Suggest how existing experience maps to missing skills
4. **ATS Optimization**: Use clear formatting, standard fonts, avoid images/tables
5. **Forbidden Claims**: Do NOT add any of these:
   - ${candidateFacts.forbiddenClaims.map((c) => `\`${c}\``).join('\n   - ')}
6. **Action-Oriented**: Start bullet points with strong verbs (managed, led, implemented, etc.)

## Output Format
Please provide:
1. An optimized professional summary (3-4 sentences)
2. Top 5 bullet points for relevant experience section
3. Skills section with matched + transferable skills
4. Any advice for addressing skill gaps

---

**Note**: This is for personal resume optimization only. Never misrepresent your qualifications.`;

  return prompt;
}

export interface CandidateFacts {
  relevantFacts: string[];
  forbiddenClaims: string[];
}

export async function loadCandidateFacts(): Promise<CandidateFacts> {
  try {
    const response = await fetch(chrome.runtime.getURL('data/candidateFacts.json'));
    return await response.json();
  } catch (error) {
    console.error('Failed to load candidate facts:', error);
    return {
      relevantFacts: [
        'Software development experience',
        'Team collaboration skills',
        'Problem-solving abilities',
      ],
      forbiddenClaims: [
        'Overstate years of experience',
        'Add certifications not earned',
        'Claim tech skills not actually used',
        'Fabricate job titles',
      ],
    };
  }
}
