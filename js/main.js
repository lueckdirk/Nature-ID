import { NatureGame } from './game.js';

/**
 * Entry point for the Nature ID Study Tool
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

function initGame() {
    try {
        window.game = new NatureGame();
        console.log('Nature ID Study Tool initialized');
    } catch (error) {
        console.error('Failed to initialize:', error);
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div style="padding:40px;text-align:center;color:#546e7a">
                    <div style="font-size:3rem;margin-bottom:16px">🌧️</div>
                    <p>Failed to initialize. Please refresh the page.</p>
                    <p style="font-size:0.85rem;margin-top:8px">${error.message}</p>
                </div>
            `;
        }
    }
}

export { initGame };
