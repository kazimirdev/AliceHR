# AliceHR - Testing Guide

## Quick Test Checklist

### Installation ✓
- [ ] Built with `npm run build`
- [ ] Loaded at `chrome://extensions/` (Developer mode)
- [ ] Extension icon appears in toolbar
- [ ] No errors in Chrome console

### Basic Functionality
- [ ] Popup opens when clicking extension icon
- [ ] All 4 buttons are visible and clickable
- [ ] Status messages appear and disappear

### Job Extraction
- [ ] Extract from LinkedIn job posting
- [ ] Extract from Indeed job posting
- [ ] Extract from custom HTML page
- [ ] Text is readable (nav/footer removed)
- [ ] Special characters are preserved
- [ ] URLencoded properly

### Job Scoring

#### Test Case 1: Perfect Match
1. Go to a job with exact match to skills.json requirements
2. Click "Score Job"
3. Expected: Score ≥ 80%, all matched required
4. Actual: ___________

#### Test Case 2: Partial Match
1. Go to a job with 50% of required skills
2. Click "Score Job"
3. Expected: Score ~50%
4. Actual: ___________

#### Test Case 3: Poor Match
1. Go to a non-tech job or unrelated content
2. Click "Score Job"
3. Expected: Score ≤ 30%
4. Actual: ___________

#### Test Case 4: Red Flags
1. Go to a job posting with "guaranteed income" or "no experience needed"
2. Click "Score Job"
3. Expected: Red flags detected and shown
4. Actual: ___________

### Prompt Generation

#### Test Case 5: High Score Prompt
1. Score a job at 75%+
2. Click "Generate Prompt"
3. Expected:
   - Popup shows success message
   - Nothing appears visually (prompted copied to clipboard)
   - Can paste into ChatGPT
4. Actual: ___________

#### Test Case 6: Low Score No Prompt
1. Score a job at 30%
2. Click "Generate Prompt"
3. Expected: Error message "Score too low (30%). Need 50+"
4. Actual: ___________

#### Test Case 7: Prompt Content
1. Generate a valid prompt (score ≥ 50%)
2. Paste into text editor
3. Check format:
   - [ ] Markdown formatted
   - [ ] Job title included
   - [ ] URL included
   - [ ] Match score included
   - [ ] Matched skills listed
   - [ ] Missing skills listed
   - [ ] Bonus skills listed (if any)
   - [ ] Red flags listed (if any)
   - [ ] Candidate facts included
   - [ ] Forbidden claims warning included
   - [ ] ATS optimization instructions present

### Job Saving

#### Test Case 8: Save Single Job
1. Go to a job posting
2. Click "Save Job"
3. Expected: Success message with job title
4. Actual: ___________

#### Test Case 9: Save Multiple Jobs
1. Go to 3 different job postings
2. Click "Save Job" on each
3. Click "View Saved Jobs"
4. Expected: Status shows "3 jobs saved"
5. Actual: ___________

#### Test Case 10: Persistence
1. Save jobs
2. Close and reopen Chrome
3. Click "View Saved Jobs"
4. Expected: Jobs still show as saved
5. Actual: ___________

### Advanced Test Cases

#### Test Case 11: Synonym Matching
1. Look for job with "JS" (synonym for JavaScript)
2. Score job
3. Expected: JavaScript should match
4. Actual: ___________

#### Test Case 12: Case Insensitivity
1. Look for job with "REACT" or "React" (mixed case)
2. Score job
3. Expected: Should still match
4. Actual: ___________

#### Test Case 13: Multiple Synonyms
1. Look for job requiring "graphQL" or "apollo" or "graphql-core"
2. Score job
3. Expected: GraphQL should match any variant
4. Actual: ___________

#### Test Case 14: Long Job Text
1. Go to very long job posting (1000+ words)
2. Score job
3. Expected: No timeout, score calculated in <1 second
4. Actual: ___________

#### Test Case 15: Minimal Job Text
1. Create test page with just "We need JavaScript developers"
2. Score job
3. Expected: Still works, matches JavaScript
4. Actual: ___________

### Error Handling

#### Test Case 16: Missing skills.json
1. Delete `dist/data/skills.json`
2. Try to score a job
3. Expected: Error message about loading skills
4. Actual: ___________

#### Test Case 17: No Content on Page
1. Go to blank page
2. Try to extract job
3. Expected: Extracts empty/minimal text
4. Actual: ___________

#### Test Case 18: Script Elements Removed
1. Go to page with lots of `<script>` tags
2. Score job
3. Expected: JavaScript removed, readable text preserved
4. Actual: ___________

### Cross-Browser Job Sites

Test extraction and scoring on these popular sites:

- [ ] **LinkedIn** (linkedin.com)
  - [ ] Extraction works ___________
  - [ ] Scoring works ___________

