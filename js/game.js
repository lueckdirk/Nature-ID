import { INaturalistAPI } from './api.js';
import { QuestionGenerator } from './questionGenerator.js';
import { UIRenderer } from './uiRenderer.js';
import { ModalHandler } from './modalHandler.js';
import { SpacedRepetition } from './spacedRepetition.js';
import { Store } from './store.js';
import { API_CONFIG, PRESET_DECKS, SCORE_VALUES,
    DRIFTLESS_TREE_GENERA, DRIFTLESS_SHRUB_GENERA, WI_NR40_INVASIVES, WIDNR_FACT_URL } from './config.js';

/**
 * Main application controller — manages views, decks, sessions, and classic mode
 */
export class NatureGame {
    constructor() {
        this.ui = new UIRenderer(document.getElementById('app'));
        this.modalHandler = new ModalHandler();
        this.questionGenerator = new QuestionGenerator();

        // Session state
        this.state = {
            view: 'library',
            activeDeck: null,
            sessionMode: 'quiz',
            sessionCards: [],
            cardIndex: 0,
            sessionScore: 0,
            sessionStreak: 0,
            answered: false,
            revealed: false,
            selectedAnswer: -1,
        };

        // Modal state (create deck)
        this.modalState = {
            show: false,
            placeResults: [],
            taxaResults: [],
            selectedPlace: null,
            selectedCategory: 'all_plants',
            selectedTaxon: null,
        };

        // Classic mode state
        this.classic = {
            score: 0, streak: 0, total: 0,
            currentQuestion: null,
            questionQueue: [],
        };

        this._searchTimeout = null;

        // Delegate events
        document.getElementById('app').addEventListener('click', e => this.handleClick(e));
        document.getElementById('app').addEventListener('input', e => this.handleInput(e));
        document.getElementById('app').addEventListener('change', e => this.handleChange(e));

        this.render();
    }

    // ── Render dispatcher ──
    render() {
        const s = this.state;
        switch (s.view) {
            case 'library': this.ui.renderLibrary(); break;
            case 'deckDetail': this.ui.renderDeckDetail(s.activeDeck); break;
            case 'loading': this.ui.renderLoading(); break;
            case 'session': this.ui.renderSession(s); break;
            case 'summary': this.ui.renderSummary(s); break;
            case 'error': this.ui.renderError(s.errorMessage); break;
            case 'classic': /* handled separately */ break;
        }
        if (this.modalState.show) {
            const overlay = document.createElement('div');
            overlay.id = 'modalOverlay';
            overlay.innerHTML = this.ui.renderCreateModal(this.modalState);
            document.getElementById('app').appendChild(overlay.firstElementChild);
        }
    }

    setState(updates) {
        Object.assign(this.state, updates);
        this.render();
    }

