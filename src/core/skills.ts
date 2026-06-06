/**
 * Skills dictionary structure and utilities
 */

export interface KnownSkillsData {
  skills: Record<string, string[]>;
}

export interface MySkillsData {
  skills: string[];
  equivalents?: Record<string, string[]>;
}

export interface SkillsData {
  knownSkills: KnownSkillsData;
  mySkills: MySkillsData;
}

export interface ExtractedRequirement {
  name: string;
  matchedTerms: string[];
}

/**
 * Load known job skills and candidate skills.
 *
 * knownSkills.json = things AliceHR can recognize in job descriptions.
 * mySkills.json = things the candidate can honestly claim.
 */
export async function loadSkills(): Promise<SkillsData> {
  try {
    const [knownSkillsResponse, mySkillsResponse] = await Promise.all([
      fetch(chrome.runtime.getURL('data/knownSkills.json')),
      fetch(chrome.runtime.getURL('data/mySkills.json')),
    ]);

    if (!knownSkillsResponse.ok) {
      throw new Error(`Could not load knownSkills.json: ${knownSkillsResponse.status}`);
    }

    if (!mySkillsResponse.ok) {
      throw new Error(`Could not load mySkills.json: ${mySkillsResponse.status}`);
    }

    return {
      knownSkills: await knownSkillsResponse.json(),
      mySkills: await mySkillsResponse.json(),
    };
  } catch (error) {
    console.error('Failed to load skills data:', error);
    throw new Error('Could not load skills data');
  }
}

export function normalizeSkillName(skillName: string): string {
  return skillName.toLowerCase().trim();
}

export function getSkillAliases(skillName: string, knownSkills: KnownSkillsData): string[] {
  return [skillName, ...(knownSkills.skills[skillName] || [])];
}
