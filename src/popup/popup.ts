/**
 * Popup UI logic
 */

import { normalizeText } from '../core/normalize';
import { scoreJob, meetsPromptThreshold } from '../core/scoreJob';
import { generatePrompt } from '../core/generatePrompt';
import { loadSkills } from '../core/skills';

interface SavedJob {
  id: string;
  title: string;
  url: string;
  hostname: string;
  rawText: string;
  score?: number;
  savedAt: number;
}

/**
 * Show status message
 */
function showStatus(message: string, type: 'success' | 'error' | 'info') {
  const statusEl = document.getElementById('status') as HTMLDivElement;
  statusEl.textContent = message;
  statusEl.className = `status show ${type}`;
  setTimeout(() => statusEl.classList.remove('show'), 4000);
}

/**
 * Show score result
 */
function showScoreResult(result: any) {
  const resultEl = document.getElementById('scoreResult') as HTMLDivElement;

  let scoreBadgeClass = 'low';
  if (result.score >= 75) scoreBadgeClass = 'high';
  else if (result.score >= 50) scoreBadgeClass = 'medium';

  resultEl.innerHTML = `
    <div class="score-badge ${scoreBadgeClass}">
      Score: ${result.score}% - ${result.summary}
    </div>
    <div class="score-detail">
      <strong>Matched Required:</strong> ${result.matchedRequired.join(', ') || 'None'}
    </div>
    <div class="score-detail">
      <strong>Missing Required:</strong> ${result.missingRequired.join(', ') || 'None'}
    </div>
    ${result.matchedBonus.length > 0 ? `<div class="score-detail"><strong>Bonus Skills:</strong> ${result.matchedBonus.join(', ')}</div>` : ''}
    ${result.redFlags.length > 0 ? `<div class="score-detail" style="color: #dc2626;"><strong>⚠️ Red Flags:</strong> ${result.redFlags.join(', ')}</div>` : ''}
  `;
  resultEl.classList.add('show');
}

/**
 * Save job to local storage
 */
async function saveJob() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) throw new Error('No active tab');

    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractJob' });

    if (!response.success) {
      showStatus('Failed to extract job data', 'error');
      return;
    }

    const job = response.job as SavedJob;
    const result = await chrome.storage.local.get('jobs');
    const jobs: SavedJob[] = (result as any).jobs || [];

    job.id = `${Date.now()}-${Math.random()}`;
    job.savedAt = Date.now();

    jobs.push(job);
    await chrome.storage.local.set({ jobs });

    showStatus(`✓ Job saved: ${job.title}`, 'success');
  } catch (error) {
    showStatus(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );
  }
}

/**
 * Score current job
 */
async function scoreCurrentJob() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) throw new Error('No active tab');

    // Extract job
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractJob' });
    if (!response.success) {
      showStatus('Failed to extract job data', 'error');
      return;
    }

    // Load skills
    const skillsData = await loadSkills();

    // Score
    const result = scoreJob(response.job.rawText, skillsData);
    showScoreResult(result);

    // Save score to storage
    const result2 = await chrome.storage.local.get('jobs');
    const jobs: SavedJob[] = (result2 as any).jobs || [];
    const jobIndex = jobs.findIndex(
      (j: SavedJob) => j.url === response.job.url && j.title === response.job.title
    );
    if (jobIndex >= 0) {
      jobs[jobIndex].score = result.score;
      await chrome.storage.local.set({ jobs });
    }

    showStatus(`Scored: ${result.score}%`, 'info');
  } catch (error) {
    showStatus(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );
  }
}

/**
 * Generate ATS prompt
 */
async function generateAtsPrompt() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) throw new Error('No active tab');

    // Extract job
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractJob' });
    if (!response.success) {
      showStatus('Failed to extract job data', 'error');
      return;
    }

    // Load skills
    const skillsData = await loadSkills();

    // Score
    const scoreResult = scoreJob(response.job.rawText, skillsData);

    if (!meetsPromptThreshold(scoreResult.score)) {
      showStatus(
        `Score too low (${scoreResult.score}%). Need 50+ for prompt generation.`,
        'error'
      );
      return;
    }

    // Generate prompt
    const prompt = await generatePrompt(
      response.job.title,
      response.job.url,
      scoreResult,
      response.job.rawText
    );

    if (!prompt) {
      showStatus('Could not generate prompt', 'error');
      return;
    }

    // Copy to clipboard
    await navigator.clipboard.writeText(prompt);
    showStatus('✓ Prompt copied to clipboard! Paste in ChatGPT.', 'success');

    // Optional: open ChatGPT
    // chrome.tabs.create({ url: 'https://chatgpt.com' });
  } catch (error) {
    showStatus(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );
  }
}

/**
 * View saved jobs
 */
async function viewSavedJobs() {
  try {
    const result = await chrome.storage.local.get('jobs');
    const jobs: SavedJob[] = (result as any).jobs || [];

    if (jobs.length === 0) {
      showStatus('No saved jobs yet', 'info');
      return;
    }

    // Create a simple HTML view
    const jobsHtml = jobs
      .map(
        (job: SavedJob, idx: number) => `
      <div style="margin: 10px 0; padding: 8px; background: #f9fafb; border-radius: 4px; font-size: 12px;">
        <div style="font-weight: bold;">${idx + 1}. ${job.title}</div>
        <div style="color: #666; font-size: 11px;">${job.hostname}</div>
        ${job.score ? `<div style="color: #667eea;">Score: ${job.score}%</div>` : ''}
        <div style="color: #999; font-size: 10px;">Saved: ${new Date(job.savedAt).toLocaleDateString()}</div>
      </div>
    `
      )
      .join('');

    // For MVP, just show count and advice
    showStatus(`📁 ${jobs.length} jobs saved. Full list viewer coming soon.`, 'info');
  } catch (error) {
    showStatus(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );
  }
}

/**
 * Initialize popup
 */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('saveJobBtn')?.addEventListener('click', saveJob);
  document.getElementById('scoreJobBtn')?.addEventListener('click', scoreCurrentJob);
  document.getElementById('generatePromptBtn')?.addEventListener('click', generateAtsPrompt);
  document.getElementById('viewJobsBtn')?.addEventListener('click', viewSavedJobs);
});
