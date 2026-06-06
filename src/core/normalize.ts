/**
 * Normalize text for consistent matching
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ') // Replace special characters with spaces
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Extract words from text for skill matching
 */
export function extractWords(text: string): Set<string> {
  const normalized = normalizeText(text);
  return new Set(normalized.split(/\s+/).filter((w) => w.length > 0));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if text contains a skill.
 *
 * Rules:
 * - Short aliases such as ts, js, sh, s3 must match only as standalone tokens.
 * - Longer single-word skills also match as standalone tokens to avoid matching inside words.
 * - Multi-word skills must match as normalized phrases.
 */
export function containsSkill(text: string, skill: string): boolean {
  const normalized = normalizeText(text);
  const skillNormalized = normalizeText(skill);

  if (!skillNormalized) {
    return false;
  }

  const pattern = new RegExp(`(^|\\s)${escapeRegExp(skillNormalized)}(\\s|$)`);
  return pattern.test(normalized);
}