- [ ] **Indeed** (indeed.com)
  - [ ] Extraction works ___________
  - [ ] Scoring works ___________

- [ ] **Glassdoor** (glassdoor.com)
  - [ ] Extraction works ___________
  - [ ] Scoring works ___________

- [ ] **AngelList** (angel.co)
  - [ ] Extraction works ___________
  - [ ] Scoring works ___________

- [ ] **GitHub Jobs** (github.com/jobs)
  - [ ] Extraction works ___________
  - [ ] Scoring works ___________

### UI/UX Testing

#### Test Case 19: Button States
- [ ] Buttons are enabled by default
- [ ] Buttons disable during API call (if async)
- [ ] Buttons re-enable after response
- [ ] Buttons have proper hover states
- [ ] Buttons show loading indicator (if added)

#### Test Case 20: Status Messages
- [ ] Success messages show in green
- [ ] Error messages show in red
- [ ] Info messages show in blue
- [ ] Messages disappear after 4 seconds
- [ ] Multiple messages don't stack

#### Test Case 21: Score Display
- [ ] High scores (70%+) show green badge
- [ ] Medium scores (50-70%) show yellow badge
- [ ] Low scores (<50%) show red badge
- [ ] Score value is accurate
- [ ] Score summary makes sense

#### Test Case 22: Responsive Design
- [ ] Popup fits in 500x300px
- [ ] Text wraps properly
- [ ] Buttons are all clickable
- [ ] No horizontal scroll
- [ ] Looks good on 1920x1080 monitor
- [ ] Looks good on 1366x768 monitor

### Performance Testing

#### Test Case 23: Extraction Speed
1. Time how long extraction takes
2. Expected: <500ms
3. Actual: ___________

#### Test Case 24: Scoring Speed
1. Time how long scoring takes on 10KB+ text
2. Expected: <100ms
3. Actual: ___________

#### Test Case 25: Memory Usage
1. Open DevTools → Memory
2. Record initial memory
3. Save 10 jobs
4. Record final memory
5. Expected: <5MB increase
6. Actual: ___________

#### Test Case 26: Storage Limit
1. Try to save 1000 jobs sequentially
2. Expected: Either works or shows quota error (not crash)
3. Actual: ___________

### Integration Testing

#### Test Case 27: ChatGPT Integration
1. Generate a prompt
2. Go to ChatGPT
3. Paste prompt
4. Let ChatGPT process
5. Expected:
   - [ ] ChatGPT understands the context
   - [ ] No formatting errors
   - [ ] ChatGPT provides resume suggestions
   - [ ] Suggestions are relevant
6. Actual: ___________

#### Test Case 28: Multiple Profiles
1. Switch Chrome profiles
2. Load extension in second profile
3. Expected: Extension works independently
4. Actual: ___________

#### Test Case 29: DevTools
1. Open DevTools (F12)
2. Check Console tab
3. Expected: No errors, maybe info logs
4. Actual: ___________

### Edge Cases

#### Test Case 30: Very High Score
1. Create job with all matched skills + more bonuses
2. Expected: Score capped at 100%
3. Actual: ___________

#### Test Case 31: Zero Matches
1. Create job with no matching skills
2. Expected: Score is 0%, all missing
3. Actual: ___________

#### Test Case 32: Special Characters
1. Job with emoji 🚀 or other unicode
2. Expected: Handled gracefully
3. Actual: ___________

#### Test Case 33: Empty Fields
1. Job with blank title or URL
2. Expected: Still saves, doesn't crash
3. Actual: ___________

#### Test Case 34: Duplicate Jobs
1. Save same job twice
2. Expected: Both saved with different IDs
3. Actual: ___________

## Automated Testing (Future)

```bash
npm test
```

Would cover:
- Unit tests for normalize.ts
- Unit tests for scoreJob.ts
- Integration tests for prompt generation
- Content script behavior

## Manual Test Workflow

### Daily Testing (30 minutes)
1. Run through Test Cases 1-10
2. Note any issues
3. Test on 1-2 job sites

### Weekly Testing (1 hour)
1. Run through all basic tests
2. Test on all 5 job sites
3. Performance testing
4. ChatGPT integration

### Before Release
1. Complete all test cases
2. Cross-browser (Chrome, Edge, Brave)
3. Multiple profiles
4. Performance benchmarking
5. Documentation review

## Reporting Bugs

Format:
- **Test Case**: _______
- **Expected**: _______
- **Actual**: _______
- **Steps to Reproduce**: _______
- **Screenshots**: _______
- **Browser Version**: _______
- **OS**: _______

---

**Test Status**: ⚠️ Not Yet Tested
**Last Tested**: _______
**Tester**: _______
