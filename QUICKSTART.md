# Quick Start Guide

## Running the Game

The game uses ES6 modules, so it must be served over HTTP (not opened directly as a file).

### Option 1: Python (Easiest)
```bash
cd nature-id-game
python -m http.server 8000
```
Then open: http://localhost:8000

### Option 2: Node.js
```bash
cd nature-id-game
npx http-server
```

### Option 3: PHP
```bash
cd nature-id-game
php -S localhost:8000
```

### Option 4: VS Code
Install the "Live Server" extension and click "Go Live"

## Project Structure

```
nature-id-game/
├── index.html              Main HTML file
├── styles/
│   ├── main.css           Base styles
│   ├── components.css     Game components
│   └── modal.css          Image zoom modal
└── js/
    ├── main.js            Initializes game
    ├── game.js            Game controller
    ├── config.js          Configuration
    ├── api.js             API calls
    ├── questionGenerator.js  Makes questions
    ├── uiRenderer.js      Renders UI
    └── modalHandler.js    Image zoom
```

## Making Changes

### Add a New Species Category
1. Edit `js/config.js` - Add to `TAXON_IDS`
2. Edit `index.html` - Add option to category select

### Change Difficulty Settings
1. Edit `js/config.js` - Modify `DIFFICULTY_SETTINGS`
2. Edit `js/questionGenerator.js` - Update logic if needed
3. Edit `js/uiRenderer.js` - Update display if needed

### Modify UI Styles
- Edit files in `styles/` directory
- Changes take effect immediately (refresh browser)

### Change Game Logic
- Edit `js/game.js` for scoring/state
- Edit `js/questionGenerator.js` for questions
- Edit `js/api.js` for data fetching

## Key Features

- **10+ species categories** (Birds, Plants, Insects, etc.)
- **3 difficulty modes** (Easy, Medium, Hard)
- **50+ geographic regions** (US states, countries, regions)
- **Image zoom** with pan and keyboard shortcuts
- **Progress tracking** with streaks and diversity metrics
- **Mobile responsive**

## Troubleshooting

### "Cannot use import statement outside a module"
- Make sure you're serving over HTTP, not opening as file://
- Check that `<script type="module">` is in index.html

### Images not loading
- Check internet connection (uses iNaturalist API)
- Try different region/category if current one has no data

### No questions generated
- Some combinations of region + category may have limited data
- Try "Global" region or different category
- Check browser console for errors

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- IE11: ❌ Not supported (needs ES6 modules)

## Documentation

- See `README.md` for full architecture documentation
- See `SUMMARY.md` for refactoring details
- Code comments explain complex logic

## Contact & Issues

Built with data from [iNaturalist.org](https://www.inaturalist.org) 🌿
