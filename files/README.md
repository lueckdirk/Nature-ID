# Nature ID Game - Refactored Architecture

A web-based educational game for learning species identification using data from iNaturalist.

## 🏗️ Architecture Overview

The application has been refactored from a single monolithic HTML file into a modular, maintainable architecture:

```
nature-id-game/
├── index.html              # Main HTML structure
├── styles/
│   ├── main.css           # Core layout and base styles
│   ├── components.css     # Game component styles
│   └── modal.css          # Image modal styles
└── js/
    ├── main.js            # Application entry point
    ├── game.js            # Main game controller
    ├── config.js          # Configuration constants
    ├── api.js             # iNaturalist API service
    ├── questionGenerator.js  # Question generation logic
    ├── uiRenderer.js      # UI rendering logic
    └── modalHandler.js    # Image zoom modal handler
```

## 📋 Module Responsibilities

### `main.js`
- Application entry point
- Initializes the game when DOM is ready
- Error handling for initialization

### `game.js` - Game Controller
- Manages game state (score, streak, progress)
- Coordinates between all modules
- Handles user interactions (answer, skip, next)
- Tracks diversity metrics (species seen/learned)

### `config.js` - Configuration
- Taxon IDs for different species categories
- Geographic bounds for regions and states
- API configuration
- Difficulty settings
- Score values

### `api.js` - API Service
- Fetches observations from iNaturalist API
- Fetches related species for medium/hard difficulty
- Validates observations
- Formats taxonomy information

### `questionGenerator.js` - Question Generator
- Processes observations into quiz questions
- Implements intelligent wrong answer selection:
  - **Easy mode**: Random species from any category
  - **Medium/Hard mode**: Related species from same genus/family/order
- Uses multiple strategies to find taxonomically similar species
- Manages used species cache

### `uiRenderer.js` - UI Renderer
- Renders quiz questions and options
- Updates score displays
- Shows feedback messages
- Handles loading and error states
- Different displays for easy/medium vs hard mode

### `modalHandler.js` - Modal Handler
- Image zoom functionality
- Drag-to-pan support
- Keyboard shortcuts (Escape, +/-, 0)
- Touch support for mobile devices

## ✨ Key Improvements

### 1. **Enhanced Taxonomy Display**
- Easy/Medium mode now shows:
  - Common name (prominent)
  - Scientific name (italic)
  - Genus and Family classification
- Hard mode shows scientific names with common names revealed after answer

### 2. **Improved Related Species Algorithm**
The question generator now uses a robust multi-strategy approach for medium/hard modes:

1. **Strategy 1**: Find same genus species from current batch
2. **Strategy 2**: Find same family species from current batch
3. **Strategy 3**: Fetch related species from iNaturalist API
4. **Strategy 4**: Fall back to any available species

This ensures players get challenging but fair questions with taxonomically related species.

### 3. **Separation of Concerns**
- **Data layer** (api.js): Handles all API communication
- **Business logic** (game.js, questionGenerator.js): Game rules and question generation
- **Presentation** (uiRenderer.js, modalHandler.js): All UI rendering
- **Configuration** (config.js): Centralized settings

### 4. **Maintainability Benefits**
- **Modularity**: Each file has a single, clear responsibility
- **Testability**: Pure functions and clear interfaces make unit testing easier
- **Extensibility**: Easy to add new features (e.g., new difficulty modes, API sources)
- **Debugging**: Isolated modules make it easier to track down issues
- **Code reuse**: Components can be reused or modified independently

## 🎮 Game Features

### Difficulty Modes
- **Easy**: Random species, shows all taxonomy info
- **Medium**: Same family species, shows all taxonomy info
- **Hard**: Scientific names prominent, same genus/family species

### Customization Options
- 10+ species categories (Birds, Plants, Insects, etc.)
- 50+ geographic regions (US states, countries, regions)
- Diversity tracking (unique species seen and correctly identified)

### User Experience
- Image zoom with pan functionality
- Keyboard shortcuts for modal navigation
- Progress tracking with visual progress bar
- Streak counter for consecutive correct answers
- Mobile-responsive design

## 🔧 Adding New Features

### Adding a New Species Category
1. Add taxon ID to `TAXON_IDS` in `config.js`
2. Add option to select element in `index.html`

### Adding a New Difficulty Level
1. Add settings to `DIFFICULTY_SETTINGS` in `config.js`
2. Update `renderOption()` in `uiRenderer.js` for display logic
3. Update `getRelatedWrongOptions()` in `questionGenerator.js` for question generation

### Adding a New Geographic Region
1. Add bounds to `REGION_BOUNDS` or `US_STATE_BOUNDS` in `config.js`
2. Add option to select element in `index.html`

### Modifying the UI
- Edit CSS files in `styles/` directory
- Update rendering logic in `uiRenderer.js`

## 🚀 Getting Started

Simply open `index.html` in a modern web browser. No build process or dependencies required!

The game uses ES6 modules, so it must be served over HTTP (not file://) for modules to work properly. You can use any simple HTTP server:

```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server)
npx http-server

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 📝 Code Style

- ES6+ JavaScript with modules
- Clear, descriptive variable and function names
- JSDoc comments for public methods
- Consistent indentation (4 spaces)
- Modular CSS with component-based organization

## 🐛 Error Handling

The application includes comprehensive error handling:
- API fetch failures are caught and logged
- Graceful degradation when no questions are available
- User-friendly error messages
- Console logging for debugging

## 📄 License

Data provided by [iNaturalist](https://www.inaturalist.org) - A community of nature enthusiasts.
