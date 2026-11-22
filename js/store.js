/**
 * localStorage wrapper for all persistent data
 */
export class Store {
    static _get(key, fallback) {
        try {
            const v = localStorage.getItem('nid_' + key);
            return v ? JSON.parse(v) : fallback;
        } catch {
            return fallback;
        }
    }

    static _set(key, val) {
        try {
            localStorage.setItem('nid_' + key, JSON.stringify(val));
        } catch (e) {
            console.warn('localStorage write failed:', e);
        }
    }

    // ── Custom Decks ──
    static getDecks() { return this._get('decks', []); }
    static saveDecks(decks) { this._set('decks', decks); }

    // ── Spaced Repetition Data ──
    static getSR() { return this._get('sr', {}); }
    static saveSR(sr) { this._set('sr', sr); }

    // ── Species Cache (per deck) ──
    static getSpeciesCache(deckId) { return this._get('cache_' + deckId, null); }
    static saveSpeciesCache(deckId, data) {
        this._set('cache_' + deckId, { ts: Date.now(), species: data });
    }

    // ── Settings ──
    static getSettings() {
        return this._get('settings', { sessionSize: 15 });
    }
    static saveSettings(s) { this._set('settings', s); }

    // ── Study Log (streak tracking) ──
    static getStudyLog() {
        return this._get('studylog', { sessions: 0, lastDate: null, streak: 0 });
    }
    static saveStudyLog(log) { this._set('studylog', log); }
}
