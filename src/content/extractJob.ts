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

/**
 * Extract readable content from current page
 */
function extractJobContent(): ExtractedJob {
  // Clone the document to avoid modifications
  const tempDoc = document.cloneNode(true) as Document;

  // Remove script tags
  const scripts = tempDoc.querySelectorAll('script, noscript');
  scripts.forEach((el) => el.remove());

  // Remove style tags
  const styles = tempDoc.querySelectorAll('style, link[rel="stylesheet"]');
  styles.forEach((el) => el.remove());

  // Remove common non-content elements
  const junk = tempDoc.querySelectorAll(
    'nav, footer, .cookie-banner, .cookies, [class*="cookie"], [class*="modal"], [class*="popup"], .sidebar, aside'
  );
  junk.forEach((el) => el.remove());

  // Extract text
  const rawText = tempDoc.body.innerText || tempDoc.documentElement.innerText || '';

  // Clean up excessive whitespace
  const cleanText = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

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
