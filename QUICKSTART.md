# AliceHR - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Build the Extension

```bash
cd /home/user/AliceHR
npm install
npm run build
```

### Step 2: Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Click "Developer mode" toggle (top-right)
3. Click "Load unpacked" button
4. Select the `/home/user/AliceHR/dist/` folder
5. You should see "AliceHR - Job Screening & ATS Prompt Generator" in your extensions list

### Step 3: Test It

1. Go to any job posting website (LinkedIn, Indeed, etc.)
2. Click the AliceHR extension icon in your toolbar
3. Try each button:

#### **Save Job** 💾
- Extracts job title, URL, and readable text
- Saves to Chrome local storage
- Confirm: "✓ Job saved: [Job Title]"

#### **Score Job** ⭐
- Extracts job content
- Matches against built-in skills dictionary
- Shows match percentage (0-100%)
- Lists matched skills, missing skills, and red flags
- Example: "Score: 78% - Excellent match!"

#### **Generate Prompt** 🤖
- Analyzes job posting
- If score ≥ 50%, generates a ChatGPT prompt
- Prompt is automatically copied to your clipboard
- Paste directly into ChatGPT for ATS resume optimization
- Includes honest instructions about not fabricating qualifications

#### **View Saved Jobs** 📁
- Shows count of saved jobs

## 📋 What the Extension Does

### Job Extraction
Cleans up job postings by removing:
- Navigation bars
- Footers
- Scripts and stylesheets
- Cookie banners
- Modals

Then extracts readable text.

### Job Scoring
Uses a built-in skills dictionary to:
1. Normalize job text
2. Match required skills (weighted)
3. Identify bonus skills
4. Detect red flags (common job scam keywords)
5. Calculate score: (matched required skills / total required skills) × 100

### Weighted Scoring
- JavaScript: weight 10 (most important)
- React: weight 9
- Node.js: weight 8
- REST API: weight 7
- (etc.)

Score = (sum of matched skill weights / sum of all required skill weights) × 100

### Prompt Generation
Creates a structured Markdown prompt that includes:
- Job title and URL
- Match score
- Matched required skills
- Missing required skills
- Bonus skills found
- Red flags detected
- Candidate background facts
- Instructions for honest resume optimization
- Forbidden claims to never make

## 🛠️ Customization

### Edit Skills Dictionary

File: `/home/user/AliceHR/src/data/skills.json`

```json
{
  "required": [
    { "name": "JavaScript", "weight": 10 },
    { "name": "React", "weight": 9 }
  ],
  "bonus": [
    { "name": "AWS", "weight": 6 }
  ],
  "synonyms": {
    "javascript": ["js", "es6", "ecmascript"],
    "react": ["reactjs", "react.js"]
  }
}
```

After editing, rebuild:
```bash
npm run build
```
Then refresh in Chrome: `chrome://extensions/` → find AliceHR → click refresh

### Edit Candidate Facts

File: `/home/user/AliceHR/src/data/candidateFacts.json`

```json
{
  "relevantFacts": [
    "10+ years full-stack development",
    "Team lead experience",
    "AWS certified"
  ],
  "forbiddenClaims": [
    "Add fake years of experience",
    "Claim unearned certifications"
  ]
}
```

## 📊 Score Threshold

- **Score ≥ 50%**: Prompt generation available
- **Score < 50%**: Prompt generation blocked (job doesn't match enough skills)

You can adjust this threshold in `src/popup/popup.ts` line 155:
```typescript
if (!meetsPromptThreshold(scoreResult.score, 50)) {  // <- Change 50 to threshold
```

## 💾 Local Storage

All data stays in your browser:
- Saved jobs are in `chrome.storage.local`
- Skills dictionary is in `src/data/skills.json`
- Candidate facts are in `src/data/candidateFacts.json`

**Nothing is sent to any server.**

## 🐛 Troubleshooting

### Extension doesn't appear in toolbar
- Check if it's enabled in `chrome://extensions/`
- Try clicking the puzzle icon → pin AliceHR

### "Failed to extract job data" error
- Make sure you're on a webpage with content
- Try refreshing the page first
- Some pages may block content script access

### Buttons are disabled or unresponsive
- Go to `chrome://extensions/`
- Find AliceHR and click the refresh button
- Try the button again

### Prompt won't generate
- Check the score (must be ≥ 50%)
- Look for the score message in the popup
- Review your skills dictionary

### Where are my saved jobs?
- Go to `chrome://extensions/`
- Find AliceHR → "Details"
- Click "Manage extension"
- Check storage in DevTools: F12 → Application → Storage → Local Storage

## 🚀 Next Steps

1. **Test on multiple job sites**: LinkedIn, Indeed, Glassdoor, etc.
2. **Customize skills.json**: Add your industry-specific skills
3. **Update candidateFacts.json**: Add your real background
4. **Generate prompts**: Find jobs with 50%+ match and get ChatGPT prompts
5. **Refine resume**: Use ChatGPT prompts to optimize your resume

## 📝 Example Workflow

1. **Browse job on LinkedIn**
2. **Click "Score Job"** → See 72% match with 8/10 required skills
3. **Click "Generate Prompt"** → Copies Markdown prompt to clipboard
4. **Open ChatGPT** → Paste prompt → Get ATS-optimized resume suggestions
5. **Update resume** → Reapply with optimized content

## 🔒 Privacy

- No data is sent anywhere
- All processing happens in your browser
- Chrome storage is encrypted
- You can clear extension data anytime in Chrome settings

## ⚙️ Tech Stack

- **TypeScript**: Type safety
- **Chrome Manifest V3**: Latest extension standard
- **Local Storage**: `chrome.storage.local` API
- **ES2020**: Modern JavaScript

## 📚 File Reference

| File | Purpose |
|------|---------|
| `manifest.json` | Extension config |
| `popup.html` | Popup UI |
| `popup.ts` | Popup logic |
| `extractJob.ts` | Content script |
| `normalize.ts` | Text utilities |
| `skills.ts` | Skills dictionary management |
| `scoreJob.ts` | Scoring algorithm |
| `generatePrompt.ts` | Prompt generation |
| `skills.json` | Skills data |
| `candidateFacts.json` | Candidate profile |

## 🎯 Success Metrics

The extension is working when:
- ✅ Extension loads without errors
- ✅ Job text is extracted cleanly
- ✅ Score matches reflect job requirements
- ✅ Prompts are generated for high-match jobs
- ✅ Prompts work in ChatGPT for resume optimization
- ✅ Jobs are saved and persistent

---

**Happy job hunting! 🎉**

For questions or issues, check the README.md or DEVELOP.md files.
