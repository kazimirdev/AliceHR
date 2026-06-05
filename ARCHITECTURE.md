# AliceHR - Architecture & Design

## System Overview

AliceHR is a Chrome extension MVP that screens job vacancies and generates ATS-optimized resume prompts. It operates entirely locally with no backend or API calls.

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension (MV3)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Popup UI   │  │   Content    │  │ Background   │      │
│  │              │  │   Script     │  │   Service    │      │
│  │ (popup.html) │  │ (extractJob) │  │   Worker     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│        ▲                   ▲                                  │
│        │                   │ Message API                      │
│        └───────────────────┘                                 │
│                   ▼                                           │
│        ┌─────────────────────┐                              │
│        │   Core Modules      │                              │
│        ├─────────────────────┤                              │
│        │ • normalize.ts      │                              │
│        │ • skills.ts         │                              │
│        │ • scoreJob.ts       │                              │
│        │ • generatePrompt.ts │                              │
│        └────────┬────────────┘                              │
│                 ▼                                            │
│        ┌─────────────────────┐                              │
│        │   Local Data        │                              │
│        ├─────────────────────┤                              │
│        │ • skills.json       │                              │
│        │ • candidateFacts    │                              │
│        └─────────────────────┘                              │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │         chrome.storage.local (Persistent)              │ │
│  │         ┌─────────────────────────────────┐           │ │
│  │         │      { jobs: SavedJob[] }      │           │ │
│  │         └─────────────────────────────────┘           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. User Interface Layer

#### pop up/popup.html
- Clean, minimal UI with 4 main buttons
- Status messages for user feedback
- Score visualization with color coding
- Responsive design (500x300px)

#### popup/popup.ts
- Event listeners for button clicks
- Communication with content script via Chrome messaging API
- Storage management with chrome.storage.local
- UI state management
- Error handling and user feedback

### 2. Content Script Layer

#### content/extractJob.ts
- Runs on every webpage automatically
- Cleans DOM:
  - Removes `<script>`, `<style>`
  - Removes nav, footer, cookies, modals, sidebars
- Extracts readable text from `document.body.innerText`
- Responds to popup messages
- No data leaves the browser

### 3. Core Processing Layer

#### core/normalize.ts
- Text normalization (lowercase, trim, remove special chars)
- Word extraction with minimum length filter
- Text matching utilities
- Prevents false matches from punctuation variations

#### core/skills.ts
- Loads skills.json from local data
- Manages skill synonyms (e.g., "JS" → "JavaScript")
- Expands skills with synonyms for matching
- Returns typed SkillsData objects

#### core/scoreJob.ts
**The heart of the algorithm:**

```
Input: jobText (string), skillsData (SkillsData)
├─ Normalize job text
├─ For each required skill:
│  ├─ Check job text for skill + synonyms
│  ├─ If found: add to matchedRequired, accumulate weight
│  ├─ If not found: add to missingRequired
├─ Calculate score = (matchedWeight / totalWeight) × 100
├─ Check for red flags (scam keywords)
├─ Match bonus skills
└─ Return JobScoreResult
```

**Scoring Formula:**
```
Score = (Σ matched_skill_weights / Σ all_required_skill_weights) × 100
```

**Red Flags Detected:**
- "no experience necessary"
- "guaranteed employment"
- "work from home guaranteed"
- "make money fast"
- etc.

#### core/generatePrompt.ts
- Creates ChatGPT-compatible Markdown
- Requires score ≥ 50%
- Includes:
  - Job context (title, URL, score)
  - Matched skills analysis
  - Missing skills analysis
  - Candidate background facts
  - Forbidden claims guidance
  - ATS optimization instructions
- Emphasizes honesty

### 4. Data Layer

#### data/skills.json
```json
{
  "required": [{ "name": string, "weight": number }],
  "bonus": [{ "name": string, "weight": number }],
  "synonyms": { "skill": ["synonym1", "synonym2"] }
}
```

Default includes: JavaScript, TypeScript, React, Node.js, REST API, HTML, CSS, Git, SQL, Database, Python, AWS, Docker, GraphQL, etc.