    // ══════════════════════════════════════
    // EVENT HANDLING
    // ══════════════════════════════════════
    handleClick(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;

        switch (action) {
            case 'goLibrary':
                this.state.view = 'library';
                this.state.activeDeck = null;
                this.modalState.show = false;
                this.render();
                break;
            case 'openDeck':
                this.openDeck(target.dataset.deckId);
                break;
            case 'openClassic':
                this.startClassicMode();
                break;
            case 'startSession':
                this.startSession(target.dataset.mode);
                break;
            case 'selectAnswer':
                this.selectAnswer(parseInt(target.dataset.index));
                break;
            case 'revealCard':
                this.state.revealed = true;
                this.render();
                break;
            case 'rateConfidence':
                this.rateConfidence(parseInt(target.dataset.quality));
                break;
            case 'nextCard':
                this.nextCard();
                break;
            case 'endSession':
                this.goToSummary();
                break;
            case 'zoomImage': {
                const url = target.dataset.url;
                if (url) this.modalHandler.open(url);
                break;
            }

            // Create deck modal
            case 'createDeck':
                this.modalState = {
                    show: true,
                    placeResults: [], taxaResults: [],
                    selectedPlace: null, selectedCategory: 'all_plants', selectedTaxon: null,
                };
                this.render();
                break;
            case 'closeModal':
                if (e.target === e.currentTarget || target.classList.contains('modal-close')) {
                    this.modalState.show = false;
                    this.render();
                }
                break;
            case 'selectPlace':
                this.modalState.selectedPlace = {
                    id: parseInt(target.dataset.placeId),
                    name: target.dataset.placeName
                };
                this.modalState.placeResults = [];
                this.render();
                break;
            case 'selectCategory':
                this.modalState.selectedCategory = target.dataset.category;
                this.render();
                break;
            case 'selectTaxon': {
                const id = parseInt(target.dataset.taxonId);
                const t = this.modalState.taxaResults.find(t => t.id === id);
                this.modalState.selectedTaxon = t || {
                    id, name: target.dataset.taxonSci,
                    preferred_common_name: target.dataset.taxonName
                };
                this.modalState.taxaResults = [];
                this.render();
                break;
            }
            case 'submitCreateDeck':
                this.submitCreateDeck();
                break;
            case 'deleteDeck':
                this.deleteDeck(target.dataset.deckId);
                break;

            // Classic mode
            case 'classicAnswer':
                this.handleClassicAnswer(parseInt(target.dataset.index));
                break;
            case 'classicSkip':
                this.handleClassicSkip();
                break;
            case 'classicNext':
                this.loadClassicQuestion();
                break;
        }
    }

    handleInput(e) {
        const target = e.target;
        if (target.dataset.action === 'searchPlace') {
            clearTimeout(this._searchTimeout);
            const val = target.value;
            this._searchTimeout = setTimeout(async () => {
                this.modalState.placeResults = await INaturalistAPI.searchPlaces(val);
                this.render();
                const el = document.getElementById('placeSearch');
                if (el) { el.value = val; el.focus(); }
            }, 300);
        }
        if (target.dataset.action === 'searchTaxa') {
            clearTimeout(this._searchTimeout);
            const val = target.value;
            this._searchTimeout = setTimeout(async () => {
                this.modalState.taxaResults = await INaturalistAPI.searchTaxa(val);
                this.render();
                const el = document.getElementById('taxonSearch');
                if (el) { el.value = val; el.focus(); }
            }, 300);
        }
    }

    handleChange(e) {
        if (e.target.dataset.action === 'setSessionSize') {
            const settings = Store.getSettings();
            settings.sessionSize = parseInt(e.target.value);
            Store.saveSettings(settings);
        }
        // Classic mode setting changes
        if (['categorySelect', 'difficultySelect', 'regionSelect'].includes(e.target.id)) {
            this.handleClassicSettingsChange();
        }
    }

    // ══════════════════════════════════════
    // DECK ACTIONS
    // ══════════════════════════════════════
    openDeck(deckId) {
        const deck = PRESET_DECKS.find(p => p.id === deckId) || Store.getDecks().find(d => d.id === deckId);
        if (!deck) return;
        this.setState({ view: 'deckDetail', activeDeck: deck });
    }

