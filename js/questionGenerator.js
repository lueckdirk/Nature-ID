import { INaturalistAPI } from './api.js';

/**
 * Handles generation of quiz questions from iNaturalist observations
 * (Used by Classic Quiz mode)
 */
export class QuestionGenerator {
    constructor() {
        this.usedSpecies = new Set();
    }

    reset() {
        this.usedSpecies.clear();
    }

    async processObservations(observations, difficulty, region) {
        let validObservations = observations.filter(obs =>
            INaturalistAPI.isValidObservation(obs) &&
            !this.usedSpecies.has(obs.taxon.id)
        );

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
            if (difficulty === 'medium' || difficulty === 'hard') {
                wrongObservations = await this.getRelatedWrongOptions(correctObservation, availableObs, region, used);
            } else {
                wrongObservations = this.getRandomWrongOptions(correctObservation, availableObs, used);
            }

            if (wrongObservations.length === 3) {
                wrongObservations.forEach(obs => used.add(obs.taxon.id));
                questions.push({
                    correct: correctObservation,
                    options: this.shuffleArray([correctObservation, ...wrongObservations]),
                    difficulty
                });
            }
        }

        return questions;
    }

    async getRelatedWrongOptions(correctObservation, availableObs, region, used) {
        const wrongObservations = [];
        const targetTaxon = correctObservation.taxon;

        if (targetTaxon.genus_name && targetTaxon.genus_name !== 'Unknown') {
            const genusMatches = availableObs.filter(obs =>
                obs.taxon.id !== targetTaxon.id &&
                obs.taxon.genus_name === targetTaxon.genus_name &&
                obs.taxon.genus_name !== 'Unknown' &&
                !used.has(obs.taxon.id)
            );
            wrongObservations.push(...genusMatches);
        }

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

        if (wrongObservations.length < 3) {
            const relatedSpecies = await INaturalistAPI.fetchRelatedSpecies(targetTaxon, region, 10);
            const filtered = relatedSpecies.filter(obs =>
                !wrongObservations.find(w => w.taxon.id === obs.taxon.id) &&
                !used.has(obs.taxon.id)
            );
            wrongObservations.push(...filtered);
        }

        if (wrongObservations.length < 3) {
            const anySpecies = availableObs.filter(obs =>
                obs.taxon.id !== targetTaxon.id &&
                !wrongObservations.find(w => w.taxon.id === obs.taxon.id) &&
                !used.has(obs.taxon.id)
            );
            wrongObservations.push(...anySpecies);
        }

        return this.shuffleArray(wrongObservations).slice(0, 3);
    }

    getRandomWrongOptions(correctObservation, availableObs, used) {
        const wrongObservations = availableObs.filter(obs =>
            obs.taxon.id !== correctObservation.taxon.id &&
            !used.has(obs.taxon.id)
        );
        return this.shuffleArray(wrongObservations).slice(0, 3);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
