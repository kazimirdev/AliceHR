# AliceHR - Job Screening & ATS Resume Prompt Generator

An MVP Chrome extension (Manifest V3) for screening job vacancies and generating ATS-optimized resume prompts.

## Features

- 📋 **Extract Job Text**: Automatically extract readable job posting content from any webpage
- ⭐ **Score Jobs**: Local scoring algorithm matches job requirements against a skills dictionary
- 🤖 **Generate Prompts**: Create ChatGPT-compatible Markdown prompts for ATS resume optimization
- 💾 **Save Jobs**: Store job postings locally in Chrome storage
- 📊 **Skills Matching**: Built-in skills dictionary with synonyms and weighted scoring
- ✅ **Local Only**: No backend, no API calls, no data sent anywhere

## Project Structure

```
AliceHR/
├── src/
│   ├── manifest.json           # Chrome extension manifest V3
│   ├── background.ts           # Service worker
│   ├── popup/
│   │   ├── popup.html          # Popup UI
│   │   └── popup.ts            # Popup logic
│   ├── content/
│   │   └── extractJob.ts       # Content script for job extraction
│   ├── core/
│   │   ├── normalize.ts        # Text normalization utilities
│   │   ├── skills.ts           # Skills dictionary handling
│   │   ├── scoreJob.ts         # Scoring algorithm
│   │   ├── generatePrompt.ts   # Prompt generation
│   │   └── candidateFacts.ts   # Candidate facts reference
│   └── data/
│       ├── skills.json         # Skills dictionary with weights
│       └── candidateFacts.json # Candidate profile guidelines
├── dist/                       # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Extension

```bash
npm run build
```

This compiles TypeScript files to `dist/` and copies static assets.

### 3. Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `dist/` folder
5. The AliceHR extension should appear in your extensions list

### 4. Test the Extension

1. Navigate to any job posting website (LinkedIn, Indeed, etc.)
2. Click the AliceHR extension icon in your toolbar
3. Use the buttons:
   - **Save Job**: Saves the current job posting to local storage
   - **Score Job**: Analyzes the job posting and calculates a match score (0-100)
   - **Generate Prompt**: Creates a ChatGPT-compatible prompt (if score ≥ 50%)
   - **View Saved Jobs**: Shows list of saved jobs

## How It Works

### Job Extraction
The content script removes navigation, footers, scripts, styles, and cookie banners, then extracts readable text from the job posting.

### Scoring Algorithm
1. Reads the skills dictionary (required, bonus, and synonyms)
2. Normalizes job text and searches for skill matches
3. Calculates weighted score based on matched required skills
4. Identifies matched bonus skills and red flags
5. Returns score (0-100) and detailed breakdown

### Prompt Generation
- Requires a score of 50% or higher
- Generates a structured Markdown prompt for ChatGPT
- Includes job context, matched skills, missing skills, and ATS optimization instructions
- Copied to clipboard for easy pasting into ChatGPT
- Emphasizes honesty and prevents false claims

### Local Storage
All jobs are stored in `chrome.storage.local` - they stay in your browser only and are never sent anywhere.

## Customization

### Edit Skills Dictionary

Edit `src/data/skills.json` to customize:
- **Required skills**: Core competencies (higher weight = more important)
- **Bonus skills**: Nice-to-have qualifications
- **Synonyms**: Alternative names for skills (e.g., "JS" → "JavaScript")

Example:
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
    "javascript": ["js", "es6"],
    "react": ["reactjs"]
  }
}
```

### Edit Candidate Facts

Edit `src/data/candidateFacts.json` to customize:
- **Relevant facts**: Your background that should appear in prompts
- **Forbidden claims**: Things never to claim in your resume

## Technology Stack

- **TypeScript**: For type safety and better developer experience
- **Chrome Manifest V3**: Latest extension API standard
- **Local Storage**: `chrome.storage.local` for persistence
- **JSON**: For configuration and data storage
- **No frameworks**: Vanilla TypeScript for simplicity and performance

## What's NOT Included (MVP Scope)

- ❌ PDF generation
- ❌ ChatGPT UI automation
- ❌ Job board API parsing
- ❌ Backend server
- ❌ Database
- ❌ Paid APIs

These can be added in future versions.

## Development

```bash
# Watch TypeScript files during development
npm run watch

# Rebuild everything
npm run build

# Clean build
npm run clean
```

After making changes:
1. Run `npm run build`
2. Go to `chrome://extensions/`
3. Find AliceHR and click the refresh button

## Future Enhancements

- [ ] Dedicated jobs list/browser UI
- [ ] Resume upload and analysis
- [ ] Candidate profile editor
- [ ] Advanced filtering and sorting
- [ ] Export to PDF
- [ ] Job board connectors
- [ ] Multi-profile support
- [ ] Dark mode

## Notes

- The extension works on any website, not just job boards
- Score threshold for prompt generation is 50% (configurable)
- Red flag detection helps identify potentially fraudulent job postings
- All processing happens locally in your browser

## License

MIT

## Support

For issues or suggestions, please create an issue in the repository.

---

**AliceHR MVP v0.1.0** — Local-only job screening and ATS prompt generation for Chrome.
