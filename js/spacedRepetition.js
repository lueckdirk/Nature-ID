import { SR_INTERVALS, BOX_LABELS } from './config.js';

/**
 * Leitner box spaced repetition system
 */
export class SpacedRepetition {
    /**
     * Check if a card is due for review
     * @param {Object|null} cardData - SR data for the card
     * @returns {boolean}
     */
    static isDue(cardData) {
        if (!cardData) return true; // new card is always due
        return Date.now() >= (cardData.nextReview || 0);
    }

    /**
     * Update a card's SR data after a review
     * @param {Object|null} cardData - Current SR data
     * @param {number} quality - 0=wrong, 1=hard/sorta, 2=easy/knew it
     * @returns {Object} Updated SR data
     */
    static update(cardData, quality) {
        const d = cardData ? { ...cardData } : { box: 0, correct: 0, incorrect: 0 };

        if (quality === 0) {
            d.box = 0;
            d.incorrect = (d.incorrect || 0) + 1;
        } else {
            d.box = Math.min((d.box || 0) + (quality === 2 ? 2 : 1), 5);
            d.correct = (d.correct || 0) + 1;
        }

        d.lastReview = Date.now();
        const days = SR_INTERVALS[Math.min(d.box, SR_INTERVALS.length - 1)];
        d.nextReview = Date.now() + days * 86400000;
        return d;
    }

    /**
     * Sort species by SR priority (due first, then new, then lower boxes)
     * @param {Array} speciesList - Array of species objects
     * @param {Object} srData - SR data keyed by species id
     * @returns {Array} Sorted copy
     */
    static sortByPriority(speciesList, srData) {
        return [...speciesList].sort((a, b) => {
            const ad = srData[a.id], bd = srData[b.id];
            const aDue = this.isDue(ad), bDue = this.isDue(bd);
            const aNew = !ad, bNew = !bd;
            if (aDue && !bDue) return -1;
            if (!aDue && bDue) return 1;
            if (aNew && !bNew) return -1;
            if (!aNew && bNew) return 1;
            return (ad?.box || 0) - (bd?.box || 0);
        });
    }

    /**
     * Get mastery stats for a deck
     * @param {Array} speciesList - Array of species
     * @param {Object} srData - SR data
     * @returns {Object} { pct, mastered, learning, newCount, total }
     */
    static getDeckMastery(speciesList, srData) {
        if (!speciesList || speciesList.length === 0) {
            return { pct: 0, mastered: 0, learning: 0, newCount: 0, total: 0 };
        }
        let mastered = 0, learning = 0, newCount = 0;
        for (const sp of speciesList) {
            const d = srData[sp.id];
            if (!d) newCount++;
            else if (d.box >= 4) mastered++;
            else learning++;
        }
        return {
            pct: Math.round((mastered / speciesList.length) * 100),
            mastered, learning, newCount,
            total: speciesList.length
        };
    }

    /**
     * Get human-readable box label
     * @param {number} box - Box number (0-5)
     * @returns {string}
     */
    static getBoxLabel(box) {
        return BOX_LABELS[Math.min(box || 0, BOX_LABELS.length - 1)];
    }
}