#### data/candidateFacts.json
```json
{
  "relevantFacts": ["string"],
  "forbiddenClaims": ["string"]
}
```

Used to personalize prompts and ensure ethical resume content.

### 5. Background Service Worker

#### background.ts
- Currently minimal (onInstalled listener)
- Can be extended for:
  - Timed job notifications
  - Analytics
  - Advanced scheduling

## Data Flow

### Job Scoring Flow

```
User clicks "Score Job"
    ▼
popup.ts: scoreCurrentJob()
    ▼
chrome.tabs.sendMessage() to content script
    ▼
extractJob.ts: extractJobContent()
    ▼
Returns ExtractedJob { title, url, hostname, rawText }
    ▼
popup.ts: loads skillsData
    ▼
scoreJob.ts: scoreJob(rawText, skillsData)
    ▼
Matching algorithm:
  - Normalize text
  - Search for skills + synonyms
  - Calculate weighted score
  - Identify red flags
    ▼
Returns JobScoreResult
    ▼
popup.ts: showScoreResult()
    ▼
User sees score + analysis
```

### Prompt Generation Flow

```
User clicks "Generate Prompt"
    ▼
Chrome.tabs.sendMessage() to content script
    ▼
extractJob.ts: extractJobContent()
    ▼
popup.ts: scoreJob() [same as above]
    ▼
Check: score >= 50%?
    ├─ Yes: Continue
    └─ No: Show error, exit
    ▼
generatePrompt.ts: generatePrompt()
    ├─ Load candidateFacts.json
    ├─ Build Markdown structure
    ├─ Include job context + score
    ├─ List matched/missing skills
    ├─ Include candidate facts
    ├─ Include forbidden claims warning
    └─ Return Markdown string
    ▼
navigator.clipboard.writeText(prompt)
    ▼
Show success message
    ▼
User pastes into ChatGPT
```

### Job Saving Flow

```
User clicks "Save Job"
    ▼
chrome.tabs.sendMessage() to content script
    ▼
extractJob.ts: extractJobContent()
    ▼
popup.ts: chrome.storage.local.get('jobs')
    ▼
Append new job with:
  - id (timestamp + random)
  - savedAt (Date.now())
  - All extracted fields
    ▼
chrome.storage.local.set({ jobs: [...] })
    ▼
Show success message
```

## Type Safety

### Key Interfaces

```typescript
// Job data
interface ExtractedJob {
  title: string;
  url: string;
  hostname: string;
  rawText: string;
  extractedAt: number;
}

interface SavedJob extends ExtractedJob {
  id: string;
  score?: number;
  savedAt: number;
}

// Scoring
interface JobScoreResult {
  score: number;
  matchedRequired: string[];
  matchedBonus: string[];
  missingRequired: string[];
  redFlags: string[];
  summary: string;
}

// Skills
interface Skill {
  name: string;
  weight: number;
}

interface SkillsData {
  required: Skill[];
  bonus: Skill[];
  synonyms: { [key: string]: string[] };
}

// Candidate
interface CandidateFacts {
  relevantFacts: string[];
  forbiddenClaims: string[];
}
```

## Storage Model

### chrome.storage.local

```javascript
{
  jobs: [
    {
      id: "1712345678-0.123",
      title: "Senior React Developer",
      url: "https://example.com/job/123",
      hostname: "example.com",
      rawText: "...",
      score: 78,
      extractedAt: 1712345678,
      savedAt: 1712345680
    },
    // ... more jobs
  ]
}
```

**Persistence:**
- Persists across browser sessions
- User can clear in Chrome settings
- Isolated per user profile
- Isolated per extension

## Algorithm Details

### Text Normalization

```typescript
normalizeText(text) {
  return text
    .toLowerCase()           // "JAVASCRIPT" → "javascript"
    .trim()                  // "  js  " → "js"
    .replace(/[^\w\s]/g, '') // "C++" → "C"
    .replace(/\s+/g, ' ');   // Multiple spaces → single space
}
```

### Skill Matching

```
For each required skill:
  1. Get skill name + all synonyms
  2. For each variant:
     - Normalize variant
     - Check if normalized job text contains normalized variant
     - If yes: count as matched, add weight
  3. Calculate score
```

