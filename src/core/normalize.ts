/**
 * Normalize text for consistent matching
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Extract words from text for skill matching
 */
export function extractWords(text: string): Set<string> {
  const normalized = normalizeText(text);
  return new Set(normalized.split(/\s+/).filter((w) => w.length > 2));
}

/**
 * Check if text contains a skill (exact or partial match)
 */
export function containsSkill(text: string, skill: string): boolean {
  const normalized = normalizeText(text);
  const skillNormalized = normalizeText(skill);
  return normalized.includes(skillNormalized);
}
