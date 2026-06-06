/**
 * Job scoring algorithm
 */

import { normalizeText, containsSkill } from './normalize';
import { ExtractedRequirement, SkillsData, getSkillAliases, normalizeSkillName } from './skills';

export interface JobScoreResult {
  score: number;
  extractedRequirements: string[];
  matchedRequired: string[];
  matchedBonus: string[];
  missingRequired: string[];
  redFlags: string[];
  summary: string;
}

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

function extractRequirements(jobText: string, skillsData: SkillsData): ExtractedRequirement[] {
  const normalizedJob = normalizeText(jobText);

  return Object.keys(skillsData.knownSkills.skills)
    .map((skillName) => {
      const aliases = getSkillAliases(skillName, skillsData.knownSkills);
      const matchedTerms = aliases.filter((alias) => containsSkill(normalizedJob, alias));

      return {
        name: skillName,
        matchedTerms,
      };
    })
    .filter((requirement) => requirement.matchedTerms.length > 0);
}

function buildCandidateSkillSet(skillsData: SkillsData): Set<string> {
  const candidateSkills = new Set<string>();

  for (const skill of skillsData.mySkills.skills) {
    candidateSkills.add(normalizeSkillName(skill));
  }

  for (const [skill, equivalents] of Object.entries(skillsData.mySkills.equivalents || {})) {
    if (!candidateSkills.has(normalizeSkillName(skill))) {
      continue;
    }

    for (const equivalent of equivalents) {
      candidateSkills.add(normalizeSkillName(equivalent));
    }
  }

  return candidateSkills;
}

/**
 * Score a job posting by extracting requirements from the job text and comparing
 * those requirements with the candidate's actual skill list.
 */
export function scoreJob(jobText: string, skillsData: SkillsData): JobScoreResult {
  const normalizedJob = normalizeText(jobText);
  const requirements = extractRequirements(jobText, skillsData);
  const candidateSkills = buildCandidateSkillSet(skillsData);

  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];
  const redFlags: string[] = [];

  for (const requirement of requirements) {
    if (candidateSkills.has(normalizeSkillName(requirement.name))) {
      matchedRequired.push(requirement.name);
    } else {
      missingRequired.push(requirement.name);
    }
  }

  for (const flag of RED_FLAG_KEYWORDS) {
    if (normalizedJob.includes(normalizeText(flag))) {
      redFlags.push(flag);
    }
  }

  const score =
    requirements.length > 0 ? Math.round((matchedRequired.length / requirements.length) * 100) : 0;

  const summary =
    requirements.length === 0
      ? 'No known requirements found'
      : missingRequired.length === 0
        ? 'Excellent match!'
        : score >= 70
          ? 'Good match'
          : score >= 40
            ? 'Partial match'
            : 'Weak match';

  return {
    score,
    extractedRequirements: requirements.map((requirement) => requirement.name),
    matchedRequired,
    matchedBonus: [],
    missingRequired,
    redFlags,
    summary,
  };
}

export function meetsPromptThreshold(score: number, threshold: number = 50): boolean {
  return score >= threshold;
}
