import { INaturalistAPI } from './api.js';

/**
 * Handles all UI rendering and updates
 */
export class UIRenderer {
    constructor(gameContent) {
        this.gameContent = gameContent;
    }

    /**
     * Render a quiz question
     * @param {Object} question - Question object with correct answer and options
     * @param {Function} onAnswer - Callback when user selects an answer
     * @param {Function} onSkip - Callback when user skips
     * @param {Function} onNext - Callback when user clicks next
     * @param {Function} onImageClick - Callback when user clicks to zoom image
     */
    renderQuestion(question, onAnswer, onSkip, onNext, onImageClick) {
        const { correct, options, difficulty } = question;
        const url = correct.photos[0].url.replace('square', 'medium');
        const useScientific = difficulty === 'hard';
        
        this.gameContent.innerHTML = `
            <div class="image-container" id="imageContainer">
                <img src="${url}" class="species-image" alt="Species to identify" />
                <div class="zoom-icon">🔍</div>
            </div>
            <div class="next-button-container">
                <button class="btn" id="nextBtn" style="display:none;">
                    Next Question →
                </button>
            </div>
            <div class="question">What species is this?</div>
            <div class="options">
                ${options.map((option, index) => 
                    this.renderOption(option, index, useScientific)
                ).join('')}
            </div>
            <div class="feedback" id="feedback"></div>
            <div class="species-info" id="speciesInfo" style="display:none;"></div>
            <div class="controls">
                <button class="btn skip" id="skipBtn">Skip</button>
            </div>
        `;

        // Attach event listeners
        document.getElementById('imageContainer').addEventListener('click', () => onImageClick(url));
        document.getElementById('nextBtn').addEventListener('click', onNext);
        document.getElementById('skipBtn').addEventListener('click', onSkip);
        
        options.forEach((option, index) => {
            const optionElement = this.gameContent.querySelectorAll('.option')[index];
            optionElement.addEventListener('click', () => onAnswer(index));
        });
    }

    /**
     * Render a single option button
     * @param {Object} option - Option observation object
     * @param {number} index - Option index
     * @param {boolean} useScientific - Whether to show scientific names prominently
     * @returns {string} HTML string for the option
     */
    renderOption(option, index, useScientific) {
        const taxonomy = INaturalistAPI.getTaxonomyInfo(option.taxon);
        
        if (useScientific) {
            // Hard mode: Scientific name prominent, common name revealed on answer
            return `
                <div class="option" data-index="${index}">
                    <div class="scientific-name">
                        <em>${taxonomy.scientificName}</em>
                    </div>
                    <div class="common-name">${taxonomy.commonName}</div>
                </div>
            `;
        } else {
            // Easy/Medium mode: Common name prominent, scientific name and taxonomy always shown
            return `
                <div class="option" data-index="${index}">
                    <div style="font-size: 1.1em; margin-bottom: 5px;">
                        ${taxonomy.commonName}
                    </div>
                    <div style="font-size: 0.85em; opacity: 0.85; font-style: italic;">
                        <em>${taxonomy.scientificName}</em><br>
                        <span style="font-style: normal;">${taxonomy.genus} • ${taxonomy.family}</span>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Show feedback after user answers or skips
     * @param {boolean} isCorrect - Whether the answer was correct
     * @param {boolean} isSkipped - Whether the question was skipped
     * @param {string} correctName - Name of the correct species
     */
    showFeedback(isCorrect, isSkipped, correctName) {
        const feedback = document.getElementById('feedback');
        
        if (isSkipped) {
            feedback.innerHTML = `⏭️ Skipped. Answer: <strong>${correctName}</strong>`;
            feedback.style.color = '#ffc107';
        } else if (isCorrect) {
            feedback.textContent = '✅ Correct!';
            feedback.style.color = '#4CAF50';
        } else {
            feedback.innerHTML = `❌ Correct: <strong>${correctName}</strong>`;
            feedback.style.color = '#f44336';
        }
    }

    /**
     * Highlight the correct and incorrect options
     * @param {number} selectedIndex - Index of selected option (null if skipped)
     * @param {number} correctIndex - Index of correct option
     */
    highlightOptions(selectedIndex, correctIndex) {
        const options = this.gameContent.querySelectorAll('.option');
        
        options.forEach(option => {
            option.classList.add('disabled');
            option.classList.add('revealed');
        });
        
        if (selectedIndex !== null && selectedIndex !== correctIndex) {
            options[selectedIndex].classList.add('incorrect');
        }
        
        options[correctIndex].classList.add('correct');
    }

    /**
     * Show/hide control buttons
     * @param {boolean} showNext - Whether to show next button
     * @param {boolean} showSkip - Whether to show skip button
     */
    toggleButtons(showNext, showSkip) {
        const nextBtn = document.getElementById('nextBtn');
        const skipBtn = document.getElementById('skipBtn');
        
        if (nextBtn) nextBtn.style.display = showNext ? 'block' : 'none';
        if (skipBtn) skipBtn.style.display = showSkip ? 'block' : 'none';
    }

    /**
     * Update score display
     * @param {Object} scores - Object containing score, streak, total
     */
    updateScore(scores) {
        document.getElementById('score').textContent = scores.score;
        document.getElementById('streak').textContent = scores.streak;
        document.getElementById('total').textContent = scores.total;
        
        const accuracy = scores.total > 0 ? (scores.score / (scores.total * 10)) * 100 : 0;
        document.getElementById('progressFill').style.width = `${accuracy}%`;
    }

    /**
     * Update diversity metrics display
     * @param {number} speciesSeen - Number of unique species encountered
     * @param {number} speciesLearned - Number of species correctly identified
     */
    updateDiversity(speciesSeen, speciesLearned) {
        document.getElementById('speciesSeen').textContent = speciesSeen;
        document.getElementById('speciesLearned').textContent = speciesLearned;
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.gameContent.innerHTML = '<div class="loading">Loading nature data...</div>';
    }

    /**
     * Show error state
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.gameContent.innerHTML = `<div class="loading">⚠️ ${message}</div>`;
    }
}