    async startSession(mode) {
        const deck = this.state.activeDeck;
        if (!deck) return;
        this.setState({ view: 'loading' });

        try {
            let species = [];
            const cache = Store.getSpeciesCache(deck.id);
            const cacheAge = cache ? Date.now() - cache.ts : Infinity;

            // Cache version 2: invalidates old caches that may contain wrong species
            // (prior version had hardcoded wrong genus IDs returning insects/arachnids)
            const CACHE_VERSION = 3;
            if (cache && cacheAge < API_CONFIG.CACHE_TTL && cache.version === CACHE_VERSION) {
                species = cache.species;
            } else {
                // ── Fetch species based on deck source type ──
                let results;
                if (deck.source === 'tree_genera') {
                    // Multi-genus: fires parallel queries for each tree genus
                    results = await INaturalistAPI.multiGenusSpeciesCounts(
                        DRIFTLESS_TREE_GENERA, deck.query
                    );
                } else if (deck.source === 'shrub_genera') {
                    results = await INaturalistAPI.multiGenusSpeciesCounts(
                        DRIFTLESS_SHRUB_GENERA, deck.query
                    );
                } else if (deck.source === 'nr40') {
                    // Curated NR40 deck
                    results = await INaturalistAPI.fetchNR40Species(deck.query);
                } else {
                    // Standard single-query deck
                    results = await INaturalistAPI.speciesCounts(deck.query);
                }

                // ── Determine introduced status ──
                // If the deck has establishment: 'introduced', ALL species in results are introduced.
                // Otherwise, cross-reference against a parallel introduced query for the place.
                let introducedIds = null;
                if (deck.establishment === 'introduced') {
                    // Everything returned is introduced — no cross-reference needed
                    introducedIds = null; // signal to mark all as introduced
                } else if (deck.query.place_id) {
                    // Fetch introduced species IDs for this place and cross-reference
                    introducedIds = await INaturalistAPI.fetchIntroducedIds(deck.query.place_id);
                }

                species = results
                    .filter(r => r.taxon && r.taxon.default_photo && r.taxon.preferred_common_name)
                    .map(r => {
                        // Determine introduced status correctly
                        let isIntroduced;
                        if (deck.establishment === 'introduced') {
                            isIntroduced = true;
                        } else if (introducedIds) {
                            isIntroduced = introducedIds.has(r.taxon.id);
                        } else {
                            isIntroduced = false; // no place context, can't determine
                        }

                        return {
                            id: r.taxon.id,
                            sciName: r.taxon.name,
                            commonName: r.taxon.preferred_common_name,
                            defaultPhoto: INaturalistAPI.getPhotoUrl(r.taxon),
                            obsCount: r.count,
                            introduced: isIntroduced,
                            iconic: r.taxon.iconic_taxon_name,
                            wikipediaUrl: r.taxon.wikipedia_url,
                            nr40: r.taxon._nr40 || null, // NR40 metadata if available
                        };
                    });
                Store.saveSpeciesCache(deck.id, species, CACHE_VERSION);
            }

            if (species.length < 4) {
                this.setState({
                    view: 'error',
                    errorMessage: `Only found ${species.length} species with photos. Try a broader search or different region.`
                });
                return;
            }

            const sr = Store.getSR();
            const sorted = SpacedRepetition.sortByPriority(species, sr);
            const sessionSize = Math.min(Store.getSettings().sessionSize, sorted.length);
            const sessionSpecies = sorted.slice(0, sessionSize);

            const sessionCards = sessionSpecies.map(sp => {
                const sameGroup = species.filter(s => s.id !== sp.id && s.iconic === sp.iconic);
                const pool = sameGroup.length >= 3 ? sameGroup : species.filter(s => s.id !== sp.id);
                const wrongAnswers = this._shuffle(pool).slice(0, 3);
                const options = this._shuffle([
                    { commonName: sp.commonName, sciName: sp.sciName, id: sp.id },
                    ...wrongAnswers.map(w => ({ commonName: w.commonName, sciName: w.sciName, id: w.id }))
                ]);
                const correctIndex = options.findIndex(o => o.id === sp.id);
                return { ...sp, photoUrl: sp.defaultPhoto, options, correctIndex };
            });

            // Background: fetch varied photos
            this._fetchVariedPhotos(sessionCards, deck.query.place_id);

            this.setState({
                view: 'session',
                sessionMode: mode,
                sessionCards,
                cardIndex: 0,
                sessionScore: 0,
                sessionStreak: 0,
                answered: false,
                revealed: false,
                selectedAnswer: -1,
            });
        } catch (err) {
            console.error('Failed to start session:', err);
            this.setState({ view: 'error', errorMessage: 'Could not load species data. The iNaturalist API might be temporarily unavailable.' });
        }
    }

