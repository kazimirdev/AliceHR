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
  // Generic semantic containers first.
  'main article',
  'main [role="main"]',
  'main',
  'article',
  '[role="main"]',

  // Common job-board / ATS naming patterns.
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
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line, index, lines) => lines.indexOf(line) === index)
    .join('\n');
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

      // Prefer substantial content, but avoid selecting the whole body if a smaller
      // job-specific container exists.
      return getVisibleTextLength(b.element) - getVisibleTextLength(a.element);
    });

  return candidates[0]?.element || doc.body || doc.documentElement;
}

/**
 * Extract readable content from current page
 */
function extractJobContent(): ExtractedJob {
  const tempDoc = document.cloneNode(true) as Document;
  cleanupClone(tempDoc);

  const container = pickBestJobContainer(tempDoc);
  cleanupClone(container);

  const rawText = (container as HTMLElement).innerText || container.textContent || '';
  const cleanText = normalizeExtractedText(rawText);

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
