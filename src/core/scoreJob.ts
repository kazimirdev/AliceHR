/**
 * Job scoring algorithm
 */

import { normalizeText, containsSkill } from './normalize';
import {
  SkillsData,
  SkillRequirement,
  expandSkillsWithSynonyms,
  getSkillSearchTerms,
  isGroupRequirement,
} from './skills';

export interface MatchedRequiredItem {
  name: string;
  matchedVia?: string[];
}

export interface JobScoreResult {
  score: number;
  matchedRequired: string[];
  matchedRequiredDetails: MatchedRequiredItem[];
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

function findMatchedSkillNames(
  normalizedJob: string,
  skillNames: string[],
  synonyms: SkillsData['synonyms']
): string[] {
  return skillNames.filter((skillName) => {
    const searchTerms = getSkillSearchTerms(skillName, synonyms);
    return searchTerms.some((term) => containsSkill(normalizedJob, term));
  });
}

function scoreRequirement(
  normalizedJob: string,
  requirement: SkillRequirement,
  synonyms: SkillsData['synonyms']
): { matched: boolean; matchedVia: string[] } {
  if (isGroupRequirement(requirement)) {
    const matchedVia = findMatchedSkillNames(normalizedJob, requirement.skills, synonyms);

    return {
      matched:
        requirement.match === 'all_of'
          ? matchedVia.length === requirement.skills.length
          : matchedVia.length > 0,
      matchedVia,
    };
  }

  const matchedVia = findMatchedSkillNames(normalizedJob, [requirement.name], synonyms);

  return {
    matched: matchedVia.length > 0,
    matchedVia,
  };
}

export function scoreJob(jobText: string, skillsData: SkillsData): JobScoreResult {
  const normalizedJob = normalizeText(jobText);
  const bonusSkills = expandSkillsWithSynonyms(skillsData.bonus, skillsData.synonyms);

  const matchedRequired: string[] = [];
  const matchedRequiredDetails: MatchedRequiredItem[] = [];
  const matchedBonus: string[] = [];
  const missingRequired: string[] = [];
  const redFlags: string[] = [];

  let totalWeight = 0;
  let matchedWeight = 0;

  for (const requirement of skillsData.required) {
    totalWeight += requirement.weight;

    const result = scoreRequirement(normalizedJob, requirement, skillsData.synonyms);

    if (result.matched) {
      matchedRequired.push(requirement.name);
      matchedRequiredDetails.push({
        name: requirement.name,
        matchedVia: result.matchedVia.length ? result.matchedVia : undefined,
      });
      matchedWeight += requirement.weight;
    } else {
      missingRequired.push(requirement.name);
    }
  }

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

  for (const flag of RED_FLAG_KEYWORDS) {
    if (normalizedJob.includes(normalizeText(flag))) {
      redFlags.push(flag);
    }
  }

  const score = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

  const summary =
    missingRequired.length === 0
      ? 'Excellent match!'
      : matchedRequired.length > skillsData.required.length / 2
        ? 'Good match'
        : 'Partial match';

  return {
    score,
    matchedRequired,
    matchedRequiredDetails,
    matchedBonus,
    missingRequired,
    redFlags,
    summary,
  };
}

export function meetsPromptThreshold(score: number, threshold: number = 50): boolean {
  return score >= threshold;
}