    async _fetchVariedPhotos(cards, placeId) {
        // Track which photo URLs we've used this session to avoid repeats
        const usedPhotos = new Set(cards.map(c => c.photoUrl).filter(Boolean));

        for (let i = 0; i < cards.length; i++) {
            try {
                const photos = await INaturalistAPI.getObservationPhotos(cards[i].id, placeId, 12);
                if (photos.length > 0) {
                    // Pick a photo we haven't used yet, or fall back to any
                    const unused = photos.filter(p => !usedPhotos.has(p));
                    const pick = unused.length > 0
                        ? unused[Math.floor(Math.random() * unused.length)]
                        : photos[Math.floor(Math.random() * photos.length)];
                    cards[i].photoUrl = pick;
                    usedPhotos.add(pick);
                    if (this.state.view === 'session' && this.state.cardIndex === i &&
                        !this.state.answered && !this.state.revealed) {
                        this.render();
                    }
                }
            } catch {}
        }
    }

    selectAnswer(index) {
        if (this.state.answered) return;
        const card = this.state.sessionCards[this.state.cardIndex];
        const isCorrect = index === card.correctIndex;
        const sr = Store.getSR();
        sr[card.id] = SpacedRepetition.update(sr[card.id], isCorrect ? 2 : 0);
        Store.saveSR(sr);

        this.setState({
            answered: true,
            selectedAnswer: index,
            sessionScore: this.state.sessionScore + (isCorrect ? 1 : 0),
            sessionStreak: isCorrect ? this.state.sessionStreak + 1 : 0,
        });
    }

    rateConfidence(quality) {
        const card = this.state.sessionCards[this.state.cardIndex];
        const sr = Store.getSR();
        sr[card.id] = SpacedRepetition.update(sr[card.id], quality);
        Store.saveSR(sr);

        this.setState({
            answered: true,
            sessionScore: this.state.sessionScore + (quality >= 2 ? 1 : 0),
            sessionStreak: quality >= 2 ? this.state.sessionStreak + 1 : (quality === 0 ? 0 : this.state.sessionStreak),
        });
    }

    nextCard() {
        const nextIndex = this.state.cardIndex + 1;
        if (nextIndex >= this.state.sessionCards.length) {
            this.goToSummary();
            return;
        }
        this.setState({ cardIndex: nextIndex, answered: false, revealed: false, selectedAnswer: -1 });
    }

    goToSummary() {
        const log = Store.getStudyLog();
        const today = new Date().toDateString();
        log.sessions = (log.sessions || 0) + 1;
        if (log.lastDate !== today) {
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            log.streak = log.lastDate === yesterday ? (log.streak || 0) + 1 : 1;
            log.lastDate = today;
        }
        Store.saveStudyLog(log);
        this.setState({ view: 'summary' });
    }

    // ══════════════════════════════════════
    // CREATE / DELETE DECK
    // ══════════════════════════════════════
    submitCreateDeck() {
        const s = this.modalState;
        const nameEl = document.getElementById('deckName');
        const name = nameEl?.value?.trim() || `Custom Deck ${Date.now() % 1000}`;
        const place = s.selectedPlace;
        if (!place) return;

        const query = { place_id: place.id, quality_grade: 'research', rank: 'species', per_page: 200, photos: true };

        switch (s.selectedCategory) {
            case 'all_plants': query.iconic_taxa = 'Plantae'; break;
            case 'invasive_plants': query.iconic_taxa = 'Plantae'; query.introduced = true; break;
            case 'all_animals': query.iconic_taxa = 'Animalia'; break;
            case 'all_life': break;
            case 'custom_taxon':
                if (s.selectedTaxon) query.taxon_id = s.selectedTaxon.id;
                break;
        }

        const deck = {
            id: 'custom_' + Date.now(),
            name,
            icon: s.selectedCategory === 'invasive_plants' ? '⚠️' :
                  s.selectedCategory === 'all_animals' ? '🦌' :
                  s.selectedCategory === 'custom_taxon' ? '🔍' : '🌿',
            description: `${place.name}${s.selectedCategory === 'invasive_plants' ? ' · Invasives' : ''}`,
            query,
            // Tag invasive decks so all results get marked as introduced
            ...(s.selectedCategory === 'invasive_plants' ? { establishment: 'introduced' } : {}),
        };

        const decks = Store.getDecks();
        decks.push(deck);
        Store.saveDecks(decks);
        this.modalState.show = false;
        this.setState({ view: 'library' });
    }

