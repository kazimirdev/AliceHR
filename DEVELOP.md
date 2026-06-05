# AliceHR Build Configuration

This directory contains the compiled Chrome extension.

## Files

- `manifest.json` - Extension configuration
- `background.js` - Service worker (compiled)
- `popup/` - Popup UI
  - `popup.html` - HTML template
  - `popup.js` - Popup logic (compiled)
- `content/` - Content scripts
  - `extractJob.js` - Job extractor (compiled)
- `core/` - Core utilities (compiled)
- `data/` - JSON configuration files

## Loading the Extension

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this `dist/` folder

## Rebuilding

From the project root:

```bash
npm run build
```

Then refresh the extension in Chrome (Ctrl+R or cmd+R on the extensions page).
