# AliceHR - Setup & Configuration Guide

## 🎯 Installation Checklist

Use this checklist to ensure everything is set up correctly.

### ✅ Pre-Installation
- [ ] Chrome or Chromium-based browser installed
- [ ] Node.js and npm installed (`npm --version` returns version)
- [ ] Git installed (optional, for version control)
- [ ] Terminal/Command prompt ready

### ✅ Build
- [ ] Navigate to `/home/user/AliceHR`
- [ ] Run `npm install` (installs TypeScript)
- [ ] Run `npm run build` (compiles extension)
- [ ] Check that `dist/` folder is created
- [ ] Verify `dist/manifest.json` exists
- [ ] Verify `dist/popup/popup.html` exists
- [ ] Verify `dist/data/skills.json` exists

### ✅ Chrome Setup
- [ ] Open Chrome
- [ ] Go to `chrome://extensions/`
- [ ] Toggle "Developer mode" ON (top-right corner)
- [ ] Click "Load unpacked" button
- [ ] Navigate to `/home/user/AliceHR/dist/` folder
- [ ] Select the folder and click "Open"
- [ ] See "AliceHR - Job Screening & ATS Prompt Generator" in extensions list
- [ ] Click the extension icon in toolbar
- [ ] Verify popup appears with 4 buttons

### ✅ First Test
- [ ] Go to a job posting website (LinkedIn, Indeed, etc.)
- [ ] Click AliceHR extension icon
- [ ] Click "Score Job" button
- [ ] See score result appear
- [ ] Verify no console errors (F12 → Console tab)

---

## 🔧 Configuration Files

### 1. Skills Dictionary: `src/data/skills.json`

**When to edit:**
- Add industry-specific skills
- Change skill weights
- Add/remove synonyms

**Example edit:**
```json
{
  "required": [
    { "name": "Python", "weight": 10 },
    { "name": "Django", "weight": 8 }
  ],
  "bonus": [
    { "name": "FastAPI", "weight": 5 }
  ],
  "synonyms": {
    "python": ["py", "python3"],
    "django": ["django rest"],
    "fastapi": ["fast api"]
  }
}
```

**After editing:**
```bash
npm run build
# Then refresh in chrome://extensions/
```

### 2. Candidate Profile: `src/data/candidateFacts.json`

**When to edit:**
- Personalize candidate background facts
- Update forbidden claims based on your situation

**Example:**
```json
{
  "relevantFacts": [
    "15+ years Python development",
    "Lead Django architect",
    "Cloud deployment expertise"
  ],
  "forbiddenClaims": [
    "More than 20 years experience",
    "Google/Meta employment (not true)",
    "PhD in Computer Science (not earned)"
  ]
}
```

### 3. Scoring Threshold: `src/popup/popup.ts`

**Location:** Line ~155

**Current:**
```typescript
if (!meetsPromptThreshold(scoreResult.score, 50)) {
```

**To require 60%+:**
```typescript
if (!meetsPromptThreshold(scoreResult.score, 60)) {
```

---

## 🎨 UI Customization

### Colors (in `src/popup/popup.html`)