    deleteDeck(deckId) {
        if (!confirm('Delete this custom deck?')) return;
        const decks = Store.getDecks().filter(d => d.id !== deckId);
        Store.saveDecks(decks);
        try { localStorage.removeItem('nid_cache_' + deckId); } catch {}
        this.setState({ view: 'library', activeDeck: null });
    }

    // ══════════════════════════════════════
    // CLASSIC QUIZ MODE (original game)
    // ══════════════════════════════════════
    async startClassicMode() {
        this.state.view = 'classic';
        this.classic = { score: 0, streak: 0, total: 0, currentQuestion: null, questionQueue: [] };
        this.questionGenerator.reset();
        this.ui.renderClassicQuiz();
        await this.preloadClassicQuestions();
        this.loadClassicQuestion();
    }

    async handleClassicSettingsChange() {
        this.questionGenerator.reset();
        this.classic.questionQueue = [];
        this.ui.showClassicLoading();
        await this.preloadClassicQuestions();
        this.loadClassicQuestion();
    }

    async preloadClassicQuestions() {
        const cat = document.getElementById('categorySelect')?.value || 'all';
        const diff = document.getElementById('difficultySelect')?.value || 'easy';
        const reg = document.getElementById('regionSelect')?.value || 'global';

        while (this.classic.questionQueue.length < API_CONFIG.PRELOAD_QUEUE_SIZE) {
            const obs = await INaturalistAPI.fetchObservations(cat, diff, reg);
            if (obs && obs.length > 0) {
                const questions = await this.questionGenerator.processObservations(obs, diff, reg);
                this.classic.questionQueue.push(...questions);
            } else break;
            if (this.classic.questionQueue.length >= API_CONFIG.MIN_QUESTIONS_PER_FETCH) break;
        }
    }

    async loadClassicQuestion() {
        if (this.classic.questionQueue.length < 2) {
            this.preloadClassicQuestions();
        }
        if (this.classic.questionQueue.length > 0) {
            this.classic.currentQuestion = this.classic.questionQueue.shift();
            const diff = document.getElementById('difficultySelect')?.value || 'easy';
            this.ui.renderClassicQuestion(this.classic.currentQuestion, diff);
        } else {
            this.ui.showClassicError('No questions available. Try different settings.');
        }
    }

    handleClassicAnswer(selectedIndex) {
        const q = this.classic.currentQuestion;
        if (!q) return;
        const correctIndex = q.options.findIndex(o => o.taxon.id === q.correct.taxon.id);
        const isCorrect = selectedIndex === correctIndex;

        if (isCorrect) {
            this.classic.score += SCORE_VALUES.CORRECT;
            this.classic.streak += 1;
        } else {
            this.classic.streak = 0;
        }
        this.classic.total += 1;

        this.ui.showClassicFeedback(selectedIndex, correctIndex, q.correct.taxon.preferred_common_name);
        this.ui.updateClassicScore(this.classic.score, this.classic.streak, this.classic.total);
    }

    handleClassicSkip() {
        const q = this.classic.currentQuestion;
        if (!q) return;
        const correctIndex = q.options.findIndex(o => o.taxon.id === q.correct.taxon.id);
        this.classic.total += 1;
        this.classic.streak = 0;
        this.ui.showClassicFeedback(null, correctIndex, q.correct.taxon.preferred_common_name);
        this.ui.updateClassicScore(this.classic.score, this.classic.streak, this.classic.total);
    }

    // ── Utils ──
    _shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
}
