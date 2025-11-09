import { NatureGame } from './game.js';

/**
 * Main entry point for the Nature ID Game
 * Initializes the game when DOM is ready
 */

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

/**
 * Initialize the game
 */
function initGame() {
    try {
        // Create and start the game
        window.game = new NatureGame();
        console.log('Nature ID Game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        
        // Show error to user
        const gameContent = document.getElementById('gameContent');
        if (gameContent) {
            gameContent.innerHTML = `
                <div class="loading">
                    ⚠️ Failed to initialize game. Please refresh the page.
                    <br><br>
                    <small>Error: ${error.message}</small>
                </div>
            `;
        }
    }
}

// Export for potential use in console debugging
export { initGame };
