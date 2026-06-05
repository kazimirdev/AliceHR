/**
 * Job scoring algorithm
 */

import { normalizeText, containsSkill } from './normalize';
import { Skill, SkillsData, expandSkillsWithSynonyms } from './skills';

export interface JobScoreResult {
  score: number;
  matchedRequired: string[];
  matchedBonus: string[];
  missingRequired: string[];
  redFlags: string[];
  summary: string;
}

// Red flag keywords that might indicate problematic jobs
const RED_FLAG_KEYWORDS = [
  'no experience necessary',
  'guaranteed employment',
  'work from home guaranteed',
  'make money fast',
  'rich quick',
  'unlimited income',
  'no interviews',
  'no background check',
];

/**
 * Score a job posting against skills dictionary
 */
export function scoreJob(jobText: string, skillsData: SkillsData): JobScoreResult {
  const normalizedJob = normalizeText(jobText);

  // Expand skills with synonyms
  const requiredSkills = expandSkillsWithSynonyms(skillsData.required, skillsData.synonyms);
  const bonusSkills = expandSkillsWithSynonyms(skillsData.bonus, skillsData.synonyms);

  const matchedRequired: string[] = [];
  const matchedBonus: string[] = [];
  const missingRequired: string[] = [];
  const redFlags: string[] = [];

  let totalWeight = 0;
  let matchedWeight = 0;

  // Check required skills
  for (const skill of skillsData.required) {
    totalWeight += skill.weight;
    const skillSynonyms = [
      skill.name,
      ...(skillsData.synonyms[skill.name.toLowerCase()] || []),
    ];

    const matched = skillSynonyms.some((syn) => containsSkill(normalizedJob, syn));

    if (matched) {
      matchedRequired.push(skill.name);
      matchedWeight += skill.weight;
    } else {
      missingRequired.push(skill.name);
    }
  }

  // Check bonus skills
  for (const skill of bonusSkills) {
    if (!matchedRequired.includes(skill.name) && !matchedBonus.includes(skill.name)) {
      const skillSynonyms = [
        skill.name,
        ...(skillsData.synonyms[skill.name.toLowerCase()] || []),
      ];

      const matched = skillSynonyms.some((syn) => containsSkill(normalizedJob, syn));

      if (matched) {
        matchedBonus.push(skill.name);
      }
    }
  }

  // Check for red flags
  for (const flag of RED_FLAG_KEYWORDS) {
    if (normalizedJob.includes(normalizeText(flag))) {
      redFlags.push(flag);
    }
  }

  // Calculate score: 0-100
  const score = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

  const summary =
    matchedRequired.length === skillsData.required.length
      ? 'Excellent match!'
      : matchedRequired.length > skillsData.required.length / 2
        ? 'Good match'
        : 'Partial match';

  return {
    score,
    matchedRequired,
    matchedBonus,
    missingRequired,
    redFlags,
    summary,
  };
}

/**
 * Check if score meets threshold for prompt generation
 */
export function meetsPromptThreshold(score: number, threshold: number = 50): boolean {
  return score >= threshold;
}