**Example:**
- Job text: "We need a React.js developer..."
- Skill: "React" with synonyms ["reactjs", "react.js"]
- Expanded: ["React", "reactjs", "react.js"]
- Normalized job: "we need a reactjs developer"
- Match found: "reactjs" in job text ✓

### Red Flag Detection

```
For each red flag keyword:
  - Normalize keyword
  - Normalize job text
  - Check if job text contains keyword
  - If yes: add to redFlags array
```

### Score Calculation

**With example weights:**
- JavaScript: 10
- React: 9
- Node.js: 8
- Total required: 27

**If job matches JavaScript + React:**
- Matched weight: 10 + 9 = 19
- Score: (19 / 27) × 100 = 70%

## Extension Permissions

### Required Permissions (manifest.json)

```json
{
  "permissions": ["storage", "tabs", "scripting"],
  "host_permissions": ["<all_urls>"]
}
```

- **storage**: Access chrome.storage.local
- **tabs**: Access tab info and messaging
- **scripting**: Inject and run content script
- **<all_urls>**: Works on any website

## Performance Considerations

- **Content script size**: ~3KB (minimal)
- **Score calculation**: <50ms (on 10KB+ job text)
- **Prompt generation**: <10ms (string building)
- **Storage operations**: <20ms (JSON serialization)

All operations are synchronous and local, no waiting for network.

## Error Handling

### User-Facing Errors
- "Failed to extract job data" → Content script didn't respond
- "Could not load skills dictionary" → skills.json missing
- "Score too low (X%). Need 50+ for prompt generation." → Below threshold

### Types of Failures
1. **Extraction failure**: `sendMessage` timeout or error
2. **Storage failure**: `chrome.storage` permission denied
3. **Data loading**: Missing JSON files in dist/
4. **Parse failure**: Malformed JSON files

## Testing Strategy

### Manual Testing Checklist

- [ ] Extract job from various websites
- [ ] Score returns 0-100 range
- [ ] Matched skills are actually in text
- [ ] Missing skills are logical for that job
- [ ] Red flags trigger on scam keywords
- [ ] Prompt generates at 50%+ score
- [ ] Prompt copies to clipboard
- [ ] Jobs persist in storage
- [ ] Multiple jobs can be saved
- [ ] Extension works after browser restart

### Test Cases by Feature

**Extraction:**
- Plain HTML (no cleanup needed)
- Complex layouts with nav/footer
- JavaScript-rendered content
- Cookie banners
- Modal dialogs

**Scoring:**
- 0/10 skills matched
- All skills matched
- Partial matches
- Synonym detection
- Case sensitivity
- Red flag keywords

**Prompts:**
- High score jobs (80%+)
- Medium score jobs (50-70%)
- Low score jobs (<50%, should fail)
- Different job titles
- Different industries

## Future Enhancements

1. **Job Listings UI**: Dedicated popup for browsing saved jobs
2. **Advanced Filtering**: Filter by score, industry, date saved
3. **Statistics**: Track scoring trends, monthly summary
4. **Multiple Profiles**: Different skills sets for different roles
5. **PDF Export**: Export job + prompt + resume analysis
6. **Job Board Connectors**: Auto-detect popular job sites
7. **Resume Upload**: Analyze existing resume against jobs
8. **Dark Mode**: Visual theme option
9. **Sync**: Cloud backup of jobs (user-initiated, not automatic)
10. **Bulk Operations**: Score multiple jobs at once

## Security & Privacy

- **No external APIs**: All processing is local
- **No data transmission**: Never leaves browser
- **No tracking**: No analytics or telemetry
- **Encrypted storage**: Chrome handles encryption
- **User control**: Clear extension data anytime
- **Open source**: Code is completely transparent

## Maintenance Notes

- **Dependency Updates**: typescript updates annually
- **Chrome API Changes**: Monitor for MV3 deprecations
- **Skills Dictionary**: Update 2-3x per year as tech evolves
- **Red Flags**: Monitor for new job scam trends

---

**Last Updated:** June 2026
**Version:** 0.1.0 (MVP)
