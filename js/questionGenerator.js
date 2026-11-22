import { INaturalistAPI } from './api.js';

/**
 * Handles generation of quiz questions from iNaturalist observations
 */
export class QuestionGenerator {
    constructor() {
        this.usedSpecies = new Set();
    }

    /**
     * Reset the used species cache
     */
    reset() {
        this.usedSpecies.clear();
    }

    /**
     * Process observations into quiz questions
     * @param {Array} observations - Array of iNaturalist observations
     * @param {string} difficulty - Difficulty level
     * @param {string} region - Geographic region
     * @returns {Promise<Array>} Array of question objects
     */
    async processObservations(observations, difficulty, region) {
        let validObservations = observations.filter(obs => 
            INaturalistAPI.isValidObservation(obs) &&
            !this.usedSpecies.has(obs.taxon.id)
        );
        
        // If we're running low on observations, clear the cache
        if (validObservations.length < 8) {
            this.reset();
            validObservations = observations.filter(obs => 
                INaturalistAPI.isValidObservation(obs)
            );
        }
        
        const questions = [];
        const used = new Set();
        
        const maxQuestions = Math.min(3, Math.floor(validObservations.length / 4));
        
        for (let i = 0; i < maxQuestions; i++) {
            const availableObs = validObservations.filter(obs => 
                !used.has(obs.taxon.id) && !this.usedSpecies.has(obs.taxon.id)
            );
            
            if (availableObs.length < 1) break;
            
            const correctObservation = availableObs[Math.floor(Math.random() * availableObs.length)];
            used.add(correctObservation.taxon.id);
            this.usedSpecies.add(correctObservation.taxon.id);
            
            let wrongObservations;
            
            // For medium and hard, try to get taxonomically related species
            if (difficulty === 'medium' || difficulty === 'hard') {
                wrongObservations = await this.getRelatedWrongOptions(
                    correctObservation,
                    availableObs,
                    region,
                    used
                );
            } else {
                // Easy mode: any random species
                wrongObservations = this.getRandomWrongOptions(
                    correctObservation,
                    availableObs,
                    used
                );
            }
            
            if (wrongObservations.length === 3) {
                wrongObservations.forEach(obs => used.add(obs.taxon.id));
                questions.push({
                    correct: correctObservation,
                    options: this.shuffleArray([correctObservation, ...wrongObservations]),
                    difficulty: difficulty
                });
            }
        }
        
        return questions;
    }

    /**
     * Get related species as wrong options for medium/hard difficulty
     * @param {Object} correctObservation - The correct answer observation
     * @param {Array} availableObs - Pool of available observations
     * @param {string} region - Geographic region
     * @param {Set} used - Set of already used taxon IDs
     * @returns {Promise<Array>} Array of wrong option observations
     */
    async getRelatedWrongOptions(correctObservation, availableObs, region, used) {
        const wrongObservations = [];
        const targetTaxon = correctObservation.taxon;

        // Strategy 1: Try to find same genus species from available observations
        // NOTE: Using genus_name instead of genus (enriched field)
        if (targetTaxon.genus_name && targetTaxon.genus_name !== 'Unknown') {
            const genusMatches = availableObs.filter(obs => 
                obs.taxon.id !== targetTaxon.id &&
                obs.taxon.genus_name === targetTaxon.genus_name &&
                obs.taxon.genus_name !== 'Unknown' &&
                !used.has(obs.taxon.id)
            );
            wrongObservations.push(...genusMatches);
        }

        // Strategy 2: If not enough, try same family from available observations
        // NOTE: Using family_name instead of family (enriched field)
        if (wrongObservations.length < 3 && targetTaxon.family_name && targetTaxon.family_name !== 'Unknown') {
            const familyMatches = availableObs.filter(obs => 
                obs.taxon.id !== targetTaxon.id &&
                obs.taxon.family_name === targetTaxon.family_name &&
                obs.taxon.family_name !== 'Unknown' &&
                !wrongObservations.find(w => w.taxon.id === obs.taxon.id) &&
                !used.has(obs.taxon.id)
            );
            wrongObservations.push(...familyMatches);
        }

        // Strategy 3: If still not enough, fetch related species from API
        // Note: These are automatically enriched with taxonomy in fetchRelatedSpecies
        if (wrongObservations.length < 3) {
            const relatedSpecies = await INaturalistAPI.fetchRelatedSpecies(
                targetTaxon,
                region,
                10
            );
            
            const filtered = relatedSpecies.filter(obs =>
                !wrongObservations.find(w => w.taxon.id === obs.taxon.id) &&
                !used.has(obs.taxon.id)
            );
            
            wrongObservations.push(...filtered);
        }

        // Strategy 4: Last resort - use any available species
        if (wrongObservations.length < 3) {
            const anySpecies = availableObs.filter(obs => 
                obs.taxon.id !== targetTaxon.id &&
                !wrongObservations.find(w => w.taxon.id === obs.taxon.id) &&
                !used.has(obs.taxon.id)
            );
            wrongObservations.push(...anySpecies);
        }

        // Return exactly 3 options, shuffled
        return this.shuffleArray(wrongObservations).slice(0, 3);
    }

    /**
     * Get random species as wrong options for easy difficulty
     * @param {Object} correctObservation - The correct answer observation
     * @param {Array} availableObs - Pool of available observations
     * @param {Set} used - Set of already used taxon IDs
     * @returns {Array} Array of wrong option observations
     */
    getRandomWrongOptions(correctObservation, availableObs, used) {
        const wrongObservations = availableObs.filter(obs => 
            obs.taxon.id !== correctObservation.taxon.id &&
            !used.has(obs.taxon.id)
        );
        
        return this.shuffleArray(wrongObservations).slice(0, 3);
    }

    /**
     * Shuffle an array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