**Current color scheme:**
- Primary: Purple (#667eea)
- Success: Green (#10b981)
- Info: Blue (#3b82f6)
- Warning: Orange (#f59e0b)
- Danger: Red (in styles)

**To change theme, modify CSS in `<style>` section:**
```css
/* Change primary color from purple to blue */
h1 { color: #3b82f6; }
.logo { color: #3b82f6; }
```

### Button Labels (in `src/popup/popup.html`)

Find and update button text:
```html
<button class="btn-save" id="saveJobBtn">
  <span>💾</span> Your Custom Label Here
</button>
```

---

## 🔍 Debugging & Troubleshooting

### Extension Won't Load

**Error: "Extension ID not found"**
- Make sure `dist/` folder exists
- Make sure `dist/manifest.json` exists
- Try rebuilding: `npm run build`

**Error: "Invalid manifest"**
- Check Chrome console for specific error
- Verify `dist/manifest.json` is valid JSON
- Rebuild: `npm run build`

### Script Errors

**In Chrome Console (F12):**

1. Go to `chrome://extensions/`
2. Find AliceHR → "Details"
3. Scroll down → "Inspect views: background page"
4. New tab opens with console
5. Check for errors

### Content Script Not Running

**If extraction fails:**
- Some sites block content scripts
- Try refreshing the page (Ctrl+R or Cmd+R)
- Try different job board
- Check permissions in `manifest.json`

### Storage Issues

**To clear saved jobs:**
1. `chrome://extensions/`
2. Find AliceHR → "Details"
3. Under "Storage" → click "Manage"
4. Click "Clear Site Data"
5. Refresh page

---

## 📱 Multi-Profile Setup

### Using Different Profiles

The extension works independently in each Chrome profile:

1. **Profile A**: Tech skills dictionary
2. **Profile B**: Sales skills dictionary
3. **Profile C**: Management skills dictionary

Each profile maintains separate:
- Saved jobs
- chrome.storage.local data
- Extension settings (if you add any)

### Setup:
1. Create new Chrome profile
2. Load extension in each profile
3. Customize skills.json differently per profile
4. Rebuild: `npm run build`
5. Load unpacked in each profile

---

## 🚀 Advanced Configuration

### Custom Red Flags

**Edit:** `src/core/scoreJob.ts` line ~10

**Current red flags:**
```typescript
const RED_FLAG_KEYWORDS = [
  'no experience necessary',
  'guaranteed employment',
  'work from home guaranteed',
  'make money fast',
  'rich quick',
  'unlimited income',
  'no interviews',
  'no background check',
];
```

**Add industry-specific ones:**
```typescript
const RED_FLAG_KEYWORDS = [
  // ... existing ones ...
  'must have cryptocurrency knowledge',
  'blood type verification required',
  'must pass polygraph test',
];
```

**Then rebuild:**
```bash
npm run build
```

### Custom Scoring Weights

**In `src/data/skills.json`:**

Weights range suggested: 1-10, where:
- 10 = Critical/must have
- 7-8 = Very important
- 4-6 = Important
- 1-3 = Nice to have

Example:
```json
"required": [
  { "name": "JavaScript", "weight": 10 },  // Critical
  { "name": "React", "weight": 8 },        // Very important
  { "name": "Testing", "weight": 5 },      // Important
  { "name": "Documentation", "weight": 3 } // Nice to have
]
```

---

## 🔄 Development Workflow

### During Development

```bash
# Terminal 1: Watch for changes
npm run watch

# Terminal 2: Manual rebuild when needed
npm run build

# After each build, refresh extension in chrome://extensions/
```

### Making Changes

1. Edit TypeScript file in `src/`
2. Save file
3. TypeScript auto-compiles if using `npm run watch`
4. Go to `chrome://extensions/`
5. Find AliceHR, click refresh button
6. Test changes

### Example Workflow:

```bash
# 1. Understand current code
cat src/core/scoreJob.ts

# 2. Make changes to algorithm
# (edit file in VS Code)

# 3. Rebuild
npm run build

# 4. Refresh extension
# (go to chrome://extensions/ and click refresh)

# 5. Test on job posting
# (click AliceHR → Score Job)
```

---

## 📊 Monitoring & Analytics (Future)

Currently, the extension does NOT collect or send any analytics. Future versions could add:

- Local stats dashboard (jobs by score)
- Monthly summary (top matching jobs)
- Skill trending (which skills are most common)
- Industry breakdown (job distribution)

All would be stored locally, never transmitted.

---

## 🔐 Security Configuration

### Current Settings (Secure by Default)

```json
{
  "permissions": ["storage", "tabs", "scripting"],
  "host_permissions": ["<all_urls>"]
}
```

**What this means:**
- ✅ Read/write to local storage
- ✅ Access current tab information
- ✅ Run content script on all sites
- ❌ No network requests
- ❌ No file system access
- ❌ No user data collection

### To Restrict to Specific Sites Only

**Edit `src/manifest.json`:**

```json
"content_scripts": [
  {
    "matches": [
      "https://linkedin.com/*",
      "https://www.indeed.com/*",
      "https://www.glassdoor.com/*"
    ],
    "js": ["content/extractJob.js"],
    "run_at": "document_end"
  }
]
```

**Then rebuild:**
```bash
npm run build
```

---

## 📚 Configuration Reference

| Config File | Purpose | Edit When | Rebuild |
|-------------|---------|-----------|---------|
| `skills.json` | Skill definitions | Changing industry | Yes |
| `candidateFacts.json` | Profile information | Updating background | No* |
| `manifest.json` | Extension config | Changing permissions | Yes |
| `popup.html` | UI layout | Changing design | Yes |
| `popup.ts` | UI logic | Changing behavior | Yes |
| `scoreJob.ts` | Scoring algorithm | Changing formula | Yes |

*Note: candidateFacts.json changes don't require rebuild, but timing might be off until reload

---

## ✨ Tips & Tricks

### Quick Testing

```bash
# Build and immediately check dist/ folder
npm run build && ls -la dist/

# Check specific compiled file
npm run build && cat dist/core/scoreJob.js | head -20
```

### Backup Configuration

```bash
# Backup your customized files
cp src/data/skills.json src/data/skills.json.backup
cp src/data/candidateFacts.json src/data/candidateFacts.json.backup

# Restore if needed
cp src/data/skills.json.backup src/data/skills.json
npm run build
```

### Multiple Skill Sets

```bash
# Create a skills file for different roles
cp src/data/skills.json src/data/skills.frontend.json
cp src/data/skills.json src/data/skills.backend.json

# Edit each one differently
# Then swap them before building for different profile
```

---

## 🆘 Getting Help

### Check Documentation
1. README.md - Overview
2. QUICKSTART.md - Quick setup
3. ARCHITECTURE.md - How it works
4. TESTING.md - Testing guide
5. PROJECT_SUMMARY.md - Complete summary

### Check Logs
```bash
# View build output
npm run build

# Check extension console
# chrome://extensions/ → AliceHR Details → Inspect views
```

### Verify Installation
- [ ] dist/ folder exists
- [ ] dist/manifest.json is valid
- [ ] dist/data/skills.json exists
- [ ] dist/popup/popup.html exists
- [ ] All .js files compiled (no .ts files)

---

## 🎯 Common Customizations

### For Data Scientists
```json
{
  "required": [
    { "name": "Python", "weight": 10 },
    { "name": "SQL", "weight": 9 },
    { "name": "Pandas", "weight": 8 }
  ]
}
```

### For Product Managers
```json
{
  "required": [
    { "name": "Product Management", "weight": 10 },
    { "name": "User Research", "weight": 8 },
    { "name": "Analytics", "weight": 7 }
  ]
}
```

### For DevOps Engineers
```json
{
  "required": [
    { "name": "Kubernetes", "weight": 10 },
    { "name": "Docker", "weight": 9 },
    { "name": "AWS", "weight": 8 }
  ]
}
```

---

**Last Updated:** June 5, 2026
**Version:** 0.1.0
