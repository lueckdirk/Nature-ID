import { INaturalistAPI } from './api.js';
import { QuestionGenerator } from './questionGenerator.js';
import { UIRenderer } from './uiRenderer.js';
import { ModalHandler } from './modalHandler.js';
import { API_CONFIG, SCORE_VALUES } from './config.js';

/**
 * Main game controller class
 */
export class NatureGame {
    constructor() {
        // Game state
        this.score = 0;
        this.streak = 0;
        this.total = 0;
        this.currentQuestion = null;
        this.questionQueue = [];
        
        // Diversity tracking
        this.speciesEncountered = new Set();
        this.speciesCorrect = new Set();
        
        // Components
        this.questionGenerator = new QuestionGenerator();
        this.uiRenderer = new UIRenderer(document.getElementById('gameContent'));
        this.modalHandler = new ModalHandler();
        
        // DOM elements
        this.categorySelect = document.getElementById('categorySelect');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.regionSelect = document.getElementById('regionSelect');
        
        this.init();
    }

    /**
     * Initialize the game
     */
    async init() {
        // Add event listeners for settings changes
        [this.categorySelect, this.difficultySelect, this.regionSelect].forEach(select => {
            select.addEventListener('change', () => this.handleSettingsChange());
        });

        // Load initial questions
        await this.preloadQuestions();
        this.loadNextQuestion();
    }

    /**
     * Handle changes to game settings
     */
    async handleSettingsChange() {
        this.questionGenerator.reset();
        this.questionQueue = [];
        this.uiRenderer.showLoading();
        await this.preloadQuestions();
        this.loadNextQuestion();
    }

    /**
     * Preload questions into the queue
     */
    async preloadQuestions() {
        while (this.questionQueue.length < API_CONFIG.PRELOAD_QUEUE_SIZE) {
            const observations = await INaturalistAPI.fetchObservations(
                this.categorySelect.value,
                this.difficultySelect.value,
                this.regionSelect.value
            );

            if (observations && observations.length > 0) {
                const questions = await this.questionGenerator.processObservations(
                    observations,
                    this.difficultySelect.value,
                    this.regionSelect.value
                );
                this.questionQueue.push(...questions);
            } else {
                break;
            }

            // Ensure we have at least some questions
            if (this.questionQueue.length >= API_CONFIG.MIN_QUESTIONS_PER_FETCH) {
                break;
            }
        }
    }

    /**
     * Load and display the next question
     */
    async loadNextQuestion() {
        // Preload more questions if running low
        if (this.questionQueue.length < 2) {
            this.preloadQuestions();
        }

        if (this.questionQueue.length > 0) {
            this.currentQuestion = this.questionQueue.shift();
            this.trackSpeciesEncountered(this.currentQuestion.correct.taxon.id);
            
            this.uiRenderer.renderQuestion(
                this.currentQuestion,
                (index) => this.handleAnswer(index),
                () => this.handleSkip(),
                () => this.loadNextQuestion(),
                (url) => this.modalHandler.open(url)
            );
        } else {
            this.uiRenderer.showError('No questions available. Try different settings.');
        }
    }

    /**
     * Handle user answer selection
     * @param {number} selectedIndex - Index of selected option
     */
    handleAnswer(selectedIndex) {
        const correctIndex = this.currentQuestion.options.findIndex(
            option => option.taxon.id === this.currentQuestion.correct.taxon.id
        );

        const isCorrect = selectedIndex === correctIndex;

        // Update score
        if (isCorrect) {
            this.score += SCORE_VALUES.CORRECT;
            this.streak += 1;
            this.trackSpeciesLearned(this.currentQuestion.correct.taxon.id);
        } else {
            this.streak = 0;
        }

        this.total += 1;

        // Update UI
        this.uiRenderer.highlightOptions(selectedIndex, correctIndex);
        this.uiRenderer.showFeedback(
            isCorrect,
            false,
            this.currentQuestion.correct.taxon.preferred_common_name
        );
        this.uiRenderer.toggleButtons(true, false);
        this.updateAllScores();
    }

    /**
     * Handle skip action
     */
    handleSkip() {
        const correctIndex = this.currentQuestion.options.findIndex(
            option => option.taxon.id === this.currentQuestion.correct.taxon.id
        );

        this.total += 1;
        this.streak = 0;

        // Update UI
        this.uiRenderer.highlightOptions(null, correctIndex);
        this.uiRenderer.showFeedback(
            false,
            true,
            this.currentQuestion.correct.taxon.preferred_common_name
        );
        this.uiRenderer.toggleButtons(true, false);
        this.updateAllScores();
    }

    /**
     * Track a species as encountered
     * @param {number} taxonId - Taxon ID to track
     */
    trackSpeciesEncountered(taxonId) {
        this.speciesEncountered.add(taxonId);
        this.updateDiversityMetrics();
    }

    /**
     * Track a species as correctly identified
     * @param {number} taxonId - Taxon ID to track
     */
    trackSpeciesLearned(taxonId) {
        this.speciesCorrect.add(taxonId);
        this.updateDiversityMetrics();
    }

    /**
     * Update all score displays
     */
    updateAllScores() {
        this.uiRenderer.updateScore({
            score: this.score,
            streak: this.streak,
            total: this.total
        });
    }

    /**
     * Update diversity metrics display
     */
    updateDiversityMetrics() {
        this.uiRenderer.updateDiversity(
            this.speciesEncountered.size,
            this.speciesCorrect.size
        );
    }
}
