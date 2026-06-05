/**
 * Skills dictionary structure and utilities
 */

export interface SkillsData {
  required: Skill[];
  bonus: Skill[];
  synonyms: { [key: string]: string[] };
}

export interface Skill {
  name: string;
  weight: number;
}

/**
 * Load skills dictionary from JSON
 */
export async function loadSkills(): Promise<SkillsData> {
  try {
    const response = await fetch(chrome.runtime.getURL('data/skills.json'));
    return await response.json();
  } catch (error) {
    console.error('Failed to load skills dictionary:', error);
    throw new Error('Could not load skills dictionary');
  }
}

/**
 * Find synonyms for a skill
 */
export function getSynonyms(skillName: string, synonyms: { [key: string]: string[] }): string[] {
  const normalized = skillName.toLowerCase().trim();
  for (const [key, syns] of Object.entries(synonyms)) {
    if (normalized === key.toLowerCase() || syns.some((s) => s.toLowerCase() === normalized)) {
      return [key, ...syns];
    }
  }
  return [skillName];
}

/**
 * Expand skill list with all synonyms
 */
export function expandSkillsWithSynonyms(
  skills: Skill[],
  synonyms: { [key: string]: string[] }
): Skill[] {
  const expanded: Skill[] = [];
  for (const skill of skills) {
    expanded.push(skill);
    const syns = getSynonyms(skill.name, synonyms);
    for (const syn of syns) {
      if (syn.toLowerCase() !== skill.name.toLowerCase()) {
        expanded.push({ name: syn, weight: skill.weight });
      }
    }
  }
  return expanded;
}
