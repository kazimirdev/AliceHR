/**
 * Content script: Extract job posting text from webpage
 */

export interface ExtractedJob {
  title: string;
  url: string;
  hostname: string;
  rawText: string;
  extractedAt: number;
}

interface JobPostingSchema {
  title?: string;
  hiringOrganization?: string | { name?: string };
  employmentType?: string | string[];
  jobLocation?: unknown;
  responsibilities?: string;
  experienceRequirements?: string;
  qualifications?: string;
  skills?: string | string[];
  educationRequirements?: string;
  jobBenefits?: string;
  industry?: string;
  description?: string;
}

const extensionVersion = chrome.runtime.getManifest().version;
console.log(`[AliceHR content] v${extensionVersion}`);

const JUNK_SELECTORS = [
  'script',
  'noscript',
  'style',
  'link[rel="stylesheet"]',
  'nav',
  'footer',
  'aside',
  'header',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="complementary"]',
  '[class*="cookie" i]',
  '[id*="cookie" i]',
  '[class*="modal" i]',
  '[id*="modal" i]',
  '[class*="popup" i]',
  '[id*="popup" i]',
  '[class*="sidebar" i]',
  '[class*="recommend" i]',
  '[id*="recommend" i]',
  '[class*="similar" i]',
  '[id*="similar" i]',
  '[class*="suggest" i]',
  '[id*="suggest" i]',
  '[class*="carousel" i]',
  '[class*="banner" i]',
  '[class*="advert" i]',
  '[class*="ad-" i]',
  '[data-test*="recommend" i]',
  '[data-test*="similar" i]',
  '[data-test*="sidebar" i]',
  '[data-test*="carousel" i]',
];

const JOB_CONTAINER_SELECTORS = [
  'main article',
  'main [role="main"]',
  'main',
  'article',
  '[role="main"]',
  '[data-test*="offer" i]',
  '[data-test*="job" i]',
  '[data-testid*="offer" i]',
  '[data-testid*="job" i]',
  '[class*="offer" i]',
  '[class*="job" i]',
  '[class*="vacancy" i]',
  '[class*="description" i]',
];

function cleanupClone(root: ParentNode): void {
  root.querySelectorAll(JUNK_SELECTORS.join(',')).forEach((el) => el.remove());
}

function normalizeExtractedText(rawText: string): string {
  return rawText
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line, index, lines) => lines.indexOf(line) === index)
    .join('\n');
}

function asText(value: unknown): string {
  if (!value) return '';
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'name' in value) {
    return String((value as { name?: unknown }).name || '');
  }
  return String(value);
}

function getHiringOrganizationName(value: JobPostingSchema['hiringOrganization']): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.name || '';
}

function extractSchemaOrgJobPosting(): string | null {
  const schemaScripts = Array.from(
    document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')
  );

  for (const script of schemaScripts) {
    try {
      if (!script.textContent?.trim()) continue;

      const parsed = JSON.parse(script.textContent) as JobPostingSchema | JobPostingSchema[];
      const schemas = Array.isArray(parsed) ? parsed : [parsed];
      const jobPosting = schemas.find((schema) => {
        const type = (schema as any)['@type'];
        return type === 'JobPosting' || (Array.isArray(type) && type.includes('JobPosting'));
      });

      if (!jobPosting) continue;

      const parts = [
        jobPosting.title ? `Title: ${jobPosting.title}` : '',
        getHiringOrganizationName(jobPosting.hiringOrganization)
          ? `Company: ${getHiringOrganizationName(jobPosting.hiringOrganization)}`
          : '',
        asText(jobPosting.employmentType) ? `Employment type: ${asText(jobPosting.employmentType)}` : '',
        jobPosting.industry ? `Industry: ${jobPosting.industry}` : '',
        jobPosting.responsibilities ? `Responsibilities:\n${jobPosting.responsibilities}` : '',
        jobPosting.experienceRequirements
          ? `Requirements:\n${jobPosting.experienceRequirements}`
          : '',
        jobPosting.qualifications ? `Qualifications:\n${jobPosting.qualifications}` : '',
        asText(jobPosting.skills) ? `Skills:\n${asText(jobPosting.skills)}` : '',
        jobPosting.educationRequirements
          ? `Education:\n${jobPosting.educationRequirements}`
          : '',
      ];

      const text = normalizeExtractedText(parts.filter(Boolean).join('\n\n'));

      if (text.length >= 100) {
        console.log('[AliceHR extractor] schema.org JobPosting');
        console.log(`[AliceHR extracted chars] ${text.length}`);
        return text;
      }
    } catch (error) {
      console.warn('[AliceHR extractor] schema.org parse failed', error);
    }
  }

  return null;
}

function getVisibleTextLength(element: Element): number {
  return ((element as HTMLElement).innerText || element.textContent || '').trim().length;
}

function looksLikeJobPosting(text: string): boolean {
  const normalized = text.toLowerCase();
  const signals = [
    'requirements',
    'responsibilities',
    'your responsibilities',
    'our requirements',
    'optional',
    'what we offer',
    'about the project',
    'wymagania',
    'obowiązki',
    'zakres obowiązków',
    'o projekcie',
    'mile widziane',
    'oferujemy',
  ];

  return signals.filter((signal) => normalized.includes(signal)).length >= 2;
}

function pickBestJobContainer(doc: Document): Element {
  const candidates = JOB_CONTAINER_SELECTORS
    .flatMap((selector) => Array.from(doc.querySelectorAll(selector)))
    .filter((element, index, elements) => elements.indexOf(element) === index)
    .map((element) => ({
      element,
      text: ((element as HTMLElement).innerText || element.textContent || '').trim(),
    }))
    .filter((candidate) => candidate.text.length > 500)
    .sort((a, b) => {
      const aLooksLikeJob = looksLikeJobPosting(a.text) ? 1 : 0;
      const bLooksLikeJob = looksLikeJobPosting(b.text) ? 1 : 0;

      if (aLooksLikeJob !== bLooksLikeJob) {
        return bLooksLikeJob - aLooksLikeJob;
      }

      return getVisibleTextLength(b.element) - getVisibleTextLength(a.element);
    });

  return candidates[0]?.element || doc.body || doc.documentElement;
}

function extractDomFallback(): string {
  const tempDoc = document.cloneNode(true) as Document;
  cleanupClone(tempDoc);

  const container = pickBestJobContainer(tempDoc);
  cleanupClone(container);

  const rawText = (container as HTMLElement).innerText || container.textContent || '';
  const cleanText = normalizeExtractedText(rawText);

  console.log('[AliceHR extractor] dom-fallback');
  console.log(`[AliceHR extracted chars] ${cleanText.length}`);

  return cleanText;
}

/**
 * Extract readable content from current page
 */
function extractJobContent(): ExtractedJob {
  const schemaText = extractSchemaOrgJobPosting();
  const cleanText = schemaText || extractDomFallback();

  return {
    title: document.title,
    url: window.location.href,
    hostname: window.location.hostname,
    rawText: cleanText,
    extractedAt: Date.now(),
  };
}

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener(
  (
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    if (request.action === 'extractJob') {
      try {
        const job = extractJobContent();
        sendResponse({ success: true, job });
      } catch (error) {
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }
);
